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
      if (error) setError(error.message)
      else setListings(data || [])
      setLoading(false)
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
