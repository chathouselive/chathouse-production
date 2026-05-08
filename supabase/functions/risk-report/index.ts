// =============================================================================
// risk-report Edge Function
// -----------------------------------------------------------------------------
// Generates AI Property Risk Reports using Claude Sonnet 4.5.
//
// Flow:
//   1. Auth check (must be signed in)
//   2. Quota check (5 generations max per user during beta)
//   3. Cache check (return existing report if <30 days old)
//   4. Generate via Claude Sonnet 4.5
//   5. Save to risk_reports + log to risk_report_generations
//   6. Return report JSON
//
// Cost: ~$0.01-0.03 per generation at Claude Sonnet 4.5 pricing.
// =============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const BETA_GENERATION_LIMIT = 5;
const CACHE_TTL_DAYS = 30;
const CLAUDE_MODEL = "claude-sonnet-4-5-20250929";

// Pricing for Claude Sonnet 4.5 (per million tokens)
const PRICE_PER_M_INPUT = 3.0;
const PRICE_PER_M_OUTPUT = 15.0;

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // -------------------------------------------------------------------------
    // 1. Auth check — extract user from JWT
    // -------------------------------------------------------------------------
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return errorResponse(401, "Sign in required");
    }

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authErr,
    } = await userClient.auth.getUser();

    if (authErr || !user) {
      return errorResponse(401, "Sign in required");
    }

    // -------------------------------------------------------------------------
    // 2. Parse request body
    // -------------------------------------------------------------------------
    const { listing_id } = await req.json();
    if (!listing_id) {
      return errorResponse(400, "Missing listing_id");
    }

    // Service role client for privileged DB operations
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // -------------------------------------------------------------------------
    // 3. Cache check — return existing report if fresh
    // -------------------------------------------------------------------------
    const { data: cached } = await adminClient
      .from("risk_reports")
      .select("*")
      .eq("listing_id", listing_id)
      .gte("expires_at", new Date().toISOString())
      .maybeSingle();

    if (cached) {
      return successResponse({
        report: cached.report_json,
        cached: true,
        generated_at: cached.created_at,
      });
    }

    // -------------------------------------------------------------------------
    // 4. Quota check — only enforce when generating fresh
    // -------------------------------------------------------------------------
    const { data: countData } = await adminClient.rpc(
      "user_risk_report_generation_count",
      { p_user_id: user.id }
    );

    const currentCount = countData ?? 0;
    if (currentCount >= BETA_GENERATION_LIMIT) {
      return errorResponse(
        429,
        `Beta limit reached. You've generated ${currentCount} of ${BETA_GENERATION_LIMIT} free reports.`
      );
    }

    // -------------------------------------------------------------------------
    // 5. Pull listing + community comments for AI context
    // -------------------------------------------------------------------------
    const { data: listing, error: listingErr } = await adminClient
      .from("listings")
      .select("*")
      .eq("id", listing_id)
      .single();

    if (listingErr || !listing) {
      return errorResponse(404, "Listing not found");
    }

    const { data: comments } = await adminClient
      .from("comments")
      .select("text, role_label, created_at")
      .eq("listing_id", listing_id)
      .eq("is_hidden", false)
      .order("created_at", { ascending: false })
      .limit(50);

    // -------------------------------------------------------------------------
    // 6. Generate via Claude
    // -------------------------------------------------------------------------
    if (!ANTHROPIC_API_KEY) {
      return errorResponse(500, "AI service not configured");
    }

    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(listing, comments || []);

    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 2500,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!claudeRes.ok) {
      const errText = await claudeRes.text();
      console.error("Claude API error:", errText);
      return errorResponse(502, "AI generation failed");
    }

    const claudeData = await claudeRes.json();

    // Extract JSON from Claude's response
    const rawText = claudeData.content?.[0]?.text || "";
    let report;
    try {
      // Strip markdown code fences if present
      const cleanText = rawText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/, "")
        .trim();
      report = JSON.parse(cleanText);
    } catch (parseErr) {
      console.error("Failed to parse Claude response:", rawText);
      return errorResponse(502, "AI returned invalid format");
    }

    // Calculate cost
    const inputTokens = claudeData.usage?.input_tokens || 0;
    const outputTokens = claudeData.usage?.output_tokens || 0;
    const cost = (
      (inputTokens * PRICE_PER_M_INPUT + outputTokens * PRICE_PER_M_OUTPUT) /
      1_000_000
    );

    // -------------------------------------------------------------------------
    // 7. Save to cache + log generation
    // -------------------------------------------------------------------------
    await adminClient.from("risk_reports").upsert(
      {
        listing_id,
        report_json: report,
        cost_usd: cost,
        created_at: new Date().toISOString(),
        expires_at: new Date(
          Date.now() + CACHE_TTL_DAYS * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      { onConflict: "listing_id" }
    );

    await adminClient.from("risk_report_generations").insert({
      user_id: user.id,
      listing_id,
      cost_usd: cost,
    });

    // -------------------------------------------------------------------------
    // 8. Return
    // -------------------------------------------------------------------------
    return successResponse({
      report,
      cached: false,
      generated_at: new Date().toISOString(),
      generations_used: currentCount + 1,
      generations_limit: BETA_GENERATION_LIMIT,
    });
  } catch (err: any) {
    console.error("risk-report unexpected error:", err);
    return errorResponse(500, err?.message || "Internal error");
  }
});

