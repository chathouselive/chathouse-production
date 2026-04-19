import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export function useProfile(userId) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }
    let cancelled = false

    async function load() {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (cancelled) return
      if (error) setError(error.message)
      else setProfile(data)
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [userId])

  return { profile, loading, error }
}

// Upload a profile photo and return its public URL
export async function uploadProfilePhoto(file, userId) {
  if (!file || !userId) return { error: 'Missing file or user id' }
  if (file.size > 5 * 1024 * 1024) return { error: 'Photo must be under 5MB' }

  const ext = file.name.split('.').pop()
  const path = `${userId}/avatar-${Date.now()}.${ext}`

  const { error: uploadErr } = await supabase.storage
    .from('profile-photos')
    .upload(path, file, { upsert: true })
  if (uploadErr) return { error: uploadErr.message }

  const { data: { publicUrl } } = supabase.storage.from('profile-photos').getPublicUrl(path)
  return { url: publicUrl }
}

// Update current user's profile fields
export async function updateMyProfile(updates) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()

  return { data, error }
}
