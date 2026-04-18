import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { useAuth } from './AuthContext'

export function useVerification(listingId) {
  const { user } = useAuth()
  const [status, setStatus] = useState(null) // null | 'pending' | 'approved' | 'rejected' | 'none'
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !listingId) {
      setLoading(false)
      return
    }
    let cancelled = false

    async function check() {
      const { data, error } = await supabase
        .from('tenant_verifications')
        .select('status')
        .eq('user_id', user.id)
        .eq('listing_id', listingId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (cancelled) return
      if (error || !data) setStatus('none')
      else setStatus(data.status)
      setLoading(false)
    }

    check()
    return () => { cancelled = true }
  }, [user, listingId])

  async function submitVerification({ file, documentType, address }) {
    if (!user || !listingId) return { error: 'Not ready' }

    // Upload file to private storage bucket
    const ext = file.name.split('.').pop()
    const path = `${user.id}/${listingId}-${Date.now()}.${ext}`
    const { error: uploadErr } = await supabase.storage
      .from('verification-docs')
      .upload(path, file)
    if (uploadErr) return { error: uploadErr.message }

    // Create verification record
    const { error: insertErr } = await supabase
      .from('tenant_verifications')
      .insert({
        user_id: user.id,
        listing_id: listingId,
        address,
        document_url: path,
        document_type: documentType,
        status: 'pending',
      })
    if (insertErr) return { error: insertErr.message }

    setStatus('pending')
    return { success: true }
  }

  return { status, loading, submitVerification }
}
