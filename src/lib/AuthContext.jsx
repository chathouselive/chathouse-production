import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) loadProfile(session.user.id)
      else setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      if (session?.user) {
        // For OAuth sign-ins (Google), ensure a profile row exists with the right account_type
        if (event === 'SIGNED_IN') {
          ensureProfileExists(session.user).then(() => loadProfile(session.user.id))
        } else {
          loadProfile(session.user.id)
        }
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned; that's handled by ensureProfileExists
      console.error('Error loading profile:', error)
    } else if (data) {
      setProfile(data)
    }
    setLoading(false)
  }

  // Ensures a profiles row exists with the correct account_type for OAuth users.
  // Two cases handled:
  //   1. Row doesn't exist yet → create it with stashed account_type (or 'buyer' default)
  //   2. Row exists (e.g. created by a DB trigger with default values) → update its
  //      account_type if we have a stashed value, otherwise leave it alone
  // Reads localStorage for the account_type the user picked on the SignUp page.
  async function ensureProfileExists(user) {
    if (!user) return

    // Read & clear the stash before any awaits so it can't leak into another flow
    const pendingAccountType = localStorage.getItem('chathouse_pending_account_type')
    const pendingCity = localStorage.getItem('chathouse_pending_city')
    localStorage.removeItem('chathouse_pending_account_type')
    localStorage.removeItem('chathouse_pending_city')

    const meta = user.user_metadata || {}
    const name =
      meta.name ||
      meta.full_name ||
      meta.preferred_username ||
      (user.email ? user.email.split('@')[0] : 'New member')

    const { data: existing } = await supabase
      .from('profiles')
      .select('id, account_type')
      .eq('id', user.id)
      .maybeSingle()

    if (existing) {
      // Row already exists (likely via a DB trigger). Apply the stashed account_type
      // if we have one — this is the localStorage round-trip from SignUp → Google → back.
      if (pendingAccountType && pendingAccountType !== existing.account_type) {
        const updates = { account_type: pendingAccountType }
        if (pendingCity) updates.city = pendingCity
        const { error: updateErr } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id)
        if (updateErr) console.error('Error updating profile account_type:', updateErr)
      }
      return
    }

    // No existing row — create one. account_type uses the stashed value, or
    // falls back to 'buyer' (Sign In page Google flow has no stash).
    const { error: insertErr } = await supabase.from('profiles').insert({
      id: user.id,
      name,
      email: user.email,
      account_type: pendingAccountType || meta.account_type || 'buyer',
      city: pendingCity || meta.city || null,
      photo_url: meta.avatar_url || meta.picture || null,
    })

    if (insertErr && insertErr.code !== '23505') {
      // 23505 = unique violation; row was created by a concurrent request. Ignore.
      console.error('Error creating profile from OAuth:', insertErr)
    }
  }

  async function signUp({ email, password, name, accountType, city }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, account_type: accountType, city },
      },
    })
    return { data, error }
  }

  async function signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  // Starts Google OAuth flow. Supabase redirects to Google, Google redirects back to Supabase,
  // Supabase redirects to `redirectTo` with a session. The SIGNED_IN listener above takes over.
  async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/listings`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    return { data, error }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function refreshProfile() {
    if (session?.user) await loadProfile(session.user.id)
  }

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}