// =============================================================================
// Helpers
// =============================================================================

function successResponse(body: any) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errorResponse(status: number, message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// =============================================================================
// Prompts
// =============================================================================

function buildSystemPrompt(): string {
  return `You are an AI assistant helping people understand a property listing before they sign anything. Your tone is direct, practical, and grounded — like a working home inspector who has seen everything.

CRITICAL RULES:
1. ONLY base claims on data provided in the user message. Never invent facts.
2. Phrase concerns as questions to investigate, NOT factual claims.
   ✅ GOOD: "Worth asking the agent: when was the roof last replaced?"
   ❌ BAD: "This roof needs replacement."
3. Use language like "could", "may want to check", "worth asking about" — never "this property has X problem".
4. Never make legal claims about title, code violations, or specific structural defects.
5. If data is sparse, say so. Don't pad the report with generic content.
6. Always remind the reader this is NOT a substitute for a professional inspection.

OUTPUT FORMAT:
Return ONLY valid JSON matching this exact structure (no markdown, no preamble):

{
  "summary": "1-2 sentence overview of the property and what's notable",
  "listing_red_flags": [
    {
      "concern": "Short concern title",
      "detail": "1-2 sentence explanation phrased as 'worth verifying' or 'consider asking'"
    }
  ],
  "community_insights": [
    {
      "concern": "Short concern title from community comments",
      "detail": "1-2 sentence summary of what residents/neighbors said"
    }
  ],
  "inspector_watchlist": [
    {
      "concern": "Specific item your home inspector should examine",
      "detail": "Why this matters for THIS property type / age / location"
    }
  ],
  "questions_to_ask": [
    "Direct question for seller/landlord/agent"
  ],
  "disclaimer": "This report is informational only and does not replace a licensed home inspection."
}

GUIDELINES:
- Each section should have 2-5 items unless data is truly sparse.
- listing_red_flags = things missing or vague in the listing data itself.
- community_insights = synthesized from comments only. If no comments, return empty array [].
- inspector_watchlist = specific to property type/age/location (e.g., "Older Hudson County row houses often have…").
- questions_to_ask = practical questions a buyer/renter should ask.
- Keep concern titles under 60 chars. Keep details under 200 chars each.`;
}

function buildUserPrompt(listing: any, comments: any[]): string {
  const commentsText = comments.length
    ? comments
        .map(
          (c, i) =>
            `Comment ${i + 1} (${c.role_label || "User"}): ${c.text}`
        )
        .join("\n")
    : "No community comments yet.";

  return `Generate a Risk Report for this listing.

LISTING DATA:
- Address: ${listing.address || "Not provided"}
- City/Neighborhood: ${listing.hood || listing.city || "Not provided"}, ${listing.state || ""}
- Type: ${listing.type === "rent" ? "Rental" : "For Sale"}
- Price: ${listing.price ? `$${Number(listing.price).toLocaleString()}${listing.type === "rent" ? "/mo" : ""}` : "Not listed"}
- Beds: ${listing.beds ?? "Not listed"}
- Baths: ${listing.baths ?? "Not listed"}
- Square Feet: ${listing.sqft ?? "Not listed"}
- Description: ${listing.description || "No description provided"}
- Source: ${listing.source || "community"}

COMMUNITY COMMENTS (${comments.length} total):
${commentsText}

Generate the JSON risk report now.`;
}