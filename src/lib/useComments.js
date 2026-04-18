import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export function useComments(listingId) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!listingId) return
    let cancelled = false

    async function load() {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profile:profiles!comments_user_id_fkey (id, name, photo_url, account_type, is_admin)
        `)
        .eq('listing_id', listingId)
        .eq('is_hidden', false)
        .order('created_at', { ascending: false })

      if (cancelled) return
      if (!error) setComments(data || [])
      setLoading(false)
    }

    load()

    // Real-time subscription — new comments appear live
    const channel = supabase
      .channel(`comments-${listingId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments', filter: `listing_id=eq.${listingId}` },
        async (payload) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, name, photo_url, account_type, is_admin')
            .eq('id', payload.new.user_id)
            .single()
          setComments(prev => [{ ...payload.new, profile }, ...prev])
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'comments', filter: `listing_id=eq.${listingId}` },
        (payload) => {
          setComments(prev => prev.map(c => c.id === payload.new.id ? { ...c, ...payload.new } : c))
        }
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [listingId])

  async function postComment({ text, roleLabel, isAnonymous }) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        listing_id: listingId,
        user_id: user.id,
        text,
        role_label: roleLabel,
        is_anonymous: isAnonymous || false,
      })
      .select()
      .single()

    return { data, error }
  }

  async function toggleLike(commentId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: existing } = await supabase
      .from('comment_likes')
      .select('*')
      .eq('comment_id', commentId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (existing) {
      await supabase.from('comment_likes').delete().eq('comment_id', commentId).eq('user_id', user.id)
    } else {
      await supabase.from('comment_likes').insert({ comment_id: commentId, user_id: user.id })
    }
  }

  return { comments, loading, postComment, toggleLike }
}
