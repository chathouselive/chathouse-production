import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

/**
 * useRiskReport — fetches existing AI Risk Report from cache,
 * or generates a new one on demand.
 *
 * Beta limit: 5 generations per user (enforced server-side).
 * Cache: One report per listing, 30-day TTL.
 *
 * Returns:
 *   report          — the report JSON, or null
 *   loading         — true while initial fetch is happening
 *   generating      — true while AI is generating a fresh report
 *   error           — error message string, or null
 *   generate()      — function to trigger AI generation
 *   generations     — { used, limit } for the current user
 *   isCached        — true if the displayed report came from cache
 */
export function useRiskReport(listing) {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [isCached, setIsCached] = useState(false)
  const [generations, setGenerations] = useState({ used: 0, limit: 5 })

  const listingId = listing?.id

  // -------------------------------------------------------------------------
  // On mount: check if a cached report exists for this listing
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!listingId) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function checkCache() {
      setLoading(true)
      setError(null)

      try {
        // Direct DB read — only fetches if cache hit AND not expired
        const { data, error: dbErr } = await supabase
          .from('risk_reports')
          .select('*')
          .eq('listing_id', listingId)
          .gte('expires_at', new Date().toISOString())
          .maybeSingle()

        if (cancelled) return

        if (dbErr) {
          // Could be RLS issue (user not signed in) — silently fall through
          // to "no cached report" state. Generation will still work.
          console.log('Cache check skipped:', dbErr.message)
        }

        if (data) {
          setReport(data.report_json)
          setIsCached(true)
        }
      } catch (err) {
        console.error('useRiskReport cache check error:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    // Also fetch user's current generation count
    async function fetchGenerationCount() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || cancelled) return

        const { data, error: rpcErr } = await supabase.rpc(
          'user_risk_report_generation_count',
          { p_user_id: user.id }
        )

        if (cancelled) return
        if (!rpcErr && data != null) {
          setGenerations({ used: data, limit: 5 })
        }
      } catch (err) {
        // Silent — non-critical
      }
    }

    checkCache()
    fetchGenerationCount()

    return () => {
      cancelled = true
    }
  }, [listingId])

  // -------------------------------------------------------------------------
  // Generate fresh report via Edge Function
  // -------------------------------------------------------------------------
  const generate = useCallback(async () => {
    if (!listingId) return
    setGenerating(true)
    setError(null)

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        'risk-report',
        { body: { listing_id: listingId } }
      )

      if (fnError) {
        // supabase.functions.invoke wraps fn errors here
        const errMessage = fnError.message || 'Could not generate report'
        setError(errMessage)
        return
      }

      // Edge Function returned 200 but body has error field
      if (data?.error) {
        setError(data.error)
        return
      }

      if (data?.report) {
        setReport(data.report)
        setIsCached(data.cached || false)

        if (data.generations_used != null) {
          setGenerations({
            used: data.generations_used,
            limit: data.generations_limit || 5,
          })
        }
      }
    } catch (err) {
      console.error('useRiskReport generate error:', err)
      setError(err.message || 'Could not generate report')
    } finally {
      setGenerating(false)
    }
  }, [listingId])

  return {
    report,
    loading,
    generating,
    error,
    isCached,
    generations,
    generate,
  }
}