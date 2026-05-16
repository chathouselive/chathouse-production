// =============================================================================
// njmls-photo-sync Edge Function — v2 (hero + gallery)
// -----------------------------------------------------------------------------
// Downloads photos from NJMLS for IDX listings. Two phases per invocation:
//
//   Phase 1 (hero): for listings WHERE img_url IS NULL, fetch Order=0 photo,
//                   upload to Storage, INSERT listing_media row, UPDATE
//                   listings.img_url. Same as v1 behavior.
//
//   Phase 2 (gallery): for listings WHERE img_url IS NOT NULL AND
//                   idx_gallery_synced_at IS NULL, fetch Orders 1-19,
//                   upload each, INSERT listing_media rows, UPDATE
//                   listings.idx_gallery_synced_at = now().
//                   Capped at GALLERY_BATCH_SIZE listings per run to
//                   keep within the 120s safety budget.
//
// NJMLS Section 13.1 compliance:
//   - Sold listings (idx_standard_status = 'Closed') may only display
//     the first photo. For these, Phase 2 skips photo download entirely
//     and just marks idx_gallery_synced_at to remove them from the queue.
//   - All non-Closed listings get up to 20 photos total (1 hero + 19 gallery).
//
// Safety limits:
//   - Max DEFAULT_BATCH_SIZE listings in Phase 1 (default 25, max 100)
//   - Max GALLERY_BATCH_SIZE listings in Phase 2 (default 5, max 20)
//   - Max 120 seconds total runtime
//   - MAX_GALLERY_PHOTOS_PER_LISTING = 19 (giving 20 total with hero)
//   - Per-listing errors logged but don't crash the run
// =============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// -----------------------------------------------------------------------------
// Config
// -----------------------------------------------------------------------------

