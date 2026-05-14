// =============================================================================
// njmls-sync Edge Function — v4 (adds geocoding fallback)
// -----------------------------------------------------------------------------
// What this version adds over v3:
//   - Geocoding fallback via Google Geocoding API when NJMLS returns null
//     Latitude/Longitude. Address is built from UnparsedAddress + City + State
//     + PostalCode. Result is stored in listings.lat/lng.
//   - Geocoding stats surfaced in response (attempted/succeeded/failed)
//
// What this version still does NOT do:
//   - Photo / Media endpoint or downloads
//   - Multi-value field expansion (arrays stay in idx_raw only)
//   - Cron scheduling
//   - Frontend display rules
//
// Required env vars:
//   - NJMLS_USERNAME, NJMLS_PASSWORD
//   - SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto-injected)
//   - GOOGLE_GEOCODING_API_KEY (new in v4)
//
// Sync flow:
//   1. Read last_modification_timestamp from idx_sync_state
//   2. Auth to NJMLS
//   3. Loop:
//      - Fetch next page from NJMLS using $top + $skip
//        (filtered by ModificationTimestamp if set)
//      - Upsert each listing
//      - Track max ModificationTimestamp of successfully upserted rows
//      - Check safety limits (page count, elapsed time)
//      - If page is empty, stop. Otherwise advance skip and continue.
//   4. Write new last_modification_timestamp back to idx_sync_state
//   5. Return summary
//
// Idempotency:
//   - Listings upserted on conflict idx_listing_key (same as v2)
//   - If invocation fails mid-loop, last_modification_timestamp advances
//     only as far as the last successful upsert — next invocation resumes
//
// =============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// -----------------------------------------------------------------------------
// Config
// -----------------------------------------------------------------------------

const SYNC_KEY = "njmls_property";
const PAGE_SIZE = 100;
const MAX_PAGES = 50;
const MAX_RUNTIME_MS = 120_000; // 120 seconds

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const NJMLS_USERNAME = Deno.env.get("NJMLS_USERNAME");
const NJMLS_PASSWORD = Deno.env.get("NJMLS_PASSWORD");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const GOOGLE_GEOCODING_API_KEY = Deno.env.get("GOOGLE_GEOCODING_API_KEY");

const TOKEN_URL =
  "https://njmls.paragonrels.com/OData/NJMLS/identity/connect/token";
const SERVICE_ROOT =
  "https://njmls.paragonrels.com/OData/NJMLS/NewJerseyMLS_17";

const PROPERTY_FIELDS = [
  // Identity
  "ListingKey",
  "ListingId",
  // Status & timestamps
  "StandardStatus",
  "MlsStatus",
  "ModificationTimestamp",
  // Address
  "UnparsedAddress",
  "City",
  "StateOrProvince",
  "PostalCode",
  // Geo
  "Latitude",
  "Longitude",
  // Property facts
  "PropertyType",
  "PropertySubType",
  "BedroomsTotal",
  "BathroomsTotalInteger",
  "LivingArea",
  "YearBuilt",
  // Pricing
  "ListPrice",
  // Description
  "PublicRemarks",
  // Listing broker (for attribution)
  "ListAgentFullName",
  "ListOfficeName",
  // The four mandatory IDX opt-out flags
  "InternetEntireListingDisplayYN",
  "InternetAddressDisplayYN",
  "InternetAutomatedValuationDisplayYN",
  "InternetConsumerCommentYN",
  // Photos count
  "PhotosCount",
];

