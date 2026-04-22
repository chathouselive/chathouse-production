import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import TopNav from '../components/TopNav'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

export default function ManagerDashboard() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [claimedListings, setClaimedListings] = useState([])
  const [listingsLoading, setListingsLoading] = useState(true)
  const [totalComments, setTotalComments] = useState(0)
  const [sentiment, setSentiment] = useState({})

  useEffect(() => {
    if (!user) { navigate('/signin'); return }
    fetchClaimedListings()
  }, [user])

  async function fetchClaimedListings() {
    setListingsLoading(true)
    const { data: listings } = await supabase
      .from('listings')
      .select('id, address, hood, city, created_at, is_active')
      .eq('claimed_by', user.id)
      .order('created_at', { ascending: false })

    if (!listings || listings.length === 0) {
      setClaimedListings([])
      setListingsLoading(false)
      return
    }

    const listingIds = listings.map(l => l.id)

    const { data: comments } = await supabase
      .from('comments')
      .select('listing_id, text')
      .in('listing_id', listingIds)
      .eq('is_hidden', false)

    const countMap = {}
    const textMap = {}
    comments?.forEach(c => {
      countMap[c.listing_id] = (countMap[c.listing_id] || 0) + 1
      if (!textMap[c.listing_id]) textMap[c.listing_id] = []
      textMap[c.listing_id].push(c.text)
    })

    const POSITIVE = ['great','good','love','excellent','clean','responsive','nice','recommend','quiet','safe','friendly','happy','perfect','wonderful','amazing']
    const NEGATIVE = ['bad','terrible','horrible','awful','dirty','noisy','unsafe','avoid','poor','broken','mold','pest','roach','mice','ignored','slow']

    const sentimentMap = {}
    Object.entries(textMap).forEach(([id, texts]) => {
      let pos = 0, neg = 0
      texts.forEach(t => {
        const lower = t.toLowerCase()
        POSITIVE.forEach(w => { if (lower.includes(w)) pos++ })
        NEGATIVE.forEach(w => { if (lower.includes(w)) neg++ })
      })
      const total = pos + neg
      sentimentMap[id] = total > 0 ? Math.round((pos / total) * 100) : null
    })

    setSentiment(sentimentMap)
    setTotalComments(Object.values(countMap).reduce((s, c) => s + c, 0))
    setClaimedListings(listings.map(l => ({ ...l, commentCount: countMap[l.id] || 0 })))
    setListingsLoading(false)
  }

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000), hours = Math.floor(diff / 3600000), days = Math.floor(diff / 86400000)
    if (mins < 1) return 'just now'; if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`; if (days < 7) return `${days}d ago`
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  function sentimentColor(pct) {
    if (pct >= 75) return '#16a34a'
    if (pct >= 50) return '#d97706'
    return '#dc2626'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff1f2' }}>
      <TopNav />
      <div style={styles.page}>

        {/* Welcome banner */}
        <div style={styles.welcomeBanner}>
          <div style={styles.welcomeAvatar}>
            {profile?.photo_url ? <img src={profile.photo_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}/> : <span style={{ fontSize: 28 }}>🏢</span>}
          </div>
          <div style={{ flex: 1 }}>
            <div style={styles.welcomeName}>Welcome back, {profile?.name?.split(' ')[0]}</div>
            <div style={styles.welcomeSub}>
              {profile?.company ? `${profile.company} · ` : ''}Pro plan
            </div>
          </div>
          <div style={styles.verifiedBadge}>✓ Verified Manager</div>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Claimed Listings</div>
            <div style={{ ...styles.statVal, color: '#dc2626' }}>{claimedListings.length}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Comments</div>
            <div style={{ ...styles.statVal, color: '#0f172a' }}>{totalComments}</div>
          </div>
        </div>

        {/* Claimed Listings */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>🏢 Your Claimed Listings</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/listings" style={{ ...styles.actionBtn, background: '#fff', color: '#dc2626', border: '1.5px solid #dc2626' }}>+ Claim Existing</Link>
              <Link to="/add-listing" style={styles.actionBtn}>+ Post a Listing</Link>
            </div>
          </div>

          {listingsLoading ? (
            <div style={styles.center}><div style={styles.spinner}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
          ) : claimedListings.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🏢</div>
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>No claimed listings yet</div>
              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Find your buildings on Chathouse and claim them to manage them here.</div>
              <Link to="/listings" style={styles.actionBtn}>Browse listings to claim →</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {claimedListings.map(l => (
                <Link key={l.id} to={`/listing/${l.id}`} style={styles.listingCard}>
                  <div style={styles.listingIcon}>🏢</div>
                  <div style={{ flex: 1 }}>
                    <div style={styles.listingAddress}>{l.address}</div>
                    <div style={styles.listingMeta}>📍 {l.hood || l.city} · Claimed {timeAgo(l.created_at)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    <span style={styles.verifiedTag}>✓ Verified</span>
                    <span style={styles.commentCount}>💬 {l.commentCount}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Portfolio Sentiment */}
        {claimedListings.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>📊 Portfolio Sentiment</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {claimedListings.map(l => {
                const pct = sentiment[l.id]
                return (
                  <div key={l.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: '#334155' }}>{l.address}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: pct != null ? sentimentColor(pct) : '#94a3b8' }}>
                        {pct != null ? `${pct}% positive` : 'No comments yet'}
                      </span>
                    </div>
                    <div style={styles.sentimentTrack}>
                      <div style={{ ...styles.sentimentBar, width: `${pct || 0}%`, background: pct != null ? sentimentColor(pct) : '#e2e8f0' }}/>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Zip Code Advertising */}
        <div style={styles.section}>
          <div style={{ background: 'linear-gradient(135deg, #fff1f2, #ffe4e6)', border: '1.5px solid #fecdd3', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#881337', marginBottom: 4 }}>📍 Zip Code Advertising</div>
                <div style={{ fontSize: 13, color: '#be123c', maxWidth: 340, lineHeight: 1.5 }}>Own a zip code and get featured placement when renters browse listings in that area.</div>
                <div style={{ fontSize: 11, color: '#dc2626', marginTop: 6, fontStyle: 'italic' }}>Note: Featured placement is paid — not an editorial recommendation.</div>
              </div>
              <button style={{ padding: '10px 20px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'not-allowed', opacity: 0.7 }} disabled>
                Coming Soon
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

const styles = {
  page: { maxWidth: 860, margin: '0 auto', padding: '24px 20px 60px' },
  welcomeBanner: { display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px', borderRadius: 16, marginBottom: 16, background: 'linear-gradient(135deg, #ffe4e6, #fecdd3)', border: '1.5px solid #fca5a5', flexWrap: 'wrap' },
  welcomeAvatar: { width: 56, height: 56, borderRadius: '50%', background: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' },
  welcomeName: { fontSize: 20, fontWeight: 800, color: '#7f1d1d', fontFamily: 'var(--serif)' },
  welcomeSub: { fontSize: 13, color: '#dc2626', marginTop: 2 },
  verifiedBadge: { padding: '8px 16px', borderRadius: 100, background: '#dc2626', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 },
  statCard: { padding: 20, background: '#fff', borderRadius: 14, border: '1.5px solid #e2e8f0' },
  statLabel: { fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 6 },
  statVal: { fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 800 },
  section: { background: '#fff', borderRadius: 16, border: '1.5px solid #e2e8f0', padding: 24, marginBottom: 16 },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 },
  sectionTitle: { fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 700, color: '#0f172a' },
  actionBtn: { padding: '8px 16px', background: '#dc2626', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none', border: 'none', cursor: 'pointer' },
  listingCard: { display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: '#fff1f2', borderRadius: 12, border: '1px solid #fecdd3', textDecoration: 'none', color: 'inherit' },
  listingIcon: { width: 40, height: 40, borderRadius: 10, background: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 },
  listingAddress: { fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 2 },
  listingMeta: { fontSize: 12, color: '#64748b' },
  verifiedTag: { fontSize: 11, fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: 100 },
  commentCount: { fontSize: 12, color: '#64748b', fontWeight: 600 },
  sentimentTrack: { height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
  sentimentBar: { height: '100%', borderRadius: 4, transition: 'width 0.5s ease' },
  emptyState: { textAlign: 'center', padding: '32px 20px' },
  center: { display: 'flex', justifyContent: 'center', padding: 32 },
  spinner: { width: 32, height: 32, borderRadius: '50%', border: '3px solid #ffe4e6', borderTop: '3px solid #dc2626', animation: 'spin 0.8s linear infinite' },
}
