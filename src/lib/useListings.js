import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export function useListings({ city = null, type = null, search = '' } = {}) {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function fetchListings() {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('listings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (city && city !== 'All') query = query.ilike('hood', `%${city}%`).or(`city.ilike.%${city}%`)
      if (type && type !== 'All') query = query.eq('type', type)
      if (search) query = query.or(`address.ilike.%${search}%,city.ilike.%${search}%,hood.ilike.%${search}%`)

      const { data, error } = await query.limit(100)
      if (cancelled) return
      if (error) { setError(error.message); setLoading(false); return }

      if (!data || data.length === 0) { setListings([]); setLoading(false); return }

      // Fetch comment counts for all listings in one query
      const listingIds = data.map(l => l.id)
      const { data: commentCounts } = await supabase
        .from('comments')
        .select('listing_id')
        .in('listing_id', listingIds)
        .eq('is_hidden', false)

      // Build a count map
      const countMap = {}
      commentCounts?.forEach(c => {
        countMap[c.listing_id] = (countMap[c.listing_id] || 0) + 1
      })

      // Attach comment_count to each listing
      const enriched = data.map(l => ({
        ...l,
        comment_count: countMap[l.id] || 0,
      }))

      if (!cancelled) { setListings(enriched); setLoading(false) }
    }

    fetchListings()
    return () => { cancelled = true }
  }, [city, type, search])

  return { listings, loading, error }
}

export function useListing(id) {
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    async function fetch() {
      setLoading(true)
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single()
      if (cancelled) return
      if (error) setError(error.message)
      else setListing(data)
      setLoading(false)
    }
    fetch()
    return () => { cancelled = true }
  }, [id])

  return { listing, loading, error }
}