// In-memory token cache
let cachedToken: { value: string; expiresAt: number } | null = null;

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
    logStep("njmls-sync v4 invoked");

    // -------------------------------------------------------------------------
    // 1. Verify env vars
    // -------------------------------------------------------------------------
    if (!NJMLS_USERNAME || !NJMLS_PASSWORD) {
      return errorResponse(500, "NJMLS credentials not configured", log);
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return errorResponse(
        500,
        "Supabase service role credentials not available",
        log
      );
    }
    logStep("env vars present");

    // -------------------------------------------------------------------------
    // 2. Create Supabase client
    // -------------------------------------------------------------------------
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // -------------------------------------------------------------------------
    // 3. Read sync state (may not exist on first run)
    // -------------------------------------------------------------------------
    const lastSyncTimestamp = await readSyncState(supabase, logStep);

    // -------------------------------------------------------------------------
    // 4. Auth to NJMLS
    // -------------------------------------------------------------------------
    const token = await getToken(logStep);

    // -------------------------------------------------------------------------
    // 5. Paginate through Property endpoint
    // -------------------------------------------------------------------------
    const stats = {
      pages_fetched: 0,
      listings_received: 0,
      upserted: 0,
      skipped_no_address: 0,
      errors: 0,
      error_details: [] as string[],
      hit_max_pages: false,
      hit_timeout: false,
      geocode_attempted: 0,
      geocode_succeeded: 0,
      geocode_failed: 0,
    };

    const geocodeStats = {
      attempted: 0,
      succeeded: 0,
      failed: 0,
    };

    // Track the max ModificationTimestamp of successfully upserted rows.
    // We only advance sync state if we successfully process at least one row.
    let maxSuccessfulTimestamp: string | null = lastSyncTimestamp;

    // Build initial URL
    let skip = 0;
    logStep(
      lastSyncTimestamp
        ? `incremental sync from ${lastSyncTimestamp}`
        : "initial backfill (no prior sync state)"
    );

    while (true) {
      // Safety: max pages
      if (stats.pages_fetched >= MAX_PAGES) {
        stats.hit_max_pages = true;
        logStep(`hit MAX_PAGES limit (${MAX_PAGES}), stopping`);
        break;
      }

      // Safety: max runtime
      if (elapsed() >= MAX_RUNTIME_MS) {
        stats.hit_timeout = true;
        logStep(`hit MAX_RUNTIME_MS limit (${MAX_RUNTIME_MS}ms), stopping`);
        break;
      }

      const pageUrl = buildPageUrl(lastSyncTimestamp, skip);
      logStep(`fetching page ${stats.pages_fetched + 1} (skip=${skip})`);
      const pageResult = await fetchPage(pageUrl, token, logStep);

      if (!pageResult.ok) {
        stats.errors++;
        stats.error_details.push(`Page fetch failed: ${pageResult.error}`);
        logStep(`ERROR fetching page: ${pageResult.error}`);
        break; // Stop pagination on page-level failures
      }

      const listings = pageResult.listings;
      stats.pages_fetched++;
      stats.listings_received += listings.length;

      // Empty page = we've reached the end
      if (listings.length === 0) {
        logStep("empty page received, pagination complete");
        break;
      }

      // Upsert each listing on this page
      for (const reso of listings) {
        if (!reso.UnparsedAddress) {
          stats.skipped_no_address++;
          continue;
        }

        const row = await mapResoToListing(reso, geocodeStats);
        const { error } = await supabase
          .from("listings")
          .upsert(row, { onConflict: "idx_listing_key" });

        if (error) {
          stats.errors++;
          stats.error_details.push(
            `${reso.ListingKey}: ${error.message}`
          );
          continue;
        }

        stats.upserted++;

        // Track max successful timestamp
        const ts = reso.ModificationTimestamp;
        if (ts && (!maxSuccessfulTimestamp || ts > maxSuccessfulTimestamp)) {
          maxSuccessfulTimestamp = ts;
        }
      }

      logStep(
        `page ${stats.pages_fetched} done: +${listings.length} received, ${stats.upserted} cumulative upserted`
      );

      // Advance to next page
      skip += PAGE_SIZE;
    }

    // -------------------------------------------------------------------------
    // 6. Update sync state
    // -------------------------------------------------------------------------
    // Merge geocode counters into stats for surfacing in response
    stats.geocode_attempted = geocodeStats.attempted;
    stats.geocode_succeeded = geocodeStats.succeeded;
    stats.geocode_failed = geocodeStats.failed;

    const status = determineStatus(stats);
    const logSummary =
      `pages=${stats.pages_fetched} received=${stats.listings_received} ` +
      `upserted=${stats.upserted} skipped=${stats.skipped_no_address} ` +
      `errors=${stats.errors} ` +
      `geocoded=${stats.geocode_succeeded}/${stats.geocode_attempted}`;

    await writeSyncState(
      supabase,
      maxSuccessfulTimestamp,
      status,
      logSummary,
      logStep
    );

    logStep(`done: ${logSummary}`);

    // -------------------------------------------------------------------------
    // 7. Return summary
    // -------------------------------------------------------------------------
    return successResponse({
      ok: status === "ok",
      status,
      stats,
      last_modification_timestamp: maxSuccessfulTimestamp,
      elapsed_ms: elapsed(),
      log,
    });
  } catch (err: any) {
    logStep(`UNEXPECTED ERROR: ${err?.message || String(err)}`);
    return errorResponse(500, err?.message || "Internal error", log);
  }
});