const DEFAULT_BATCH_SIZE = 25;
const MAX_BATCH_SIZE = 100;
const DEFAULT_GALLERY_BATCH_SIZE = 5;
const MAX_GALLERY_BATCH_SIZE = 20;
const MAX_GALLERY_PHOTOS_PER_LISTING = 19; // 19 + 1 hero = 20 total
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

  function timedOut(): boolean {
    return elapsedMs() >= MAX_RUNTIME_MS;
  }

  try {
    logStep("njmls-photo-sync v2 invoked");

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
    // 2. Parse batch sizes from query string
    // -------------------------------------------------------------------------
    const url = new URL(req.url);

    const batchParam = url.searchParams.get("batch");
    let heroBatchSize = DEFAULT_BATCH_SIZE;
    if (batchParam) {
      const parsed = parseInt(batchParam, 10);
      if (!isNaN(parsed) && parsed >= 0) {
        heroBatchSize = Math.min(parsed, MAX_BATCH_SIZE);
      }
    }

    const galleryParam = url.searchParams.get("gallery");
    let galleryBatchSize = DEFAULT_GALLERY_BATCH_SIZE;
    if (galleryParam) {
      const parsed = parseInt(galleryParam, 10);
      if (!isNaN(parsed) && parsed >= 0) {
        galleryBatchSize = Math.min(parsed, MAX_GALLERY_BATCH_SIZE);
      }
    }

    logStep(`hero batch size = ${heroBatchSize}, gallery batch size = ${galleryBatchSize}`);

    // -------------------------------------------------------------------------
    // 3. Supabase client
    // -------------------------------------------------------------------------
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // -------------------------------------------------------------------------
    // 4. Track stats across both phases
    // -------------------------------------------------------------------------
    const stats = {
      hero: {
        found: 0,
        processed: 0,
        uploaded: 0,
        no_photo_available: 0,
        errors: 0,
        error_details: [] as string[],
      },
      gallery: {
        found: 0,
        processed: 0,
        listings_completed: 0,
        photos_uploaded: 0,
        sold_skipped: 0,
        errors: 0,
        error_details: [] as string[],
      },
      hit_timeout: false,
    };

    // -------------------------------------------------------------------------
    // 5. Get auth token (used by both phases)
    // -------------------------------------------------------------------------
    const token = await getToken(logStep);

    // =========================================================================
    // PHASE 1 — Hero photos (img_url IS NULL)
    // -------------------------------------------------------------------------
    // Skips listings checked within the last 7 days that had no photo
    // available (idx_photo_check_at). Re-checks them after 7 days in case
    // the agent has since uploaded a photo. Saves NJMLS API calls.
    // =========================================================================
    if (heroBatchSize === 0) {
      logStep("Phase 1 skipped (batch=0)");
    } else {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const { data: heroListings, error: heroQueryError } = await supabase
        .from("listings")
        .select("id, idx_listing_key")
        .eq("source", "idx")
        .is("img_url", null)
        .not("idx_listing_key", "is", null)
        .or(`idx_photo_check_at.is.null,idx_photo_check_at.lt.${sevenDaysAgo}`)
        .limit(heroBatchSize);

      if (heroQueryError) {
        return errorResponse(
          500,
          `Failed to fetch hero listings: ${heroQueryError.message}`,
          log
        );
      }

      const heroArr = heroListings || [];
      stats.hero.found = heroArr.length;
      logStep(`Phase 1: found ${heroArr.length} listings needing hero photo`);

      for (const listing of heroArr) {
        if (timedOut()) {
          stats.hit_timeout = true;
          logStep(`hit MAX_RUNTIME_MS in Phase 1, stopping`);
          break;
        }

        stats.hero.processed++;
        const result = await processHeroPhoto(
          listing.id,
          listing.idx_listing_key,
          token,
          supabase
        );

        if (result.status === "uploaded") {
          stats.hero.uploaded++;
        } else if (result.status === "no_photo") {
          stats.hero.no_photo_available++;
        } else {
          stats.hero.errors++;
          stats.hero.error_details.push(
            `listing_id=${listing.id} key=${listing.idx_listing_key}: ${result.error}`
          );
        }
      }

      logStep(
        `Phase 1 done: ${stats.hero.uploaded} uploaded, ${stats.hero.no_photo_available} no photo, ${stats.hero.errors} errors`
      );
    }

    // =========================================================================
    // PHASE 2 — Gallery photos (idx_gallery_synced_at IS NULL)
    // =========================================================================
    if (!stats.hit_timeout && galleryBatchSize > 0) {
      const { data: galleryListings, error: galleryQueryError } = await supabase
        .from("listings")
        .select("id, idx_listing_key, idx_standard_status")
        .eq("source", "idx")
        .not("img_url", "is", null)
        .is("idx_gallery_synced_at", null)
        .not("idx_listing_key", "is", null)
        .limit(galleryBatchSize);

      if (galleryQueryError) {
        logStep(`Phase 2 query failed: ${galleryQueryError.message}`);
      } else {
        const galleryArr = galleryListings || [];
        stats.gallery.found = galleryArr.length;
        logStep(`Phase 2: found ${galleryArr.length} listings needing gallery`);

        for (const listing of galleryArr) {
          if (timedOut()) {
            stats.hit_timeout = true;
            logStep(`hit MAX_RUNTIME_MS in Phase 2, stopping`);
            break;
          }

          stats.gallery.processed++;
          const result = await processGallery(
            listing.id,
            listing.idx_listing_key,
            listing.idx_standard_status,
            token,
            supabase
          );

          if (result.status === "completed") {
            stats.gallery.listings_completed++;
            stats.gallery.photos_uploaded += result.photos_uploaded || 0;
          } else if (result.status === "sold_skipped") {
            stats.gallery.sold_skipped++;
          } else {
            stats.gallery.errors++;
            stats.gallery.error_details.push(
              `listing_id=${listing.id} key=${listing.idx_listing_key}: ${result.error}`
            );
          }
        }

        logStep(
          `Phase 2 done: ${stats.gallery.listings_completed} listings completed (${stats.gallery.photos_uploaded} photos), ${stats.gallery.sold_skipped} sold-skipped, ${stats.gallery.errors} errors`
        );
      }
    } else if (galleryBatchSize === 0) {
      logStep("Phase 2 skipped (gallery=0)");
    }

    // -------------------------------------------------------------------------
    // 6. Return summary
    // -------------------------------------------------------------------------
    const ok = stats.hero.errors === 0 && stats.gallery.errors === 0;
    return successResponse({
      ok,
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
// Phase 1 helper — hero photo (Order=0)
// =============================================================================

type HeroResult =
  | { status: "uploaded" }
  | { status: "no_photo" }
  | { status: "error"; error: string };

async function processHeroPhoto(
  listingId: number,
  listingKey: string,
  token: string,
  supabase: any
): Promise<HeroResult> {
  try {
    const filter = encodeURIComponent(
      `ResourceRecordKey eq '${listingKey}' and Order eq 0`
    );
    const mediaUrl = `${SERVICE_ROOT}/Media?$top=1&$filter=${filter}`;

    const mediaRes = await fetch(mediaUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!mediaRes.ok) {
      return { status: "error", error: `Media fetch failed ${mediaRes.status}` };
    }

    const mediaData = await mediaRes.json();
    const records = mediaData.value || [];

    if (records.length === 0 || !records[0].MediaURL) {
      // Mark this listing as checked. Phase 1 query skips listings whose
      // idx_photo_check_at is within the last 7 days, so we won't hit
      // NJMLS again for this listing until that window elapses.
      await supabase
        .from("listings")
        .update({ idx_photo_check_at: new Date().toISOString() })
        .eq("id", listingId);
      return { status: "no_photo" };
    }

    const media = records[0];
    const uploadResult = await downloadAndUpload(
      media.MediaURL,
      `idx/${listingKey}/${media.MediaKey}.jpg`,
      supabase
    );

    if (!uploadResult.ok) {
      return { status: "error", error: uploadResult.error };
    }

    // Insert listing_media row
    const { error: insertError } = await supabase
      .from("listing_media")
      .upsert(
        {
          listing_id: listingId,
          idx_listing_key: listingKey,
          media_key: media.MediaKey,
          media_category: media.MediaCategory ?? null,
          display_order: 0,
          source_url: media.MediaURL,
          storage_url: uploadResult.publicUrl,
          image_width: media.ImageWidth ?? null,
          image_height: media.ImageHeight ?? null,
          modification_timestamp: media.ModificationTimestamp ?? null,
        },
        { onConflict: "idx_listing_key,media_key" }
      );

    if (insertError) {
      return { status: "error", error: `listing_media insert: ${insertError.message}` };
    }

    // Update listings.img_url
    const { error: updateError } = await supabase
      .from("listings")
      .update({
        img_url: uploadResult.publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", listingId);

    if (updateError) {
      return { status: "error", error: `listings update: ${updateError.message}` };
    }

    return { status: "uploaded" };
  } catch (err: any) {
    return { status: "error", error: err?.message || String(err) };
  }
}

// =============================================================================
// Phase 2 helper — gallery photos (Orders 1-19, sold-listing rule applies)
// =============================================================================

type GalleryResult =
  | { status: "completed"; photos_uploaded: number }
  | { status: "sold_skipped" }
  | { status: "error"; error: string };

async function processGallery(
  listingId: number,
  listingKey: string,
  standardStatus: string | null,
  token: string,
  supabase: any
): Promise<GalleryResult> {
  try {
    // NJMLS Section 13.1 compliance: sold listings get hero only.
    // Mark gallery_synced_at to remove from queue without downloading.
    if (standardStatus === "Closed") {
      const { error: markError } = await supabase
        .from("listings")
        .update({ idx_gallery_synced_at: new Date().toISOString() })
        .eq("id", listingId);

      if (markError) {
        return { status: "error", error: `sold-skip mark: ${markError.message}` };
      }
      return { status: "sold_skipped" };
    }

    // Fetch Orders 1 through MAX_GALLERY_PHOTOS_PER_LISTING
    // OData syntax: Order ge 1 and Order le 19, ordered by Order
    const filter = encodeURIComponent(
      `ResourceRecordKey eq '${listingKey}' and Order ge 1 and Order le ${MAX_GALLERY_PHOTOS_PER_LISTING}`
    );
    const mediaUrl = `${SERVICE_ROOT}/Media?$top=${MAX_GALLERY_PHOTOS_PER_LISTING}&$orderby=Order asc&$filter=${filter}`;

    const mediaRes = await fetch(mediaUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!mediaRes.ok) {
      return { status: "error", error: `Media fetch failed ${mediaRes.status}` };
    }

    const mediaData = await mediaRes.json();
    const records = mediaData.value || [];

    // Even if records is empty (listing has only hero photo), we mark
    // gallery_synced_at so we don't re-attempt this listing every run.
    let uploadedCount = 0;
    const errors: string[] = [];

    for (const media of records) {
      if (!media.MediaURL) continue;

      const uploadResult = await downloadAndUpload(
        media.MediaURL,
        `idx/${listingKey}/${media.MediaKey}.jpg`,
        supabase
      );

      if (!uploadResult.ok) {
        errors.push(`order ${media.Order}: ${uploadResult.error}`);
        continue;
      }

      const { error: insertError } = await supabase
        .from("listing_media")
        .upsert(
          {
            listing_id: listingId,
            idx_listing_key: listingKey,
            media_key: media.MediaKey,
            media_category: media.MediaCategory ?? null,
            display_order: media.Order,
            source_url: media.MediaURL,
            storage_url: uploadResult.publicUrl,
            image_width: media.ImageWidth ?? null,
            image_height: media.ImageHeight ?? null,
            modification_timestamp: media.ModificationTimestamp ?? null,
          },
          { onConflict: "idx_listing_key,media_key" }
        );

      if (insertError) {
        errors.push(`order ${media.Order} insert: ${insertError.message}`);
        continue;
      }

      uploadedCount++;
    }

    // Mark complete regardless of individual photo errors — we tried this
    // listing, partial success is still success at the listing level.
    const { error: markError } = await supabase
      .from("listings")
      .update({
        idx_gallery_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", listingId);

    if (markError) {
      return { status: "error", error: `mark complete: ${markError.message}` };
    }

    if (errors.length > 0 && uploadedCount === 0) {
      // Total failure — surface the first error
      return { status: "error", error: errors[0] };
    }

    return { status: "completed", photos_uploaded: uploadedCount };
  } catch (err: any) {
    return { status: "error", error: err?.message || String(err) };
  }
}

// =============================================================================
// Shared helper — download from CDN, upload to Storage, return public URL
// =============================================================================

type UploadResult = { ok: true; publicUrl: string } | { ok: false; error: string };

async function downloadAndUpload(
  sourceUrl: string,
  storagePath: string,
  supabase: any
): Promise<UploadResult> {
  try {
    const imageRes = await fetch(sourceUrl);
    if (!imageRes.ok) {
      return { ok: false, error: `Image download failed ${imageRes.status}` };
    }

    const contentType = imageRes.headers.get("content-type") || "image/jpeg";
    const imageBytes = await imageRes.arrayBuffer();

    if (imageBytes.byteLength === 0) {
      return { ok: false, error: "Image download returned 0 bytes" };
    }

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, imageBytes, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      return { ok: false, error: `Storage upload: ${uploadError.message}` };
    }

    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);

    if (!publicUrlData?.publicUrl) {
      return { ok: false, error: "Failed to construct public URL" };
    }

    return { ok: true, publicUrl: publicUrlData.publicUrl };
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
}

// =============================================================================
// Auth helper
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