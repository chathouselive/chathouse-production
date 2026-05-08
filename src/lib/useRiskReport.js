import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

/**
 * useRiskReport — fetches THIS user's existing AI Risk Report from cache,
 * or generates a new one on demand.
 *
 * Reports are user-scoped: each signed-in user gets their own report per
 * listing. Generating a report does NOT unlock the report for other users.
 *
 * Beta limit: 5 generations per user (enforced server-side).
 * Cache: One report per (listing, user), 30-day TTL.
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
  // On mount: check if a cached report exists for this (listing, user)
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!listingId) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function loadForUser() {
      setLoading(true)
      setError(null)

      try {
        // Get the current user. If signed-out, skip the cache check entirely
        // — the component will show the SignedOutGate.
        const { data: { user } } = await supabase.auth.getUser()
        if (cancelled) return
        if (!user) {
          setLoading(false)
          return
        }

        // Cache check — only fetches if THIS user has a fresh cached report
        // for this listing.
        const { data, error: dbErr } = await supabase
          .from('risk_reports')
          .select('*')
          .eq('listing_id', listingId)
          .eq('user_id', user.id)
          .gte('expires_at', new Date().toISOString())
          .maybeSingle()

        if (cancelled) return

        if (dbErr) {
          // RLS or transient — fall through to "no cached report" state.
          // Generation will still work.
          console.log('Cache check skipped:', dbErr.message)
        }

        if (data) {
          setReport(data.report_json)
          setIsCached(true)
        }

        // Fetch user's current generation count
        const { data: countData, error: rpcErr } = await supabase.rpc(
          'user_risk_report_generation_count',
          { p_user_id: user.id }
        )

        if (cancelled) return
        if (!rpcErr && countData != null) {
          setGenerations({ used: countData, limit: 5 })
        }
      } catch (err) {
        console.error('useRiskReport load error:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadForUser()

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