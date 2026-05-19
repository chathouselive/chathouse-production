// =============================================================================
// enrich-listing-schools Edge Function — v1.2
// -----------------------------------------------------------------------------
// Links listings to nearby schools (within 2 miles) using the schools table.
//
// v1.2 architecture:
//   - Thin wrapper around two Postgres RPCs:
//     * find_listings_needing_enrichment(p_limit) — returns listings without
//       any listing_schools rows yet (uses NOT EXISTS, no row-cap traps)
//     * enrich_listing_with_nearby_schools(p_listing_id, p_lat, p_lng,
//       p_radius_m, p_max_schools) — atomic per-listing enrichment
//
//   - Per-listing latency dropped from ~300ms (4 round-trips) to ~50ms
//     (single RPC). Race window between delete and insert is eliminated.
//
// Inputs (POST body, all optional):
//   {
//     "listing_ids": [123, 456],   // process specific listings
//     "limit": 100                  // max to process if listing_ids omitted
//   }
//   No body = process listings without any listing_schools rows yet (cron mode).
//
// Required env vars:
//   - SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto-injected)
// =============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// -----------------------------------------------------------------------------
// Config
// -----------------------------------------------------------------------------

const SYNC_KEY = "school_enrichment";
const RADIUS_MILES = 2;
const RADIUS_METERS = RADIUS_MILES * 1609.34;
const MAX_SCHOOLS_PER_LISTING = 10;
const DEFAULT_BATCH_LIMIT = 100;
const MAX_BATCH_LIMIT = 500;
const MAX_RUNTIME_MS = 60_000; // 60 seconds

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// =============================================================================
// Handler
// =============================================================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const startedAt = Date.now();
  const log: string[] = [];

  function logStep(message: string) {
    const elapsed = Date.now() - startedAt;
    const line = `[+${elapsed}ms] ${message}`;
    log.push(line);
    console.log(line);
  }

  function elapsed(): number {
    return Date.now() - startedAt;
  }

  try {
    logStep("enrich-listing-schools v1.2 invoked");

    // -------------------------------------------------------------------------
    // 1. Verify env vars
    // -------------------------------------------------------------------------
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return errorResponse(500, "Supabase service role credentials not available", log);
    }

    // -------------------------------------------------------------------------
    // 2. Parse request body
    // -------------------------------------------------------------------------
    let body: { listing_ids?: number[]; limit?: number } = {};
    if (req.method === "POST") {
      try {
        const text = await req.text();
        if (text.trim().length > 0) {
          body = JSON.parse(text);
        }
      } catch (err: any) {
        return errorResponse(400, `Invalid JSON body: ${err?.message}`, log);
      }
    }

    const explicitListingIds = Array.isArray(body.listing_ids) ? body.listing_ids : null;
    const limit = Math.min(
      Math.max(1, Number(body.limit) || DEFAULT_BATCH_LIMIT),
      MAX_BATCH_LIMIT
    );

    logStep(
      explicitListingIds
        ? `explicit batch: ${explicitListingIds.length} listing(s)`
        : `cron mode: up to ${limit} listings without school links`
    );

    // -------------------------------------------------------------------------
    // 3. Create Supabase client
    // -------------------------------------------------------------------------
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // -------------------------------------------------------------------------
    // 4. Load listings to process
    // -------------------------------------------------------------------------
    const listings = await loadListings(supabase, explicitListingIds, limit, logStep);

    if (listings.length === 0) {
      logStep("no listings to process");
      const stats = makeEmptyStats();
      await writeSyncState(supabase, "ok", "no listings to process", logStep);
      return successResponse({
        ok: true,
        status: "ok",
        stats,
        elapsed_ms: elapsed(),
        log,
      });
    }

    logStep(`loaded ${listings.length} listing(s) for enrichment`);

    // -------------------------------------------------------------------------
    // 5. Enrich each listing via RPC
    // -------------------------------------------------------------------------
    const stats = makeEmptyStats();

    for (const listing of listings) {
      if (elapsed() >= MAX_RUNTIME_MS) {
        stats.hit_timeout = true;
        logStep(`hit MAX_RUNTIME_MS (${MAX_RUNTIME_MS}ms), stopping`);
        break;
      }

      stats.processed++;

      // Defensive filters (also enforced by find_listings_needing_enrichment
      // for cron mode, but needed for explicit-ids path).
      if (listing.lat === null || listing.lng === null) {
        stats.skipped_no_coords++;
        continue;
      }
      if (listing.archived_at !== null) {
        stats.skipped_archived++;
        continue;
      }

      try {
        const { data, error } = await supabase.rpc("enrich_listing_with_nearby_schools", {
          p_listing_id:    listing.id,
          p_lat:           listing.lat,
          p_lng:           listing.lng,
          p_radius_meters: RADIUS_METERS,
          p_max_schools:   MAX_SCHOOLS_PER_LISTING,
        });

        if (error) throw new Error(error.message);

        const linked = typeof data === "number" ? data : 0;
        stats.schools_linked += linked;
      } catch (err: any) {
        stats.errors++;
        stats.error_details.push(`listing ${listing.id}: ${err?.message || String(err)}`);
        logStep(`ERROR enriching listing ${listing.id}: ${err?.message}`);
      }
    }

    // -------------------------------------------------------------------------
    // 6. Update sync state
    // -------------------------------------------------------------------------
    const status = determineStatus(stats);
    const logSummary =
      `processed=${stats.processed} linked=${stats.schools_linked} ` +
      `skipped_no_coords=${stats.skipped_no_coords} ` +
      `skipped_archived=${stats.skipped_archived} ` +
      `errors=${stats.errors}`;

    await writeSyncState(supabase, status, logSummary, logStep);

    logStep(`done: ${logSummary}`);

    return successResponse({
      ok: status === "ok",
      status,
      stats,
      elapsed_ms: elapsed(),
      log,
    });
  } catch (err: any) {
    logStep(`UNEXPECTED ERROR: ${err?.message || String(err)}`);
    return errorResponse(500, err?.message || "Internal error", log);
  }
});

