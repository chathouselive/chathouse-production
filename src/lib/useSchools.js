import { useState, useEffect } from 'react'
import { supabase } from './supabase'

/* ============================================================
   useSchools — fetch nearby schools for a listing
   --------------------------------------------------------------
   Queries listing_schools joined with schools for the given
   listingId. Returns up to 10 schools sorted by distance ascending.

   Shape: { schools, loading, error }
   - schools: array of { id, name, school_type, grade_low,
     grade_high, city, district_name, distance_miles }
   - loading: boolean
   - error: string | null
   ============================================================ */
export function useSchools(listingId) {
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!listingId) {
      setSchools([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    async function fetchSchools() {
      const { data, error: fetchErr } = await supabase
        .from('listing_schools')
        .select(`
          distance_miles,
          schools (
            id,
            name,
            school_type,
            grade_low,
            grade_high,
            city,
            district_name
          )
        `)
        .eq('listing_id', listingId)
        .order('distance_miles', { ascending: true })
        .limit(10)

      if (cancelled) return

      if (fetchErr) {
        setError(fetchErr.message)
        setSchools([])
      } else {
        // Flatten the embedded schools object into a single row per result
        const flattened = (data || []).map((row) => ({
          ...row.schools,
          distance_miles: row.distance_miles,
        }))
        setSchools(flattened)
      }
      setLoading(false)
    }

    fetchSchools()

    return () => { cancelled = true }
  }, [listingId])

  return { schools, loading, error }
}