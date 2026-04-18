import { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabase'

// ─── Overview stats ───
export function useAdminStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const [
      { count: totalUsers },
      { count: buyers },
      { count: agents },
      { count: brokers },
      { count: landlords },
      { count: managers },
      { count: totalListings },
      { count: rentcastListings },
      { count: communityListings },
      { count: totalComments },
      { count: pendingVerifications },
      { count: pendingPhotos },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('account_type', 'buyer'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('account_type', 'agent'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('account_type', 'broker'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('account_type', 'landlord'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('account_type', 'management'),
      supabase.from('listings').select('*', { count: 'exact', head: true }),
      supabase.from('listings').select('*', { count: 'exact', head: true }).eq('source', 'rentcast'),
      supabase.from('listings').select('*', { count: 'exact', head: true }).eq('source', 'community'),
      supabase.from('comments').select('*', { count: 'exact', head: true }),
      supabase.from('tenant_verifications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('photo_submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    ])

    setStats({
      totalUsers, buyers, agents, brokers, landlords, managers,
      totalListings, rentcastListings, communityListings,
      totalComments,
      pendingVerifications, pendingPhotos,
    })
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return { stats, loading, refresh }
}

// ─── Verifications queue ───
export function useVerificationsQueue(statusFilter = 'pending') {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('tenant_verifications')
      .select(`*, profile:profiles!tenant_verifications_user_id_fkey(id,name,email,account_type), listing:listings(id,address,city,state,zip)`)
      .eq('status', statusFilter)
      .order('created_at', { ascending: false })
    setItems(data || [])
    setLoading(false)
  }, [statusFilter])

  useEffect(() => { load() }, [load])

  async function approve(id) {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('tenant_verifications').update({
      status: 'approved',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    }).eq('id', id)
    await load()
  }

  async function reject(id, reason) {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('tenant_verifications').update({
      status: 'rejected',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason || null,
    }).eq('id', id)
    await load()
  }

  async function getDocumentUrl(path) {
    const { data, error } = await supabase.storage
      .from('verification-docs')
      .createSignedUrl(path, 60 * 5) // 5 min
    if (error) return null
    return data?.signedUrl
  }

  return { items, loading, approve, reject, getDocumentUrl, refresh: load }
}

// ─── Photo submissions queue ───
export function usePhotoQueue(statusFilter = 'pending') {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('photo_submissions')
      .select(`*, profile:profiles!photo_submissions_user_id_fkey(id,name,email), listing:listings(id,address,city,state,zip,img_url)`)
      .eq('status', statusFilter)
      .order('created_at', { ascending: false })
    setItems(data || [])
    setLoading(false)
  }, [statusFilter])

  useEffect(() => { load() }, [load])

  async function approve(submission) {
    const { data: { user } } = await supabase.auth.getUser()
    // Update submission status
    await supabase.from('photo_submissions').update({
      status: 'approved',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    }).eq('id', submission.id)
    // Replace listing's cover photo
    await supabase.from('listings').update({
      img_url: submission.photo_url,
    }).eq('id', submission.listing_id)
    await load()
  }

  async function reject(id, reason) {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('photo_submissions').update({
      status: 'rejected',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason || null,
    }).eq('id', id)
    await load()
  }

  return { items, loading, approve, reject, refresh: load }
}

// ─── Users directory ───
export function useAdminUsers(search = '') {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200)
      if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
      const { data } = await query
      if (!cancelled) {
        setUsers(data || [])
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [search])

  return { users, loading }
}

// ─── Listings directory (admin) ───
export function useAdminListings({ source = 'all', search = '' } = {}) {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
    if (source !== 'all') query = query.eq('source', source)
    if (search) query = query.or(`address.ilike.%${search}%,city.ilike.%${search}%`)
    const { data } = await query
    setListings(data || [])
    setLoading(false)
  }, [source, search])

  useEffect(() => { load() }, [load])

  async function deleteListing(id) {
    await supabase.from('listings').delete().eq('id', id)
    await load()
  }

  async function toggleActive(id, isActive) {
    await supabase.from('listings').update({ is_active: isActive }).eq('id', id)
    await load()
  }

  return { listings, loading, deleteListing, toggleActive, refresh: load }
}

// ─── Manual sync trigger ───
export async function triggerRentcastSync(city = null) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'Not authenticated' }

  const body = city ? { city } : {}
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-rentcast`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  )

  if (!response.ok) return { error: `Sync failed (${response.status})` }
  return { data: await response.json() }
}