// =============================================================================
// Helpers
// =============================================================================

function buildPageUrl(
  lastSyncTimestamp: string | null,
  skip: number
): string {
  const filters: string[] = ["StandardStatus eq 'Active'"];
  if (lastSyncTimestamp) {
    // OData datetime literal: bare ISO 8601 with T separator, no quotes.
    // Postgres returns timestamps with space separator; convert to ISO format.
    const isoTimestamp = new Date(lastSyncTimestamp).toISOString();
    filters.push(`ModificationTimestamp gt ${isoTimestamp}`);
  }
  const filter = encodeURIComponent(filters.join(" and "));
  const select = encodeURIComponent(PROPERTY_FIELDS.join(","));
  // Order by ModificationTimestamp ascending so we process oldest first.
  // That way if we hit a safety limit, sync state advances cleanly.
  const orderby = encodeURIComponent("ModificationTimestamp asc");
  return (
    `${SERVICE_ROOT}/Property` +
    `?$top=${PAGE_SIZE}` +
    `&$skip=${skip}` +
    `&$filter=${filter}` +
    `&$select=${select}` +
    `&$orderby=${orderby}`
  );
}

type PageResult =
  | { ok: true; listings: any[] }
  | { ok: false; error: string };

async function fetchPage(
  url: string,
  token: string,
  logStep: (m: string) => void
): Promise<PageResult> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errText = await res.text();
    return {
      ok: false,
      error: `${res.status}: ${errText.slice(0, 200)}`,
    };
  }

  const data = await res.json();
  return {
    ok: true,
    listings: data.value || [],
  };
}

async function readSyncState(
  supabase: any,
  logStep: (m: string) => void
): Promise<string | null> {
  const { data, error } = await supabase
    .from("idx_sync_state")
    .select("last_modification_timestamp")
    .eq("sync_key", SYNC_KEY)
    .maybeSingle();

  if (error) {
    logStep(`WARNING reading sync state: ${error.message}`);
    return null;
  }

  if (!data) {
    logStep("no prior sync state — full backfill");
    return null;
  }

  return data.last_modification_timestamp || null;
}