// =============================================================================
// Listing selection
// =============================================================================

async function loadListings(
  supabase: any,
  explicitIds: number[] | null,
  limit: number,
  logStep: (m: string) => void
): Promise<{ id: number; lat: number | null; lng: number | null; archived_at: string | null }[]> {
  if (explicitIds && explicitIds.length > 0) {
    const { data, error } = await supabase
      .from("listings")
      .select("id, lat, lng, archived_at")
      .in("id", explicitIds);

    if (error) throw new Error(`loadListings (explicit) failed: ${error.message}`);
    return data || [];
  }

  // Cron mode: delegate to RPC which uses NOT EXISTS (no row-cap traps).
  const { data, error } = await supabase.rpc("find_listings_needing_enrichment", {
    p_limit: limit,
  });

  if (error) throw new Error(`loadListings (cron) failed: ${error.message}`);
  return data || [];
}

// =============================================================================
// Sync state
// =============================================================================

async function writeSyncState(
  supabase: any,
  status: string,
  logSummary: string,
  logStep: (m: string) => void
) {
  const row = {
    sync_key: SYNC_KEY,
    last_modification_timestamp: null,
    last_run_at: new Date().toISOString(),
    last_run_status: status,
    last_run_log: logSummary,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("idx_sync_state")
    .upsert(row, { onConflict: "sync_key" });

  if (error) {
    logStep(`WARNING writing sync state: ${error.message}`);
    return;
  }

  logStep(`sync state updated: ${status}`);
}

// =============================================================================
// Stats / status helpers
// =============================================================================

function makeEmptyStats() {
  return {
    processed: 0,
    schools_linked: 0,
    skipped_no_coords: 0,
    skipped_archived: 0,
    errors: 0,
    hit_timeout: false,
    error_details: [] as string[],
  };
}

function determineStatus(stats: any): string {
  if (stats.errors > 0 && stats.processed === 0) return "error";
  if (stats.errors > 0) return "partial";
  if (stats.hit_timeout) return "partial";
  return "ok";
}

// =============================================================================
// Response helpers
// =============================================================================

function successResponse(body: any) {
  return new Response(JSON.stringify(body, null, 2), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errorResponse(status: number, message: string, log?: string[]) {
  return new Response(
    JSON.stringify({ error: message, log: log || [] }, null, 2),
    {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}