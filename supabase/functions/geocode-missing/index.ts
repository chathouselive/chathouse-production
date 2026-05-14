// =============================================================================
// geocode-missing Edge Function
// -----------------------------------------------------------------------------
// Finds listings with null lat/lng and geocodes them via Google Geocoding API.
// Works across all sources (idx, community, rentcast).
//
// What it does:
//   1. Query listings WHERE (lat IS NULL OR lng IS NULL) AND address IS NOT NULL
//   2. For each row, build full address string
//   3. Call Google Geocoding API
//   4. UPDATE the row with lat/lng if successful
//   5. Return summary
//
// What it does NOT do:
//   - NJMLS auth (no listing data fetched, just coordinates)
//   - Pagination of NJMLS (only touches local DB)
//   - Cron scheduling (manual invocation)
//   - Retry logic for transient failures (logged, counted, moved on)
//
// Required env vars:
//   - SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto-injected)
//   - GOOGLE_GEOCODING_API_KEY
//
// Configuration:
//   - Default batch limit: 100 rows per invocation
//   - Override with query param: ?limit=200
// =============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 500;
const MAX_RUNTIME_MS = 120_000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const GOOGLE_GEOCODING_API_KEY = Deno.env.get("GOOGLE_GEOCODING_API_KEY");

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

  function elapsedMs(): number {
    return Date.now() - startedAt;
  }

  try {
    logStep("geocode-missing invoked");

    // -------------------------------------------------------------------------
    // 1. Verify env vars
    // -------------------------------------------------------------------------
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return errorResponse(500, "Supabase service role not available", log);
    }
    if (!GOOGLE_GEOCODING_API_KEY) {
      return errorResponse(500, "GOOGLE_GEOCODING_API_KEY not set", log);
    }
    logStep("env vars present");

    // -------------------------------------------------------------------------
    // 2. Parse limit from query string
    // -------------------------------------------------------------------------
    const url = new URL(req.url);
    const limitParam = url.searchParams.get("limit");
    let limit = DEFAULT_LIMIT;
    if (limitParam) {
      const parsed = parseInt(limitParam, 10);
      if (!isNaN(parsed) && parsed > 0) {
        limit = Math.min(parsed, MAX_LIMIT);
      }
    }
    logStep(`limit = ${limit}`);

    // -------------------------------------------------------------------------
    // 3. Supabase client
    // -------------------------------------------------------------------------
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // -------------------------------------------------------------------------
    // 4. Fetch rows that need geocoding
    // -------------------------------------------------------------------------
    const { data: rows, error: queryError } = await supabase
      .from("listings")
      .select("id, source, address, city, state, zip")
      .or("lat.is.null,lng.is.null")
      .not("address", "is", null)
      .limit(limit);

    if (queryError) {
      logStep(`ERROR fetching rows: ${queryError.message}`);
      return errorResponse(
        500,
        `Failed to fetch listings: ${queryError.message}`,
        log
      );
    }

    const rowsArr = rows || [];
    logStep(`found ${rowsArr.length} rows to geocode`);

    if (rowsArr.length === 0) {
      return successResponse({
        ok: true,
        stats: {
          found: 0,
          attempted: 0,
          succeeded: 0,
          failed: 0,
        },
        elapsed_ms: elapsedMs(),
        log,
      });
    }

    // -------------------------------------------------------------------------
    // 5. Geocode and update each row
    // -------------------------------------------------------------------------
    const stats = {
      found: rowsArr.length,
      attempted: 0,
      succeeded: 0,
      failed: 0,
      hit_timeout: false,
      failed_details: [] as string[],
    };

    for (const row of rowsArr) {
      // Safety: max runtime
      if (elapsedMs() >= MAX_RUNTIME_MS) {
        stats.hit_timeout = true;
        logStep(`hit MAX_RUNTIME_MS (${MAX_RUNTIME_MS}ms), stopping`);
        break;
      }

      stats.attempted++;
      const geo = await geocodeRow(row);

      if (!geo) {
        stats.failed++;
        stats.failed_details.push(
          `id=${row.id} address="${row.address}"`
        );
        continue;
      }

      const { error: updateError } = await supabase
        .from("listings")
        .update({
          lat: geo.lat,
          lng: geo.lng,
          updated_at: new Date().toISOString(),
        })
        .eq("id", row.id);

      if (updateError) {
        stats.failed++;
        stats.failed_details.push(
          `id=${row.id} update error: ${updateError.message}`
        );
        continue;
      }

      stats.succeeded++;
    }

    logStep(
      `done: ${stats.succeeded} succeeded, ${stats.failed} failed of ${stats.attempted} attempted`
    );

    // -------------------------------------------------------------------------
    // 6. Return summary
    // -------------------------------------------------------------------------
    return successResponse({
      ok: stats.failed === 0,
      stats,
      elapsed_ms: elapsedMs(),
      log,
    });
  } catch (err: any) {
    logStep(`UNEXPECTED ERROR: ${err?.message || String(err)}`);
    return errorResponse(500, err?.message || "Internal error", log);
  }
});

// =============================================================================
// Geocoding helper
// =============================================================================

async function geocodeRow(
  row: any
): Promise<{ lat: number; lng: number } | null> {
  const parts = [row.address, row.city, row.state, row.zip].filter(
    (p) => p && String(p).trim().length > 0
  );
  if (parts.length === 0) return null;

  const fullAddress = parts.join(", ");
  const url =
    `https://maps.googleapis.com/maps/api/geocode/json` +
    `?address=${encodeURIComponent(fullAddress)}` +
    `&key=${GOOGLE_GEOCODING_API_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      return null;
    }

    const loc = data.results[0].geometry?.location;
    if (!loc || typeof loc.lat !== "number" || typeof loc.lng !== "number") {
      return null;
    }

    return { lat: loc.lat, lng: loc.lng };
  } catch {
    return null;
  }
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