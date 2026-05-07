// =============================================================================
// enrich-listing Edge Function
// -----------------------------------------------------------------------------
// Takes a listing's lat/lng and address, calls Walk Score API, returns
// Walk Score, Bike Score, and Transit Score. Caches results in
// `listing_enrichment` table keyed by lat/lng so we don't re-fetch.
//
// Walk Score Free tier: 5,000 calls/day, includes Walk + Transit + Bike Scores
// API docs: https://www.walkscore.com/professional/api.php
// =============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const WALKSCORE_API_KEY = Deno.env.get("WALKSCORE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Cache TTL — re-fetch after 90 days. Walk Score data is very stable.
const CACHE_TTL_DAYS = 90;

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { lat, lng, address } = await req.json();

    if (!lat || !lng || !address) {
      return new Response(
        JSON.stringify({ error: "Missing lat, lng, or address" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!WALKSCORE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Walk Score API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Cache key: round lat/lng to 5 decimal places (~1.1m precision).
    // Listings at the same building share enrichment.
    const lat_key = Number(lat).toFixed(5);
    const lng_key = Number(lng).toFixed(5);

    // -------------------------------------------------------------------------
    // Step 1: Check cache
    // -------------------------------------------------------------------------
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - CACHE_TTL_DAYS);

    const { data: cached } = await supabase
      .from("listing_enrichment")
      .select("*")
      .eq("lat_key", lat_key)
      .eq("lng_key", lng_key)
      .gte("fetched_at", cutoff.toISOString())
      .maybeSingle();

    if (cached) {
      return new Response(
        JSON.stringify({
          walk_score: cached.walk_score,
          bike_score: cached.bike_score,
          transit_score: cached.transit_score,
          walk_description: cached.walk_description,
          transit_description: cached.transit_description,
          bike_description: cached.bike_description,
          cached: true,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // -------------------------------------------------------------------------
    // Step 2: Call Walk Score API
    // -------------------------------------------------------------------------
    const url = new URL("https://api.walkscore.com/score");
    url.searchParams.set("format", "json");
    url.searchParams.set("address", address);
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("transit", "1");
    url.searchParams.set("bike", "1");
    url.searchParams.set("wsapikey", WALKSCORE_API_KEY);

    const apiRes = await fetch(url.toString());
    const apiData = await apiRes.json();

    // Walk Score status: 1 = success, others = errors
    if (apiData.status !== 1) {
      console.error("Walk Score API error:", apiData);
      return new Response(
        JSON.stringify({
          error: "Walk Score API error",
          status: apiData.status,
          message: getWalkScoreErrorMessage(apiData.status),
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // -------------------------------------------------------------------------
    // Step 3: Save to cache
    // -------------------------------------------------------------------------
    const enrichment = {
      lat_key,
      lng_key,
      address,
      walk_score: apiData.walkscore ?? null,
      walk_description: apiData.description ?? null,
      transit_score: apiData.transit?.score ?? null,
      transit_description: apiData.transit?.description ?? null,
      bike_score: apiData.bike?.score ?? null,
      bike_description: apiData.bike?.description ?? null,
      fetched_at: new Date().toISOString(),
    };

    const { error: insertError } = await supabase
      .from("listing_enrichment")
      .upsert(enrichment, { onConflict: "lat_key,lng_key" });

    if (insertError) {
      console.error("Cache insert failed:", insertError);
      // Don't fail the request — still return data to user
    }

    return new Response(
      JSON.stringify({
        walk_score: enrichment.walk_score,
        bike_score: enrichment.bike_score,
        transit_score: enrichment.transit_score,
        walk_description: enrichment.walk_description,
        transit_description: enrichment.transit_description,
        bike_description: enrichment.bike_description,
        cached: false,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("enrich-listing unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error", message: err?.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// =============================================================================
// Walk Score error code reference
// =============================================================================
function getWalkScoreErrorMessage(status: number): string {
  const messages: Record<number, string> = {
    2: "Walk Score is being calculated and is not currently available. Try again later.",
    30: "Invalid latitude/longitude.",
    31: "Walk Score API is temporarily unavailable.",
    40: "Your daily API quota has been exceeded.",
    41: "Your IP address has been blocked.",
    42: "Your API key has been blocked.",
  };
  return messages[status] || `Unknown error (status ${status})`;
}