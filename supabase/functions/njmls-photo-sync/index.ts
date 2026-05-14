// =============================================================================
// njmls-photo-sync Edge Function — v1 (hero photos only)
// -----------------------------------------------------------------------------
// Downloads Order=0 (hero) photos for IDX listings that don't yet have a photo.
//
// What it does:
//   1. Auths to NJMLS (same OAuth flow as njmls-sync)
//   2. Queries listings WHERE source='idx' AND img_url IS NULL
//   3. For each listing (batched, max 25 per invocation):
//      - Fetch Order=0 media record from NJMLS Media endpoint
//      - Download image bytes from Paragon CDN
//      - Upload to listing-photos/idx/{listing_key}/{media_key}.jpg
//      - INSERT row into listing_media table
//      - UPDATE listings.img_url to point to Supabase Storage URL
//   4. Returns summary
//
// What it does NOT do:
//   - Photos 2-N (gallery shots — separate workstream)
//   - Re-sync changed photos
//   - Cron scheduling
//   - Sold-listing first-photo-only rule (already naturally compliant since
//     we only pull Order=0)
//
// Required env vars (all already configured):
//   - NJMLS_USERNAME, NJMLS_PASSWORD
//   - SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//
// Storage:
//   - Bucket: listing-photos (public, already exists)
//   - Path: idx/{listing_key}/{media_key}.jpg
//
// Safety limits:
//   - Max 25 listings processed per invocation
//   - Max 120 seconds total runtime
//   - Per-listing errors logged but don't crash the run
// =============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// -----------------------------------------------------------------------------
// Config
// -----------------------------------------------------------------------------

const DEFAULT_BATCH_SIZE = 25;
const MAX_BATCH_SIZE = 100;
const MAX_RUNTIME_MS = 120_000;
const STORAGE_BUCKET = "listing-photos";

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

const TOKEN_URL =
  "https://njmls.paragonrels.com/OData/NJMLS/identity/connect/token";
