import { useEffect, useState } from 'react'
import { supabase } from './supabase'

/* ============================================================
   useListings — fetches active listings with optional filtering.

   Existing params (unchanged):
     city   — 'All' | a city name. Matches against hood OR city columns.
     type   — 'All' | 'rent' | 'sale'
     search — free-text search across address/city/hood

   New param:
     aiFilters — optional object from the AI search Edge Function.
                 When present, additional Supabase query clauses are
                 added on top of the existing filters. Shape:
                   {
                     city, hood, type,
                     min_price, max_price,
                     min_beds, min_baths,
                     min_sqft,
                     keywords: string[]   // OR-matched against description
                   }
                 Any field can be null/undefined — only present fields
                 are applied.

   The effect refires whenever filters change (including aiFilters).
   We stringify aiFilters in the dep array to avoid infinite loops
   from new object identities on each render.
   ============================================================ */
export function useListings({
  city = null,
  type = null,
  search = '',
  aiFilters = null,
} = {}) {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Stable key for the dep array — JSON.stringify avoids re-runs
  // when an object with the same contents but different identity is passed.
  const aiFiltersKey = aiFilters ? JSON.stringify(aiFilters) : null

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

      // ----- Existing filters (unchanged behavior) -----
      if (city && city !== 'All') {
        query = query.ilike('hood', `%${city}%`).or(`city.ilike.%${city}%`)
      }
      if (type && type !== 'All') query = query.eq('type', type)
      if (search) {
        query = query.or(
          `address.ilike.%${search}%,city.ilike.%${search}%,hood.ilike.%${search}%`,
        )
      }

      // ----- AI filters (new) -----
      // Applied additively on top of any existing filter values.
      // If user has a city chip selected AND AI parsed a city, both apply
      // (which will likely return zero results — that's the expected UX,
      // tells the user the chips conflict with their AI query).
      if (aiFilters) {
        if (aiFilters.city) {
          query = query.ilike('city', `%${aiFilters.city}%`)
        }
        if (aiFilters.hood) {
          query = query.ilike('hood', `%${aiFilters.hood}%`)
        }
        if (aiFilters.type) {
          query = query.eq('type', aiFilters.type)
        }
        if (aiFilters.min_price != null) {
          query = query.gte('price', aiFilters.min_price)
        }
        if (aiFilters.max_price != null) {
          query = query.lte('price', aiFilters.max_price)
        }
        if (aiFilters.min_beds != null) {
          query = query.gte('beds', aiFilters.min_beds)
        }
        if (aiFilters.min_baths != null) {
          query = query.gte('baths', aiFilters.min_baths)
        }
        if (aiFilters.min_sqft != null) {
          query = query.gte('sqft', aiFilters.min_sqft)
        }
        // Keywords: OR-match any keyword against the description column.
        // e.g. ["modern", "yard"] becomes:
        //   description ILIKE '%modern%' OR description ILIKE '%yard%'
        if (aiFilters.keywords && aiFilters.keywords.length > 0) {
          const orClauses = aiFilters.keywords
            .map((k) => `description.ilike.%${k}%`)
            .join(',')
          query = query.or(orClauses)
        }
      }

      const { data, error } = await query.limit(100)
      if (cancelled) return
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      if (!data || data.length === 0) {
        setListings([])
        setLoading(false)
        return
      }

      const listingIds = data.map((l) => l.id)

      // Fetch comment counts (unchanged)
      const { data: commentCounts } = await supabase
        .from('comments')
        .select('listing_id')
        .in('listing_id', listingIds)
        .eq('is_hidden', false)

      const countMap = {}
      commentCounts?.forEach((c) => {
        countMap[c.listing_id] = (countMap[c.listing_id] || 0) + 1
      })

      const enriched = data.map((l) => ({
        ...l,
        comment_count: countMap[l.id] || 0,
      }))

      if (!cancelled) {
        setListings(enriched)
        setLoading(false)
      }
    }

    fetchListings()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, type, search, aiFiltersKey])

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
    return () => {
      cancelled = true
    }
  }, [id])

  return { listing, loading, error }
}

export async function toggleListingLike(listingId, userId, currentLiked, currentCount) {
  if (!userId) return { liked: currentLiked, count: currentCount }

  if (currentLiked) {
    // Unlike
    await supabase
      .from('listing_likes')
      .delete()
      .eq('listing_id', listingId)
      .eq('user_id', userId)

    await supabase
      .from('listings')
      .update({ likes_count: Math.max(0, currentCount - 1) })
      .eq('id', listingId)

    return { liked: false, count: Math.max(0, currentCount - 1) }
  } else {
    // Like
    await supabase
      .from('listing_likes')
      .insert({ listing_id: listingId, user_id: userId })

    await supabase
      .from('listings')
      .update({ likes_count: currentCount + 1 })
      .eq('id', listingId)

    return { liked: true, count: currentCount + 1 }
  }
}

export async function getListingLikeStatus(listingId, userId) {
  if (!userId) return false
  const { data } = await supabase
    .from('listing_likes')
    .select('id')
    .eq('listing_id', listingId)
    .eq('user_id', userId)
    .single()
  return !!data
}