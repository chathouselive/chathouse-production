// ============================================================
// supabase/functions/ai-search/index.ts
//
// AI-powered natural language search for Chathouse listings.
//
// Receives:  { query: string }
// Returns:   { filters: { city?, hood?, type?, min_price?, max_price?,
//                         min_beds?, min_baths?, min_sqft?, keywords? },
//              recap: string,
//              cost_usd?: number }
//
// Uses Claude Haiku 4.5 (claude-haiku-4-5-20251001) for parsing —
// fast (~100ms), cheap (~$0.001/query), accurate enough for filter
// extraction from natural language.
//
// Deploy:  npx supabase functions deploy ai-search
// Set key: npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-api03-...
// ============================================================

// deno-lint-ignore-file no-explicit-any

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-haiku-4-5-20251001'

// CORS headers — needed because the React frontend on chathouselive.com
// will call this function from the browser.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// The prompt that teaches Claude how to map natural language to our schema.
// Keep this terse — Haiku follows clear, schema-style instructions well.
const SYSTEM_PROMPT = `You are a search query parser for Chathouse, a real estate listing platform.

Convert the user's natural language search query into a JSON filter object that maps to our listings database.

Available cities: Manhattan, Brooklyn, Queens, Bronx, Jersey City, Hoboken, Newark, Weehawken, Hackensack
Listing types: "rent" (for rentals) or "sale" (for purchases)

Output schema:
{
  "city": string | null,           // Match exactly from available cities, or null
  "hood": string | null,           // Neighborhood name if mentioned (e.g. "Williamsburg", "Park Slope")
  "type": "rent" | "sale" | null,  // "rent" if user mentions renting/lease/monthly. "sale" if buying/purchasing
  "min_price": number | null,      // In dollars (no commas, no $)
  "max_price": number | null,      // In dollars
  "min_beds": number | null,       // 0 = studio, 1, 2, 3, etc.
  "min_baths": number | null,
  "min_sqft": number | null,
  "keywords": string[] | null      // Descriptive features: "modern", "yard", "rooftop", "doorman", "renovated", etc. Lowercase.
}

Rules:
- Return ONLY valid JSON. No prose, no markdown, no code fences.
- If the user doesn't mention a field, set it to null.
- "Under $3,500" means max_price: 3500. "Around $800k" means max_price: 880000 (give 10% buffer up).
- "2BR" / "two bedroom" / "2 bed" means min_beds: 2.
- "Studio" means min_beds: 0.
- If user says "rent" or "rental" or any monthly price under $20,000, infer type: "rent".
- If user says "buy" or "purchase" or any price above $50,000 with no monthly indicator, infer type: "sale".
- Keywords should be evocative features only. Don't include city/price/bed counts in keywords.

Example query: "modern 2BR in Hoboken under $3,500 with a yard"
Example output: {"city":"Hoboken","hood":null,"type":"rent","min_price":null,"max_price":3500,"min_beds":2,"min_baths":null,"min_sqft":null,"keywords":["modern","yard"]}

Example query: "spacious 3 bed near Park Slope around 1.2 million"
Example output: {"city":"Brooklyn","hood":"Park Slope","type":"sale","min_price":null,"max_price":1320000,"min_beds":3,"min_baths":null,"min_sqft":null,"keywords":["spacious"]}`

interface ParsedFilters {
  city: string | null
  hood: string | null
  type: 'rent' | 'sale' | null
  min_price: number | null
  max_price: number | null
  min_beds: number | null
  min_baths: number | null
  min_sqft: number | null
  keywords: string[] | null
}

// Build a human-readable recap from the parsed filters.
// Used in the UI to show the user what we understood.
function buildRecap(filters: ParsedFilters): string {
  const parts: string[] = []

  if (filters.min_beds !== null) {
    parts.push(filters.min_beds === 0 ? 'Studio' : `${filters.min_beds}+ bed`)
  }
  if (filters.min_baths !== null) {
    parts.push(`${filters.min_baths}+ bath`)
  }
  if (filters.type === 'rent') parts.push('rentals')
  else if (filters.type === 'sale') parts.push('for sale')

  if (filters.hood) parts.push(`in ${filters.hood}`)
  else if (filters.city) parts.push(`in ${filters.city}`)

  if (filters.max_price !== null && filters.min_price !== null) {
    parts.push(`$${filters.min_price.toLocaleString()}–$${filters.max_price.toLocaleString()}`)
  } else if (filters.max_price !== null) {
    parts.push(`under $${filters.max_price.toLocaleString()}`)
  } else if (filters.min_price !== null) {
    parts.push(`from $${filters.min_price.toLocaleString()}`)
  }

  if (filters.min_sqft !== null) parts.push(`${filters.min_sqft}+ sqft`)
  if (filters.keywords && filters.keywords.length > 0) {
    parts.push(`with ${filters.keywords.join(', ')}`)
  }

  return parts.length > 0 ? parts.join(' · ') : 'all listings'
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const { query } = await req.json()

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Query required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY not configured')
      return new Response(JSON.stringify({ error: 'AI search not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Call Claude Haiku 4.5
    const anthropicResponse = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: query }],
      }),
    })

    if (!anthropicResponse.ok) {
      const errText = await anthropicResponse.text()
      console.error('Anthropic API error:', anthropicResponse.status, errText)
      return new Response(
        JSON.stringify({ error: 'AI parse failed', detail: errText }),
        {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const result: any = await anthropicResponse.json()
    const rawText: string = result.content?.[0]?.text ?? ''

    // Strip any markdown code fences Claude might add despite our instructions
    const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()

    let filters: ParsedFilters
    try {
      filters = JSON.parse(cleaned)
    } catch (e) {
      console.error('Failed to parse AI output as JSON:', cleaned)
      return new Response(
        JSON.stringify({ error: 'AI returned invalid JSON', raw: cleaned }),
        {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Cost estimate (Haiku 4.5 pricing as of build):
    // Input ~$0.80/M tokens, output ~$4/M tokens.
    // Typical query: ~250 input + ~80 output ≈ $0.0005
    const inputTokens = result.usage?.input_tokens ?? 0
    const outputTokens = result.usage?.output_tokens ?? 0
    const costUsd = (inputTokens * 0.8 + outputTokens * 4) / 1_000_000

    return new Response(
      JSON.stringify({
        filters,
        recap: buildRecap(filters),
        cost_usd: Number(costUsd.toFixed(6)),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (err: any) {
    console.error('ai-search unexpected error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal error', message: err?.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