const SERVICE_ROOT =
  "https://njmls.paragonrels.com/OData/NJMLS/NewJerseyMLS_17";

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

  function elapsedMs(): number {
    return Date.now() - startedAt;
  }

  try {
    logStep("njmls-photo-sync invoked");

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
    // 2. Parse batch size from query string
    // -------------------------------------------------------------------------
    const url = new URL(req.url);
    const batchParam = url.searchParams.get("batch");
    let batchSize = DEFAULT_BATCH_SIZE;
    if (batchParam) {
      const parsed = parseInt(batchParam, 10);
      if (!isNaN(parsed) && parsed > 0) {
        batchSize = Math.min(parsed, MAX_BATCH_SIZE);
      }
    }
    logStep(`batch size = ${batchSize}`);

    // -------------------------------------------------------------------------
    // 3. Supabase client (service_role bypasses RLS)
    // -------------------------------------------------------------------------
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // -------------------------------------------------------------------------
    // 4. Find IDX listings without a photo
    // -------------------------------------------------------------------------
    const { data: listings, error: queryError } = await supabase
      .from("listings")
      .select("id, idx_listing_key")
      .eq("source", "idx")
      .is("img_url", null)
      .not("idx_listing_key", "is", null)
      .limit(batchSize);

    if (queryError) {
      return errorResponse(
        500,
        `Failed to fetch listings: ${queryError.message}`,
        log
      );
    }

    const listingsArr = listings || [];
    logStep(`found ${listingsArr.length} listings without photos`);

    if (listingsArr.length === 0) {
      return successResponse({
        ok: true,
        stats: {
          found: 0,
          processed: 0,
          photos_uploaded: 0,
          no_photo_available: 0,
          errors: 0,
        },
        elapsed_ms: elapsedMs(),
        log,
      });
    }

    // -------------------------------------------------------------------------
    // 5. Auth to NJMLS
    // -------------------------------------------------------------------------
    const token = await getToken(logStep);

    // -------------------------------------------------------------------------
    // 6. Process each listing
    // -------------------------------------------------------------------------
    const stats = {
      found: listingsArr.length,
      processed: 0,
      photos_uploaded: 0,
      no_photo_available: 0,
      errors: 0,
      error_details: [] as string[],
      hit_timeout: false,
    };

    for (const listing of listingsArr) {
      // Safety: timeout check
      if (elapsedMs() >= MAX_RUNTIME_MS) {
        stats.hit_timeout = true;
        logStep(`hit MAX_RUNTIME_MS (${MAX_RUNTIME_MS}ms), stopping`);
        break;
      }

      stats.processed++;
      const result = await processListing(
        listing.id,
        listing.idx_listing_key,
        token,
        supabase,
        logStep
      );

      if (result.status === "uploaded") {
        stats.photos_uploaded++;
      } else if (result.status === "no_photo") {
        stats.no_photo_available++;
      } else {
        stats.errors++;
        stats.error_details.push(
          `listing_id=${listing.id} key=${listing.idx_listing_key}: ${result.error}`
        );
      }
    }

    logStep(
      `done: ${stats.photos_uploaded} uploaded, ${stats.no_photo_available} no photo, ${stats.errors} errors`
    );

    return successResponse({
      ok: stats.errors === 0,
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
// Per-listing processing
// =============================================================================

type ProcessResult =
  | { status: "uploaded" }
  | { status: "no_photo" }
  | { status: "error"; error: string };

async function processListing(
  listingId: number,
  listingKey: string,
  token: string,
  supabase: any,
  logStep: (m: string) => void
): Promise<ProcessResult> {
  try {
    // ---------------------------------------------------------------------
    // a. Fetch Order=0 media record from NJMLS
    // ---------------------------------------------------------------------
    const filter = encodeURIComponent(
      `ResourceRecordKey eq '${listingKey}' and Order eq 0`
    );
    const mediaUrl = `${SERVICE_ROOT}/Media?$top=1&$filter=${filter}`;

    const mediaRes = await fetch(mediaUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!mediaRes.ok) {
      return {
        status: "error",
        error: `Media fetch failed ${mediaRes.status}`,
      };
    }

    const mediaData = await mediaRes.json();
    const records = mediaData.value || [];

    if (records.length === 0) {
      return { status: "no_photo" };
    }

    const media = records[0];
    if (!media.MediaURL) {
      return { status: "no_photo" };
    }

    // ---------------------------------------------------------------------
    // b. Download image bytes from Paragon CDN
    // ---------------------------------------------------------------------
    const imageRes = await fetch(media.MediaURL);
    if (!imageRes.ok) {
      return {
        status: "error",
        error: `Image download failed ${imageRes.status}`,
      };
    }

    const contentType = imageRes.headers.get("content-type") || "image/jpeg";
    const imageBytes = await imageRes.arrayBuffer();

    if (imageBytes.byteLength === 0) {
      return { status: "error", error: "Image download returned 0 bytes" };
    }

    // ---------------------------------------------------------------------
    // c. Upload to Supabase Storage
    // ---------------------------------------------------------------------
    const fileExt = guessExtension(contentType);
    const storagePath = `idx/${listingKey}/${media.MediaKey}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, imageBytes, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      return {
        status: "error",
        error: `Storage upload failed: ${uploadError.message}`,
      };
    }

    // ---------------------------------------------------------------------
    // d. Build public URL
    // ---------------------------------------------------------------------
    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);

    const publicUrl = publicUrlData?.publicUrl;
    if (!publicUrl) {
      return {
        status: "error",
        error: "Failed to construct public URL",
      };
    }

    // ---------------------------------------------------------------------
    // e. Insert row into listing_media
    // ---------------------------------------------------------------------
    const mediaRow = {
      listing_id: listingId,
      idx_listing_key: listingKey,
      media_key: media.MediaKey,
      media_category: media.MediaCategory ?? null,
      display_order: media.Order ?? 0,
      source_url: media.MediaURL,
      storage_url: publicUrl,
      image_width: media.ImageWidth ?? null,
      image_height: media.ImageHeight ?? null,
      modification_timestamp: media.ModificationTimestamp ?? null,
    };

    const { error: insertError } = await supabase
      .from("listing_media")
      .upsert(mediaRow, { onConflict: "idx_listing_key,media_key" });

    if (insertError) {
      return {
        status: "error",
        error: `listing_media insert failed: ${insertError.message}`,
      };
    }

    // ---------------------------------------------------------------------
    // f. Update listings.img_url
    // ---------------------------------------------------------------------
    const { error: updateError } = await supabase
      .from("listings")
      .update({
        img_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", listingId);

    if (updateError) {
      return {
        status: "error",
        error: `listings.img_url update failed: ${updateError.message}`,
      };
    }

    return { status: "uploaded" };
  } catch (err: any) {
    return {
      status: "error",
      error: err?.message || String(err),
    };
  }
}

// =============================================================================
// Helpers
// =============================================================================

function guessExtension(contentType: string): string {
  const ct = contentType.toLowerCase();
  if (ct.includes("png")) return "png";
  if (ct.includes("webp")) return "webp";
  if (ct.includes("gif")) return "gif";
  return "jpg";
}

// =============================================================================
// Auth helper (same pattern as njmls-sync)
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