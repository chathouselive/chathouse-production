import { useEffect, useState } from 'react'
import { supabase } from './supabase'

// Page size for pagination — number of listings loaded per "Load more" click.
// Initial load also fetches this many.
const PAGE_SIZE = 100

/* ============================================================
   Type bucket helper
   --------------------------------------------------------------
   The DB has 6 type values:
     'sale', 'rent' (legacy), 'rental', 'land', 'commercial', 'multifamily'

   The UI presents simpler buckets:
     "For Rent" → matches 'rent' OR 'rental'
     "For Sale" → matches 'sale'
     "All" → no filter

   This helper converts a UI bucket value into a list of DB type values.
   ============================================================ */
function typesForBucket(bucket) {
  if (bucket === 'rent' || bucket === 'rental') return ['rent', 'rental']
  if (bucket === 'sale') return ['sale']
  return null // 'All' or anything unrecognized → no filter
}

/* ============================================================
   useListings — fetches active listings with optional filtering.

   Params:
     city   — 'All' | a city name. Matches against hood OR city columns.
     type   — 'All' | 'rent' | 'sale'  (UI bucket; mapped via typesForBucket)
     search — free-text search across address/city/hood
     aiFilters — optional object from the AI search Edge Function

   Returns:
     listings — array of listing rows enriched with comment_count
     loading  — true on initial load (not on loadMore)
     loadingMore — true specifically when fetching additional pages
     error    — error message string or null
     hasMore  — true if a "Load more" button should be rendered
     loadMore — function to fetch the next page

   Pagination model:
     - Initial load: fetches PAGE_SIZE listings
     - loadMore(): refetches with limit = current loaded count + PAGE_SIZE
     - hasMore is true when the most recent fetch returned exactly the
       requested limit (meaning more probably exist)
     - When filters change, loadedCount resets to PAGE_SIZE
   ============================================================ */
export function useListings({
  city = null,
  type = null,
  search = '',
  aiFilters = null,
} = {}) {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [loadedCount, setLoadedCount] = useState(PAGE_SIZE)
  const [hasMore, setHasMore] = useState(false)

  // Stable key for the filter dep array — JSON.stringify avoids re-runs
  // when an object with the same contents but different identity is passed.
  const aiFiltersKey = aiFilters ? JSON.stringify(aiFilters) : null

  // Reset pagination when filters change. We track filter values in a
  // separate effect that resets loadedCount whenever anything changes.
  useEffect(() => {
    setLoadedCount(PAGE_SIZE)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, type, search, aiFiltersKey])

  // The main fetch effect — fires when filters change OR when loadedCount changes.
  useEffect(() => {
    let cancelled = false
    async function fetchListings() {
      // First page vs subsequent pages: different loading state
      const isFirstPage = loadedCount === PAGE_SIZE
      if (isFirstPage) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      setError(null)

      let query = supabase
        .from('listings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      // ----- Existing filters -----
      if (city && city !== 'All') {
        query = query.ilike('hood', `%${city}%`).or(`city.ilike.%${city}%`)
      }
      if (type && type !== 'All') {
        const typeList = typesForBucket(type)
        if (typeList && typeList.length > 0) {
          query = query.in('type', typeList)
        }
      }
      if (search) {
        query = query.or(
          `address.ilike.%${search}%,city.ilike.%${search}%,hood.ilike.%${search}%`,
        )
      }

      // ----- AI filters -----
      if (aiFilters) {
        if (aiFilters.city) {
          query = query.ilike('city', `%${aiFilters.city}%`)
        }
        if (aiFilters.hood) {
          query = query.ilike('hood', `%${aiFilters.hood}%`)
        }
        if (aiFilters.type) {
          const aiTypeList = typesForBucket(aiFilters.type)
          if (aiTypeList && aiTypeList.length > 0) {
            query = query.in('type', aiTypeList)
          } else {
            // AI returned a type we don't bucket (e.g. 'land', 'commercial')
            // Pass it through as a direct equality match.
            query = query.eq('type', aiFilters.type)
          }
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
        if (aiFilters.keywords && aiFilters.keywords.length > 0) {
          const orClauses = aiFilters.keywords
            .map((k) => `description.ilike.%${k}%`)
            .join(',')
          query = query.or(orClauses)
        }
      }

      // ----- Pagination -----
      const { data, error } = await query.limit(loadedCount)

      if (cancelled) return

      if (error) {
        setError(error.message)
        setLoading(false)
        setLoadingMore(false)
        return
      }

      const safeData = data || []

      // If we got exactly loadedCount, there's probably more available
      setHasMore(safeData.length === loadedCount)

      if (safeData.length === 0) {
        setListings([])
        setLoading(false)
        setLoadingMore(false)
        return
      }

      const listingIds = safeData.map((l) => l.id)

      // Fetch comment counts
      const { data: commentCounts } = await supabase
        .from('comments')
        .select('listing_id')
        .in('listing_id', listingIds)
        .eq('is_hidden', false)

      const countMap = {}
      commentCounts?.forEach((c) => {
        countMap[c.listing_id] = (countMap[c.listing_id] || 0) + 1
      })

      const enriched = safeData.map((l) => ({
        ...l,
        comment_count: countMap[l.id] || 0,
      }))

      if (!cancelled) {
        setListings(enriched)
        setLoading(false)
        setLoadingMore(false)
      }
    }

    fetchListings()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, type, search, aiFiltersKey, loadedCount])

  function loadMore() {
    setLoadedCount((prev) => prev + PAGE_SIZE)
  }

  return { listings, loading, loadingMore, error, hasMore, loadMore }
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