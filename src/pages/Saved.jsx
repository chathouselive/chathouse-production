import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import TopNav from '../components/TopNav'
import ListingCard from '../components/ListingCard'
import Footer from '../components/Footer'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

/* ============================================================
   Inline SVG icons
   ============================================================ */
const Icon = {
  Heart: ({ size = 32, filled = false }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  ArrowRight: ({ size = 13 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
}

export default function Saved() {
  const { user } = useAuth()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchSavedListings()
  }, [user])

  async function fetchSavedListings() {
    setLoading(true)

    // Step 1: Get the user's saved listing_ids ordered by save date (most recent first)
    const { data: likes, error: likesError } = await supabase
      .from('listing_likes')
      .select('listing_id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (likesError) {
      console.error('[Saved] failed to fetch likes:', likesError)
      setListings([])
      setLoading(false)
      return
    }

    if (!likes || likes.length === 0) {
      setListings([])
      setLoading(false)
      return
    }

    // Step 2: Fetch the actual listing rows for those IDs
    const listingIds = likes.map(l => l.listing_id)
    const { data: fetchedListings, error: listingsError } = await supabase
      .from('listings')
      .select('*')
      .in('id', listingIds)

    if (listingsError) {
      console.error('[Saved] failed to fetch listings:', listingsError)
      setListings([])
      setLoading(false)
      return
    }

    // Step 3: Preserve save-order (the .in() query loses ordering, so re-sort by likes order)
    const orderMap = new Map(likes.map((l, i) => [l.listing_id, i]))
    const sorted = (fetchedListings || []).sort(
      (a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0)
    )

    setListings(sorted)
    setLoading(false)
  }

  const count = listings.length

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <TopNav />

      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.heading}>
              {loading ? 'Loading...' : `${count} saved listing${count === 1 ? '' : 's'}`}
            </h1>
            <p style={styles.sub}>Listings you've saved for later</p>
          </div>
        </div>

        {loading && (
          <div style={styles.center}>
            <div style={styles.spinner}/>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {!loading && listings.length === 0 && (
          <div style={styles.empty}>
            <div style={styles.emptyIconWrap}><Icon.Heart size={32}/></div>
            <h2 style={styles.emptyTitle}>No saved listings yet</h2>
            <p style={styles.emptyBody}>
              Tap the heart on any listing to save it here for later.
            </p>
            <Link to="/listings" style={styles.emptyBtn}>
              Browse listings <Icon.ArrowRight size={13}/>
            </Link>
          </div>
        )}

        {!loading && listings.length > 0 && (
          <div style={styles.grid}>
            {listings.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

const styles = {
  main: { maxWidth: 1160, margin: '0 auto', padding: '28px 20px' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
    marginBottom: 20, flexWrap: 'wrap', gap: 12,
  },
  heading: { fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 700, color: '#0f172a', margin: 0 },
  sub: { fontSize: 14, color: '#64748b', marginTop: 2 },

  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 },

  center: { display: 'flex', justifyContent: 'center', padding: 60 },
  spinner: {
    width: 36, height: 36, borderRadius: '50%',
    borderWidth: 3, borderStyle: 'solid', borderColor: '#e8f0fe',
    borderTopColor: '#1a6cf5',
    animation: 'spin 0.8s linear infinite',
  },

  empty: {
    textAlign: 'center', padding: '60px 20px',
    background: '#fff', borderRadius: 16,
    borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0',
    boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
  },
  emptyIconWrap: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 64, height: 64, borderRadius: 16,
    background: '#fee2e2', color: '#ef4444',
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 700,
    color: '#0f172a', marginBottom: 6,
  },
  emptyBody: {
    color: '#64748b', maxWidth: 380, margin: '0 auto 20px',
    lineHeight: 1.6, fontSize: 14,
  },
  emptyBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '10px 20px',
    background: '#1a6cf5', color: '#fff',
    borderRadius: 10, fontSize: 13, fontWeight: 700,
    textDecoration: 'none',
    transition: 'background 120ms ease',
  },
}