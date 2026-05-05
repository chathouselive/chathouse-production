import { useEffect, useState } from 'react'
import { supabase } from './supabase'

/* ============================================================
   useAISearch — decides if a query merits AI parsing, then calls
   the ai-search Edge Function and returns the parsed filters.

   Trigger heuristic: only call AI if the query is meaningfully
   complex. Avoids paying for "Hoboken" or "123 Main St" lookups
   that the existing text search already handles fine.

   Triggers:
     - 4+ words, OR
     - contains a digit (likely price/bed count), OR
     - contains a comparator keyword: under, over, with, near,
       around, between, plus modifiers like modern/spacious/big/etc.

   Debounced 600ms so we don't fire mid-typing.

   Returns:
     aiFilters     — parsed filter object, or null
     aiRecap       — human-readable summary string, or null
     aiLoading     — true while the API call is in flight
     aiError       — error message, or null
     clearAISearch — call to reset AI state (e.g., user clears input)
   ============================================================ */

const TRIGGER_KEYWORDS = [
  'under', 'over', 'with', 'near', 'around', 'between', 'less than',
  'more than', 'modern', 'spacious', 'big', 'small', 'tiny', 'huge',
  'cheap', 'luxury', 'renovated', 'new', 'old', 'rooftop', 'yard',
  'garden', 'doorman', 'elevator', 'parking', 'pet', 'dog', 'cat',
  'studio', 'bedroom', 'bed', 'br', 'bath', 'bathroom',
  'rent', 'rental', 'buy', 'sale', 'purchase', 'lease',
  'sqft', 'square feet', 'price', 'budget',
]

function shouldUseAI(query) {
  const trimmed = query.trim()
  if (trimmed.length < 3) return false

  const wordCount = trimmed.split(/\s+/).length
  if (wordCount >= 4) return true

  const hasDigit = /\d/.test(trimmed)
  if (hasDigit && wordCount >= 2) return true

  const lower = trimmed.toLowerCase()
  if (TRIGGER_KEYWORDS.some((kw) => lower.includes(kw))) return true

  return false
}

export function useAISearch(query, debounceMs = 600) {
  const [aiFilters, setAIFilters] = useState(null)
  const [aiRecap, setAIRecap] = useState(null)
  const [aiLoading, setAILoading] = useState(false)
  const [aiError, setAIError] = useState(null)

  useEffect(() => {
    // Empty / cleared query → reset everything
    if (!query || query.trim().length === 0) {
      setAIFilters(null)
      setAIRecap(null)
      setAIError(null)
      setAILoading(false)
      return
    }

    // Query doesn't merit AI → leave filters cleared, fall back to
    // the existing text search behavior in useListings.
    if (!shouldUseAI(query)) {
      setAIFilters(null)
      setAIRecap(null)
      setAIError(null)
      setAILoading(false)
      return
    }

    let cancelled = false
    setAILoading(true)

    const timer = setTimeout(async () => {
      try {
        const { data, error } = await supabase.functions.invoke('ai-search', {
          body: { query: query.trim() },
        })

        if (cancelled) return

        if (error) {
          console.error('ai-search invoke error:', error)
          setAIError(error.message || 'AI search failed')
          setAIFilters(null)
          setAIRecap(null)
          setAILoading(false)
          return
        }

        if (!data || !data.filters) {
          setAIError('No filters returned')
          setAIFilters(null)
          setAIRecap(null)
          setAILoading(false)
          return
        }

        setAIFilters(data.filters)
        setAIRecap(data.recap || null)
        setAIError(null)
        setAILoading(false)
      } catch (err) {
        if (cancelled) return
        console.error('ai-search threw:', err)
        setAIError(err?.message || 'Unexpected error')
        setAIFilters(null)
        setAIRecap(null)
        setAILoading(false)
      }
    }, debounceMs)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query, debounceMs])

  function clearAISearch() {
    setAIFilters(null)
    setAIRecap(null)
    setAIError(null)
    setAILoading(false)
  }

  return { aiFilters, aiRecap, aiLoading, aiError, clearAISearch }
}