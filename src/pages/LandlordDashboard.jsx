import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import TopNav from '../components/TopNav'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

const CATEGORIES = ['Legal & Leases', 'Maintenance & Repairs', 'Tenant Screening', 'Rent & Pricing', 'General Questions', 'Referrals']

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']

export default function LandlordDashboard() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('listings')
  const [claimedListings, setClaimedListings] = useState([])
  const [listingsLoading, setListingsLoading] = useState(true)
  const [totalComments, setTotalComments] = useState(0)
  const [sentiment, setSentiment] = useState({})

  // Community state
  const [communityPosts, setCommunityPosts] = useState([])
  const [communityLoading, setCommunityLoading] = useState(false)
  const [postContent, setPostContent] = useState('')
  const [postCategory, setPostCategory] = useState('General Questions')
  const [postCity, setPostCity] = useState(profile?.city || '')
  const [postState, setPostState] = useState('NJ')
  const [posting, setPosting] = useState(false)
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterState, setFilterState] = useState('all')
  const [filterCity, setFilterCity] = useState('')

  useEffect(() => {
    if (!user) { navigate('/signin'); return }
    fetchClaimedListings()
  }, [user])

  useEffect(() => {
    if (activeTab === 'community') fetchCommunityPosts()
  }, [activeTab, filterCategory, filterState, filterCity])

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

    // Get comment counts per listing
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

    // Simple sentiment — count positive keywords
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

  async function fetchCommunityPosts() {
    setCommunityLoading(true)
    let query = supabase
      .from('community_posts')
      .select('*, author:user_id(id, name, photo_url, account_type)')
      .order('created_at', { ascending: false })
      .limit(50)

    if (filterCategory !== 'all') query = query.eq('category', filterCategory)
    if (filterState !== 'all') query = query.eq('state', filterState)
    if (filterCity.trim()) query = query.ilike('city', `%${filterCity.trim()}%`)

    const { data } = await query
    setCommunityPosts(data || [])
    setCommunityLoading(false)
  }

  async function handlePost() {
    if (!postContent.trim()) return
    setPosting(true)
    await supabase.from('community_posts').insert({
      user_id: user.id,
      content: postContent.trim(),
      category: postCategory,
      city: postCity.trim() || null,
      state: postState || null,
    })
    setPostContent('')
    setPosting(false)
    fetchCommunityPosts()
  }

  async function handleDeletePost(postId) {
    await supabase.from('community_posts').delete().eq('id', postId)
    setCommunityPosts(prev => prev.filter(p => p.id !== postId))
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
    <div style={{ minHeight: '100vh', background: '#fff7ed' }}>
      <TopNav />
      <div style={styles.page}>

        {/* Welcome banner */}
        <div style={styles.welcomeBanner}>
          <div style={styles.welcomeAvatar}>
            {profile?.photo_url ? <img src={profile.photo_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}/> : <span style={{ fontSize: 28 }}>🏡</span>}
          </div>
          <div style={{ flex: 1 }}>
            <div style={styles.welcomeName}>Welcome back, {profile?.name?.split(' ')[0]}</div>
            <div style={styles.welcomeSub}>
              {profile?.company ? `${profile.company} · ` : 'Individual Landlord · '}Free Account
            </div>
          </div>
          <div style={styles.verifiedBadge}>✓ Verified Landlord</div>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Claimed Listings</div>
            <div style={{ ...styles.statVal, color: '#ea580c' }}>{claimedListings.length}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Comments</div>
            <div style={{ ...styles.statVal, color: '#0f172a' }}>{totalComments}</div>
          </div>
        </div>

        {/* Sub tabs */}
        <div style={styles.tabRow}>
          <button onClick={() => setActiveTab('listings')} style={{ ...styles.tab, ...(activeTab === 'listings' ? styles.tabActive : {}) }}>
            🏠 My Listings
          </button>
          <button onClick={() => setActiveTab('community')} style={{ ...styles.tab, ...(activeTab === 'community' ? styles.tabActive : {}) }}>
            👥 Landlord Community
          </button>
        </div>

        {/* My Listings tab */}
        {activeTab === 'listings' && (
          <>
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>🏠 Your Claimed Listings</h2>
                <Link to="/add-listing" style={styles.postBtn}>+ Post a Listing</Link>
              </div>

              {listingsLoading ? (
                <div style={styles.center}><div style={styles.spinner}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
              ) : claimedListings.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🏠</div>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>No claimed listings yet</div>
                  <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Find your building on Chathouse and claim it to manage it here.</div>
                  <Link to="/listings" style={styles.postBtn}>Browse listings to claim →</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {claimedListings.map(l => (
                    <Link key={l.id} to={`/listing/${l.id}`} style={styles.listingCard}>
                      <div style={styles.listingIcon}>🏠</div>
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
          </>
        )}

        {/* Landlord Community tab */}
        {activeTab === 'community' && (
          <div style={styles.section}>
            {/* Filters */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Filter by location</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                <select value={filterState} onChange={e => setFilterState(e.target.value)} style={styles.filterSelect}>
                  <option value="all">All States</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input value={filterCity} onChange={e => setFilterCity(e.target.value)} placeholder="Filter by city..." style={{ ...styles.filterSelect, flex: 1 }}/>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Category</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button onClick={() => setFilterCategory('all')} style={{ ...styles.catChip, ...(filterCategory === 'all' ? styles.catChipActive : {}) }}>All</button>
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setFilterCategory(c)} style={{ ...styles.catChip, ...(filterCategory === c ? styles.catChipActive : {}) }}>{c}</button>
                ))}
              </div>
            </div>

            {/* Category description */}
            {filterCategory !== 'all' && (
              <div style={styles.catBanner}>
                🏠 {filterCategory} — {getCategoryDesc(filterCategory)}
              </div>
            )}

            {/* Post composer */}
            <div style={styles.composer}>
              <div style={styles.composerAvatar}>
                {profile?.photo_url ? <img src={profile.photo_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}/> : <div style={styles.composerAvatarInitial}>{profile?.name?.[0]?.toUpperCase()}</div>}
              </div>
              <div style={{ flex: 1 }}>
                <textarea
                  value={postContent}
                  onChange={e => setPostContent(e.target.value)}
                  placeholder={`Ask the ${filterState !== 'all' ? filterState : ''} landlord community something...`}
                  style={styles.composerInput}
                  rows={3}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <select value={postCategory} onChange={e => setPostCategory(e.target.value)} style={styles.postSelect}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input value={postCity} onChange={e => setPostCity(e.target.value)} placeholder="Your city" style={{ ...styles.postSelect, width: 120 }}/>
                  <select value={postState} onChange={e => setPostState(e.target.value)} style={{ ...styles.postSelect, width: 80 }}>
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={handlePost} disabled={posting || !postContent.trim()} style={{ ...styles.postBtn, opacity: posting || !postContent.trim() ? 0.5 : 1, marginLeft: 'auto' }}>
                    {posting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </div>

            {/* Posts feed */}
            {communityLoading ? (
              <div style={styles.center}><div style={styles.spinner}/></div>
            ) : communityPosts.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>No posts yet</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>Be the first to start a conversation with the landlord community.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
                {communityPosts.map(post => (
                  <div key={post.id} style={styles.postCard}>
                    <div style={styles.postHeader}>
                      <div style={styles.postAvatar}>
                        {post.author?.photo_url ? <img src={post.author.photo_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}/> : <div style={styles.postAvatarInitial}>{post.author?.name?.[0]?.toUpperCase()}</div>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={styles.postName}>{post.author?.name}</span>
                          <span style={styles.verifiedTag}>✓ Verified Landlord</span>
                          {post.city && post.state && <span style={{ fontSize: 11, color: '#64748b' }}>📍 {post.city}, {post.state}</span>}
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>{timeAgo(post.created_at)}</span>
                        </div>
                        <span style={styles.catTag}>{post.category}</span>
                      </div>
                      {post.user_id === user.id && (
                        <button onClick={() => handleDeletePost(post.id)} style={styles.deleteBtn}>🗑️</button>
                      )}
                    </div>
                    <p style={styles.postContent}>{post.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

function getCategoryDesc(cat) {
  const descs = {
    'Legal & Leases': 'Lease questions, evictions, tenant rights, local laws',
    'Maintenance & Repairs': 'Repairs, contractors, maintenance tips',
    'Tenant Screening': 'Background checks, applications, red flags',
    'Rent & Pricing': 'Market rates, rent increases, pricing strategy',
    'General Questions': 'Anything landlord-related',
    'Referrals': 'Contractor, attorney, and vendor referrals',
  }
  return descs[cat] || cat
}

const styles = {
  page: { maxWidth: 860, margin: '0 auto', padding: '24px 20px 60px' },
  welcomeBanner: { display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px', borderRadius: 16, marginBottom: 16, background: 'linear-gradient(135deg, #ffedd5, #fed7aa)', border: '1.5px solid #fdba74', flexWrap: 'wrap' },
  welcomeAvatar: { width: 56, height: 56, borderRadius: '50%', background: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' },
  welcomeName: { fontSize: 20, fontWeight: 800, color: '#7c2d12', fontFamily: 'var(--serif)' },
  welcomeSub: { fontSize: 13, color: '#c2410c', marginTop: 2 },
  verifiedBadge: { padding: '8px 16px', borderRadius: 100, background: '#ea580c', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 },
  statCard: { padding: 20, background: '#fff', borderRadius: 14, border: '1.5px solid #e2e8f0' },
  statLabel: { fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 6 },
  statVal: { fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 800 },
  tabRow: { display: 'flex', gap: 0, borderBottom: '2px solid #e2e8f0', marginBottom: 16 },
  tab: { padding: '12px 20px', background: 'none', border: 'none', fontSize: 14, fontWeight: 600, color: '#64748b', cursor: 'pointer', borderBottom: '2px solid transparent', marginBottom: -2 },
  tabActive: { color: '#ea580c', borderBottomColor: '#ea580c' },
  section: { background: '#fff', borderRadius: 16, border: '1.5px solid #e2e8f0', padding: 24, marginBottom: 16 },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 },
  sectionTitle: { fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 700, color: '#0f172a' },
  postBtn: { padding: '8px 16px', background: '#ea580c', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none', border: 'none', cursor: 'pointer' },
  listingCard: { display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: '#fff7ed', borderRadius: 12, border: '1px solid #fed7aa', textDecoration: 'none', color: 'inherit' },
  listingIcon: { width: 40, height: 40, borderRadius: 10, background: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 },
  listingAddress: { fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 2 },
  listingMeta: { fontSize: 12, color: '#64748b' },
  verifiedTag: { fontSize: 11, fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: 100 },
  commentCount: { fontSize: 12, color: '#64748b', fontWeight: 600 },
  sentimentTrack: { height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
  sentimentBar: { height: '100%', borderRadius: 4, transition: 'width 0.5s ease' },
  filterSelect: { padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, color: '#0f172a', outline: 'none', background: '#fff' },
  catChip: { padding: '6px 12px', border: '1.5px solid #e2e8f0', borderRadius: 100, background: '#fff', fontSize: 12, fontWeight: 600, color: '#64748b', cursor: 'pointer', whiteSpace: 'nowrap' },
  catChipActive: { background: '#ea580c', color: '#fff', borderColor: '#ea580c' },
  catBanner: { padding: '10px 14px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, fontSize: 13, color: '#92400e', marginBottom: 14 },
  composer: { display: 'flex', gap: 12, alignItems: 'flex-start', padding: '16px 0 12px', borderBottom: '1px solid #f1f5f9', marginBottom: 4 },
  composerAvatar: { width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  composerAvatarInitial: { color: '#fff', fontSize: 16, fontWeight: 700 },
  composerInput: { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, color: '#0f172a', outline: 'none', resize: 'vertical', fontFamily: 'inherit', background: '#f8fafc', boxSizing: 'border-box' },
  postSelect: { padding: '7px 10px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 12, color: '#0f172a', outline: 'none', background: '#fff' },
  postCard: { padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' },
  postHeader: { display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  postAvatar: { width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  postAvatarInitial: { color: '#fff', fontSize: 14, fontWeight: 700 },
  postName: { fontSize: 13, fontWeight: 700, color: '#0f172a' },
  catTag: { display: 'inline-block', fontSize: 10, fontWeight: 700, color: '#ea580c', background: '#fff7ed', padding: '2px 8px', borderRadius: 100, marginTop: 4 },
  postContent: { fontSize: 14, color: '#334155', lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap' },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, opacity: 0.5, padding: 4, marginLeft: 'auto' },
  emptyState: { textAlign: 'center', padding: '32px 20px' },
  center: { display: 'flex', justifyContent: 'center', padding: 32 },
  spinner: { width: 32, height: 32, borderRadius: '50%', border: '3px solid #ffedd5', borderTop: '3px solid #ea580c', animation: 'spin 0.8s linear infinite' },
  postAvatarBig: { width: 38, height: 38 },
}
