import { useState, useEffect } from 'react'
import { supabase } from './supabase'

/**
 * useEnrichment — fetches Walk Score, Bike Score, and Transit Score
 * for a given listing via our Edge Function.
 *
 * The Edge Function handles caching (90-day cache keyed by lat/lng),
 * so this hook just calls it and renders whatever comes back.
 *
 * Returns:
 *   enrichment   — { walk_score, bike_score, transit_score, ...descriptions }, or null
 *   loading      — true while fetching
 *   error        — error message string, or null
 */
export function useEnrichment(listing) {
  const [enrichment, setEnrichment] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Stringify deps so we don't re-fetch on object identity churn
  const lat = listing?.lat
  const lng = listing?.lng
  const address = listing?.address

  useEffect(() => {
    // Don't try to fetch if we don't have coordinates
    if (lat == null || lng == null || !address) {
      setEnrichment(null)
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false

    async function fetchEnrichment() {
      setLoading(true)
      setError(null)

      try {
        const { data, error: fnError } = await supabase.functions.invoke(
          'enrich-listing',
          {
            body: { lat, lng, address },
          }
        )

        if (cancelled) return

        if (fnError) {
          console.error('enrich-listing function error:', fnError)
          setError('Could not load walkability data')
          setEnrichment(null)
        } else if (data?.error) {
          // Function returned a 200 but the body has an error field
          console.error('enrich-listing returned error:', data)
          setError(data.message || 'Walkability data unavailable')
          setEnrichment(null)
        } else {
          setEnrichment(data)
        }
      } catch (err) {
        if (cancelled) return
        console.error('useEnrichment unexpected error:', err)
        setError('Could not load walkability data')
        setEnrichment(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchEnrichment()

    return () => {
      cancelled = true
    }
  }, [lat, lng, address])

  return { enrichment, loading, error }
}