async function writeSyncState(
  supabase: any,
  lastTimestamp: string | null,
  status: string,
  logSummary: string,
  logStep: (m: string) => void
) {
  const row = {
    sync_key: SYNC_KEY,
    last_modification_timestamp: lastTimestamp,
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

function determineStatus(stats: any): string {
  if (stats.errors > 0 && stats.upserted === 0) return "error";
  if (stats.errors > 0) return "partial";
  if (stats.hit_max_pages || stats.hit_timeout) return "partial";
  return "ok";
}

// =============================================================================
// RESO → listings row mapping
// =============================================================================

async function mapResoToListing(
  reso: any,
  geocodeStats: { attempted: number; succeeded: number; failed: number }
) {
  // Use NJMLS-provided coordinates if available
  let lat: number | null =
    reso.Latitude !== null && reso.Latitude !== undefined
      ? Number(reso.Latitude)
      : null;
  let lng: number | null =
    reso.Longitude !== null && reso.Longitude !== undefined
      ? Number(reso.Longitude)
      : null;

  // Fall back to geocoding if coordinates are missing
  if ((lat === null || lng === null) && reso.UnparsedAddress) {
    geocodeStats.attempted++;
    const geo = await geocodeAddress(reso);
    if (geo) {
      lat = geo.lat;
      lng = geo.lng;
      geocodeStats.succeeded++;
    } else {
      geocodeStats.failed++;
    }
  }

  return {
    type: mapPropertyType(reso.PropertyType, reso.PropertySubType),
    source: "idx",
    address: reso.UnparsedAddress,
    city: reso.City || "",
    state: reso.StateOrProvince || null,
    zip: reso.PostalCode || "",
    lat,
    lng,
    price: reso.ListPrice ?? null,
    beds: reso.BedroomsTotal ?? null,
    baths: reso.BathroomsTotalInteger ?? null,
    sqft: reso.LivingArea ?? null,
    description: reso.PublicRemarks ?? null,
    idx_raw: reso,
    idx_listing_key: reso.ListingKey,
    idx_listing_id: reso.ListingId ?? null,
    idx_standard_status: reso.StandardStatus ?? null,
    idx_modification_timestamp: reso.ModificationTimestamp ?? null,
    idx_last_synced_at: new Date().toISOString(),
    idx_entire_listing_display: reso.InternetEntireListingDisplayYN ?? false,
    idx_address_display: reso.InternetAddressDisplayYN ?? false,
    idx_avm_display: reso.InternetAutomatedValuationDisplayYN ?? false,
    idx_consumer_comments: reso.InternetConsumerCommentYN ?? false,
    is_active: true,
    updated_at: new Date().toISOString(),
  };
}

async function geocodeAddress(
  reso: any
): Promise<{ lat: number; lng: number } | null> {
  if (!GOOGLE_GEOCODING_API_KEY) return null;

  // Build full address: "75 Bluff Road, Fort Lee, NJ 07024"
  const parts = [
    reso.UnparsedAddress,
    reso.City,
    reso.StateOrProvince,
    reso.PostalCode,
  ].filter((p) => p && String(p).trim().length > 0);

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

function mapPropertyType(
  propertyType: string | null | undefined,
  propertySubType: string | null | undefined
): string {
  const pt = (propertyType || "").toLowerCase();

  if (pt.includes("lease") || pt.includes("rental")) return "rental";
  if (pt.includes("land")) return "land";
  if (pt.includes("commercial")) return "commercial";
  if (pt.includes("2-4 family") || pt.includes("multi")) return "multifamily";

  return "sale";
}

// =============================================================================
// Auth helper (unchanged from v2)
// =============================================================================

async function getToken(logStep: (m: string) => void): Promise<string> {
  const now = Date.now();

  if (cachedToken && cachedToken.expiresAt > now + 60_000) {
    logStep("using cached token");
    return cachedToken.value;
  }

  logStep("requesting fresh token");

  const basicAuth = btoa(`${NJMLS_USERNAME}:${NJMLS_PASSWORD}`);
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    scope: "OData",
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(
      `Token request failed ${res.status}: ${errText.slice(0, 200)}`
    );
  }

  const data = await res.json();

  if (!data.access_token) {
    throw new Error("Token response missing access_token");
  }

  const expiresInMs = (data.expires_in || 5400) * 1000;
  cachedToken = {
    value: data.access_token,
    expiresAt: now + expiresInMs,
  };

  logStep(
    `token cached, expires in ${Math.round(expiresInMs / 60_000)} minutes`
  );
  return cachedToken.value;
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