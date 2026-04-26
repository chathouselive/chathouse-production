import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import TopNav from '../components/TopNav'
import Footer from '../components/Footer'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

const CATEGORIES = ['Legal & Leases', 'Maintenance & Repairs', 'Tenant Screening', 'Rent & Pricing', 'General Questions', 'Referrals']

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']

/* ============================================================
   Inline SVG icons — matching the rest of the app
   ============================================================ */
const Icon = {
  Home: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Users: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Megaphone: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 11 22 2 22 22 3 13 3 11"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
    </svg>
  ),
  Pin: ({ size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Message: ({ size = 13 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  Check: ({ size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Plus: ({ size = 13 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Bolt: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  X: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Trash: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
    </svg>
  ),
  Info: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
  Reply: ({ size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
    </svg>
  ),
}

/* Role pill (landlord) */
const ROLE_STYLES = {
  buyer:      { label: 'Buyer / Renter',  bg: '#f1f5f9', fg: '#475569' },
  agent:      { label: 'Agent',           bg: '#dbeafe', fg: '#1d4ed8' },
  broker:     { label: 'Mortgage Broker', bg: '#ede9fe', fg: '#6d28d9' },
  landlord:   { label: 'Landlord',        bg: '#dcfce7', fg: '#15803d' },
  management: { label: 'Property Manager',bg: '#ffedd5', fg: '#c2410c' },
}

function RolePill({ accountType, size = 'md' }) {
  const style = ROLE_STYLES[accountType] || ROLE_STYLES.buyer
  const dims = size === 'sm'
    ? { padding: '2px 8px', fontSize: 10 }
    : { padding: '4px 10px', fontSize: 11 }
  return (
    <span style={{
      display: 'inline-block', borderRadius: 100,
      fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase',
      background: style.bg, color: style.fg, ...dims,
    }}>{style.label}</span>
  )
}

function Avatar({ profile, size = 32 }) {
  if (profile?.photo_url) {
    return <img src={profile.photo_url} alt={profile.name || ''} style={{
      width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, display: 'block',
    }}/>
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, #1a6cf5, #f97316)',
      color: '#fff', fontSize: size <= 32 ? 13 : size <= 48 ? 16 : 22,
      fontWeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>{profile?.name?.[0]?.toUpperCase() || '?'}</div>
  )
}

function formatJoinedDate(isoString) {
  if (!isoString) return null
  try { return new Date(isoString).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) } catch { return null }
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000), hours = Math.floor(diff / 3600000), days = Math.floor(diff / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function sentimentColor(pct) {
  if (pct >= 75) return '#16a34a'
  if (pct >= 50) return '#d97706'
  return '#dc2626'
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

/* ============================================================
   WelcomeStrip
   ============================================================ */
function WelcomeStrip({ profile }) {
  const joinedDate = formatJoinedDate(profile.created_at)
  const metaPieces = []
  if (profile.company) metaPieces.push(profile.company)
  else metaPieces.push('Individual Landlord')
  if (joinedDate) metaPieces.push(`Member since ${joinedDate}`)

  return (
    <div style={styles.welcomeStrip}>
      <Avatar profile={profile} size={48}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={styles.welcomeName}>
          Welcome back, {profile.name?.split(' ')[0] || profile.name}
        </div>
        {metaPieces.length > 0 && (
          <div style={styles.welcomeMeta}>{metaPieces.join(' · ')}</div>
        )}
      </div>
      <RolePill accountType={profile.account_type}/>
    </div>
  )
}

/* ============================================================
   Info banner — dismissable
   ============================================================ */
function InfoBanner({ userId, storageKey, title, body }) {
  const fullKey = `chathouse_${storageKey}_dismissed_${userId}`
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(fullKey) === '1' } catch { return false }
  })
  if (dismissed) return null
  function handleDismiss() {
    try { localStorage.setItem(fullKey, '1') } catch {}
    setDismissed(true)
  }
  return (
    <div style={styles.infoBanner}>
      <span style={styles.infoIconWrap}><Icon.Info size={16}/></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={styles.infoTitle}>{title}</div>
        <div style={styles.infoBody}>{body}</div>
      </div>
      <button onClick={handleDismiss} style={styles.infoDismiss} title="Dismiss" aria-label="Dismiss">
        <Icon.X size={14}/>
      </button>
    </div>
  )
}

/* ============================================================
   TabBar — three tabs for landlord
   ============================================================ */
function TabBar({ activeTab, onChange }) {
  const tabs = [
    { id: 'listings', label: 'My Listings', icon: <Icon.Home size={14}/> },
    { id: 'community', label: 'Community', icon: <Icon.Users size={14}/> },
    { id: 'marketing', label: 'Marketing', icon: <Icon.Megaphone size={14}/> },
  ]
  return (
    <div style={styles.tabBar}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          style={{ ...styles.tab, ...(activeTab === t.id ? styles.tabActive : {}) }}>
          <span style={{ display: 'flex', color: activeTab === t.id ? '#1a6cf5' : '#64748b' }}>{t.icon}</span>
          {t.label}
        </button>
      ))}
    </div>
  )
}

/* ============================================================
   StatTile
   ============================================================ */
function StatTile({ icon, label, value, accent }) {
  return (
    <div style={styles.statTile}>
      <div style={styles.statTileTop}>
        <span style={{ ...styles.statTileIcon, color: accent || '#64748b' }}>{icon}</span>
      </div>
      <div style={styles.statTileValue}>{value ?? 0}</div>
      <div style={styles.statTileLabel}>
        {accent && <span style={{ ...styles.statDot, background: accent }}/>}
        {label}
      </div>
    </div>
  )
}

/* ============================================================
   MarketingTab
   ============================================================ */
function MarketingTab() {
  return (
    <div style={styles.card}>
      <div style={{ padding: 24 }}>
        <h2 style={styles.h2}>Marketing</h2>
        <p style={styles.cardSub}>
          Tools to grow your reach on Chathouse. New marketing features will appear here as they roll out.
        </p>

        <div style={styles.featureCard}>
          <div style={styles.featureIconWrap}><Icon.Pin size={16}/></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={styles.featureTitle}>
              Zip Code Advertising
              <span style={styles.comingSoonPill}>Coming soon</span>
            </div>
            <div style={styles.featureBody}>
              Own a zip code and get featured placement when renters browse listings in that area.
            </div>
            <div style={styles.featureNote}>
              Featured placement is paid — not an editorial recommendation.
            </div>
          </div>
        </div>

        <div style={styles.featureCard}>
          <div style={styles.featureIconWrap}><Icon.Bolt size={16}/></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={styles.featureTitle}>
              Listing Boost
              <span style={styles.comingSoonPill}>Coming soon</span>
            </div>
            <div style={styles.featureBody}>
              Surface your listings in suggested cards across relevant neighborhood searches.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   Landlord Dashboard
   ============================================================ */
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

  async function fetchCommunityPosts() {
    setCommunityLoading(true)

    // Step 1: fetch top-level posts (parent_id IS NULL) honoring filters
    let query = supabase
      .from('community_posts')
      .select('*, author:user_id(id, name, photo_url, account_type)')
      .is('parent_id', null)
      .order('created_at', { ascending: false })
      .limit(50)

    if (filterCategory !== 'all') query = query.eq('category', filterCategory)
    if (filterState !== 'all') query = query.eq('state', filterState)
    if (filterCity.trim()) query = query.ilike('city', `%${filterCity.trim()}%`)

    const { data: topLevel } = await query
    const parents = topLevel || []

    // Step 2: fetch all replies for these parents in a single query
    let replies = []
    if (parents.length > 0) {
      const parentIds = parents.map(p => p.id)
      const { data: replyData } = await supabase
        .from('community_posts')
        .select('*, author:user_id(id, name, photo_url, account_type)')
        .in('parent_id', parentIds)
        .order('created_at', { ascending: true })
      replies = replyData || []
    }

    // Step 3: attach replies to their parents
    const repliesByParent = {}
    replies.forEach(r => {
      if (!repliesByParent[r.parent_id]) repliesByParent[r.parent_id] = []
      repliesByParent[r.parent_id].push(r)
    })

    setCommunityPosts(parents.map(p => ({ ...p, replies: repliesByParent[p.id] || [] })))
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

  /* ============================================================
     Reply state + handlers
     ============================================================ */
  const [replyingTo, setReplyingTo] = useState(null)        // parent post id currently being replied to
  const [replyContent, setReplyContent] = useState('')
  const [replying, setReplying] = useState(false)

  function startReply(parentId) {
    setReplyingTo(parentId)
    setReplyContent('')
  }

  function cancelReply() {
    setReplyingTo(null)
    setReplyContent('')
  }

  async function submitReply(parent) {
    if (!replyContent.trim()) return
    setReplying(true)
    // Reply inherits parent's category/city/state — keeps filtering coherent
    await supabase.from('community_posts').insert({
      user_id: user.id,
      content: replyContent.trim(),
      category: parent.category,
      city: parent.city,
      state: parent.state,
      parent_id: parent.id,
    })
    setReplyContent('')
    setReplyingTo(null)
    setReplying(false)
    fetchCommunityPosts()
  }

  async function handleDeleteReply(replyId, parentId) {
    await supabase.from('community_posts').delete().eq('id', replyId)
    setCommunityPosts(prev => prev.map(p =>
      p.id === parentId
        ? { ...p, replies: (p.replies || []).filter(r => r.id !== replyId) }
        : p
    ))
  }

  if (!profile) return null

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <TopNav/>
      <div style={styles.page}>
        <WelcomeStrip profile={profile}/>
        <TabBar activeTab={activeTab} onChange={setActiveTab}/>

        {/* ========== My Listings tab ========== */}
        {activeTab === 'listings' && (
          <>
            <InfoBanner
              userId={user.id}
              storageKey="landlord_intro"
              title="Manage your buildings on Chathouse"
              body="Claim buildings you own to manage your presence here. Tenants and prospective renters comment publicly — you can respond to keep the conversation transparent and two-sided."
            />

            <div style={styles.statsGrid}>
              <StatTile icon={<Icon.Home size={16}/>} label="Claimed Listings" value={claimedListings.length} accent="#1a6cf5"/>
              <StatTile icon={<Icon.Message size={16}/>} label="Total Comments" value={totalComments} accent="#6d28d9"/>
            </div>

            {/* Claimed Listings */}
            <div style={styles.card}>
              <div style={{ padding: 24 }}>
                <div style={styles.sectionHeader}>
                  <h2 style={styles.h2}>Your Claimed Listings</h2>
                  <Link to="/add-listing" style={styles.btnPrimary}>
                    <Icon.Plus size={13}/> Post a Listing
                  </Link>
                </div>

                {listingsLoading
                  ? <div style={styles.loadingText}>Loading...</div>
                  : claimedListings.length === 0
                    ? (
                      <div style={styles.emptyState}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10, color: '#94a3b8' }}>
                          <Icon.Home size={28}/>
                        </div>
                        <div style={styles.emptyTitle}>No claimed listings yet</div>
                        <div style={styles.emptySub}>Find your building on Chathouse and claim it to manage it here.</div>
                        <Link to="/listings" style={{ ...styles.btnPrimary, marginTop: 14, display: 'inline-flex' }}>
                          Browse listings to claim →
                        </Link>
                      </div>
                    )
                    : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {claimedListings.map(l => (
                          <Link key={l.id} to={`/listing/${l.id}`} style={styles.listingCard}>
                            <div style={styles.listingIcon}><Icon.Home size={18}/></div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={styles.listingAddress}>{l.address}</div>
                              <div style={styles.listingMeta}>
                                <span style={styles.metaItem}><Icon.Pin size={11}/> {l.hood || l.city}</span>
                                <span style={styles.metaItem}>· Claimed {timeAgo(l.created_at)}</span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                              <span style={styles.verifiedTag}><Icon.Check size={11}/> Verified</span>
                              <span style={styles.commentCount}>
                                <Icon.Message size={12}/> {l.commentCount}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )
                }
              </div>
            </div>

            {/* Portfolio Sentiment */}
            {claimedListings.length > 0 && (
              <div style={styles.card}>
                <div style={{ padding: 24 }}>
                  <div style={styles.sectionHeader}>
                    <h2 style={styles.h2}>Portfolio Sentiment</h2>
                    <span style={styles.sectionCount}>{claimedListings.length} {claimedListings.length === 1 ? 'building' : 'buildings'}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {claimedListings.map(l => {
                      const pct = sentiment[l.id]
                      return (
                        <div key={l.id}>
                          <div style={styles.sentimentRow}>
                            <span style={styles.sentimentAddress}>{l.address}</span>
                            <span style={{
                              ...styles.sentimentValue,
                              color: pct != null ? sentimentColor(pct) : '#94a3b8',
                            }}>
                              {pct != null ? `${pct}% positive` : 'No comments yet'}
                            </span>
                          </div>
                          <div style={styles.sentimentTrack}>
                            <div style={{
                              ...styles.sentimentBar,
                              width: `${pct || 0}%`,
                              background: pct != null ? sentimentColor(pct) : '#e2e8f0',
                            }}/>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ========== Community tab ========== */}
        {activeTab === 'community' && (
          <div style={styles.card}>
            <div style={{ padding: 24 }}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.h2}>Landlord Community</h2>
                <span style={styles.sectionCount}>{communityPosts.length} {communityPosts.length === 1 ? 'post' : 'posts'}</span>
              </div>

              {/* Filters */}
              <div style={{ marginBottom: 16 }}>
                <div style={styles.filterLabel}>Filter by location</div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                  <select value={filterState} onChange={e => setFilterState(e.target.value)} style={styles.filterSelect}>
                    <option value="all">All States</option>
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input value={filterCity} onChange={e => setFilterCity(e.target.value)} placeholder="Filter by city..." style={{ ...styles.filterSelect, flex: 1, minWidth: 160 }}/>
                </div>
                <div style={styles.filterLabel}>Category</div>
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
                  <strong>{filterCategory}</strong> — {getCategoryDesc(filterCategory)}
                </div>
              )}

              {/* Composer */}
              <div style={styles.composer}>
                <Avatar profile={profile} size={38}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <textarea
                    value={postContent}
                    onChange={e => setPostContent(e.target.value)}
                    placeholder={`Ask the ${filterState !== 'all' ? filterState + ' ' : ''}landlord community something...`}
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
                    <button onClick={handlePost} disabled={posting || !postContent.trim()}
                      style={{ ...styles.btnPrimary, opacity: posting || !postContent.trim() ? 0.5 : 1, marginLeft: 'auto' }}>
                      {posting ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Posts feed */}
              {communityLoading
                ? <div style={styles.loadingText}>Loading...</div>
                : communityPosts.length === 0
                  ? (
                    <div style={styles.emptyState}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10, color: '#94a3b8' }}>
                        <Icon.Users size={28}/>
                      </div>
                      <div style={styles.emptyTitle}>No posts yet</div>
                      <div style={styles.emptySub}>Be the first to start a conversation with the landlord community.</div>
                    </div>
                  )
                  : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                      {communityPosts.map(post => (
                        <div key={post.id} style={styles.postCard}>
                          <div style={styles.postHeader}>
                            <Avatar profile={post.author} size={36}/>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <Link to={`/profile/${post.author?.id}`} style={styles.postNameLink}>
                                  {post.author?.name || 'User'}
                                </Link>
                                <RolePill accountType={post.author?.account_type || 'landlord'} size="sm"/>
                                {post.city && post.state && (
                                  <span style={styles.postLocation}>
                                    <Icon.Pin size={11}/> {post.city}, {post.state}
                                  </span>
                                )}
                                <span style={styles.postTime}>{timeAgo(post.created_at)}</span>
                              </div>
                              <span style={styles.catTag}>{post.category}</span>
                            </div>
                            {post.user_id === user.id && (
                              <button onClick={() => handleDeletePost(post.id)} style={styles.deleteBtn} title="Delete post" aria-label="Delete post">
                                <Icon.Trash size={13}/>
                              </button>
                            )}
                          </div>
                          <p style={styles.postContent}>{post.content}</p>

                          {/* Reply action row */}
                          <div style={styles.postActions}>
                            <button
                              onClick={() => replyingTo === post.id ? cancelReply() : startReply(post.id)}
                              style={styles.replyBtn}
                            >
                              <Icon.Reply size={12}/> {replyingTo === post.id ? 'Cancel' : 'Reply'}
                            </button>
                            {post.replies && post.replies.length > 0 && (
                              <span style={styles.replyCount}>
                                {post.replies.length} {post.replies.length === 1 ? 'reply' : 'replies'}
                              </span>
                            )}
                          </div>

                          {/* Inline reply composer */}
                          {replyingTo === post.id && (
                            <div style={styles.replyComposer}>
                              <Avatar profile={profile} size={32}/>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <textarea
                                  value={replyContent}
                                  onChange={e => setReplyContent(e.target.value)}
                                  placeholder={`Reply to ${post.author?.name?.split(' ')[0] || 'this post'}...`}
                                  style={styles.replyInput}
                                  rows={2}
                                  autoFocus
                                />
                                <div style={{ display: 'flex', gap: 8, marginTop: 6, justifyContent: 'flex-end' }}>
                                  <button onClick={cancelReply} style={styles.btnSubtle}>Cancel</button>
                                  <button
                                    onClick={() => submitReply(post)}
                                    disabled={replying || !replyContent.trim()}
                                    style={{ ...styles.btnPrimary, opacity: replying || !replyContent.trim() ? 0.5 : 1 }}
                                  >
                                    {replying ? 'Posting...' : 'Reply'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Replies thread */}
                          {post.replies && post.replies.length > 0 && (
                            <div style={styles.repliesThread}>
                              {post.replies.map(reply => (
                                <div key={reply.id} style={styles.replyCard}>
                                  <div style={styles.replyHeader}>
                                    <Avatar profile={reply.author} size={30}/>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                        <Link to={`/profile/${reply.author?.id}`} style={styles.postNameLink}>
                                          {reply.author?.name || 'User'}
                                        </Link>
                                        <RolePill accountType={reply.author?.account_type || 'landlord'} size="sm"/>
                                        <span style={styles.postTime}>{timeAgo(reply.created_at)}</span>
                                      </div>
                                    </div>
                                    {reply.user_id === user.id && (
                                      <button
                                        onClick={() => handleDeleteReply(reply.id, post.id)}
                                        style={styles.deleteBtn}
                                        title="Delete reply"
                                        aria-label="Delete reply"
                                      >
                                        <Icon.Trash size={12}/>
                                      </button>
                                    )}
                                  </div>
                                  <p style={styles.replyContent}>{reply.content}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )
              }
            </div>
          </div>
        )}

        {/* ========== Marketing tab ========== */}
        {activeTab === 'marketing' && <MarketingTab/>}
      </div>
      <Footer/>
    </div>
  )
}

const styles = {
  page: { maxWidth: 860, margin: '0 auto', padding: '24px 20px 60px' },

  welcomeStrip: {
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '14px 20px',
    background: '#fff',
    borderRadius: 16,
    borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0',
    marginBottom: 16,
    boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
    flexWrap: 'wrap',
  },
  welcomeName: {
    fontFamily: 'var(--serif)',
    fontSize: 18, fontWeight: 700, color: '#0f172a',
    lineHeight: 1.2,
  },
  welcomeMeta: { fontSize: 12, color: '#64748b', marginTop: 4 },

  infoBanner: {
    display: 'flex', alignItems: 'flex-start', gap: 12,
    padding: '14px 18px',
    background: '#fff',
    borderRadius: 12,
    borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0',
    borderLeftWidth: 3, borderLeftColor: '#1a6cf5',
    marginBottom: 16,
  },
  infoIconWrap: {
    width: 32, height: 32, borderRadius: 8,
    background: '#e8f0fe', color: '#1a6cf5',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  infoTitle: { fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 2 },
  infoBody: { fontSize: 12, color: '#475569', lineHeight: 1.6 },
  infoDismiss: {
    width: 28, height: 28, border: 'none', background: 'transparent',
    borderRadius: 6, cursor: 'pointer', color: '#94a3b8',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
    transition: 'background 120ms ease, color 120ms ease',
  },

  tabBar: {
    display: 'flex', gap: 0,
    borderBottomWidth: 1.5, borderBottomStyle: 'solid', borderBottomColor: '#e2e8f0',
    marginBottom: 16,
    overflowX: 'auto',
  },
  tab: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '12px 16px',
    background: 'none', border: 'none',
    fontSize: 13, fontWeight: 600,
    color: '#64748b', cursor: 'pointer',
    borderBottomWidth: 2, borderBottomStyle: 'solid', borderBottomColor: 'transparent',
    marginBottom: -1.5, whiteSpace: 'nowrap',
    transition: 'color 120ms ease, border-color 120ms ease',
  },
  tabActive: { color: '#1a6cf5', borderBottomColor: '#1a6cf5' },

  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginBottom: 16 },
  statTile: {
    background: '#fff', borderRadius: 12,
    borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0',
    padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
  },
  statTileTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statTileIcon: { display: 'inline-flex' },
  statTileValue: { fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 700, color: '#0f172a', lineHeight: 1.1, marginBottom: 6 },
  statTileLabel: { fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, display: 'inline-flex', alignItems: 'center', gap: 6 },
  statDot: { width: 5, height: 5, borderRadius: '50%', display: 'inline-block' },

  card: {
    background: '#fff', borderRadius: 16,
    borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0',
    marginBottom: 16, boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
    overflow: 'hidden',
  },
  cardSub: { fontSize: 13, color: '#64748b', marginTop: -8, marginBottom: 16, lineHeight: 1.6 },

  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 },
  h2: { fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 },
  sectionCount: { fontSize: 11, color: '#64748b', fontWeight: 600, background: '#f1f5f9', padding: '4px 10px', borderRadius: 100 },

  btnPrimary: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '8px 14px', background: '#1a6cf5', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700,
    textDecoration: 'none', cursor: 'pointer',
    transition: 'background 120ms ease',
  },

  listingCard: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: 14, background: '#f8fafc', borderRadius: 12,
    borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0',
    textDecoration: 'none', color: 'inherit',
    transition: 'background 120ms ease, border-color 120ms ease',
    flexWrap: 'wrap',
  },
  listingIcon: {
    width: 40, height: 40, borderRadius: 10,
    background: '#e8f0fe', color: '#1a6cf5',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  listingAddress: { fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 2 },
  listingMeta: { display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 12, color: '#64748b' },
  metaItem: { display: 'inline-flex', alignItems: 'center', gap: 4 },
  verifiedTag: { display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '3px 8px', borderRadius: 100, letterSpacing: 0.3, textTransform: 'uppercase' },
  commentCount: { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b', fontWeight: 600 },

  sentimentRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 8, flexWrap: 'wrap' },
  sentimentAddress: { fontSize: 13, color: '#334155', fontWeight: 500 },
  sentimentValue: { fontSize: 12, fontWeight: 700 },
  sentimentTrack: { height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' },
  sentimentBar: { height: '100%', borderRadius: 3, transition: 'width 0.5s ease' },

  filterLabel: { fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  filterSelect: {
    padding: '8px 12px',
    borderWidth: 1.5, borderStyle: 'solid', borderColor: '#e2e8f0',
    borderRadius: 8, fontSize: 13, color: '#0f172a',
    outline: 'none', background: '#fff',
  },
  catChip: {
    padding: '6px 12px',
    borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0',
    borderRadius: 100, background: '#fff',
    fontSize: 12, fontWeight: 600, color: '#64748b',
    cursor: 'pointer', whiteSpace: 'nowrap',
    transition: 'background 120ms ease, color 120ms ease, border-color 120ms ease',
  },
  catChipActive: { background: '#e8f0fe', color: '#1a6cf5', borderColor: '#bfdbfe' },
  catBanner: {
    padding: '10px 14px',
    background: '#f8fafc',
    borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0',
    borderRadius: 8,
    fontSize: 13, color: '#475569',
    marginBottom: 14,
  },

  composer: {
    display: 'flex', gap: 12, alignItems: 'flex-start',
    padding: '16px 0 16px',
    borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: '#f1f5f9',
    marginBottom: 4,
  },
  composerInput: {
    width: '100%', padding: '10px 14px',
    borderWidth: 1.5, borderStyle: 'solid', borderColor: '#e2e8f0',
    borderRadius: 10, fontSize: 14, color: '#0f172a',
    outline: 'none', resize: 'vertical', fontFamily: 'inherit',
    background: '#f8fafc', boxSizing: 'border-box',
  },
  postSelect: {
    padding: '7px 10px',
    borderWidth: 1.5, borderStyle: 'solid', borderColor: '#e2e8f0',
    borderRadius: 8, fontSize: 12, color: '#0f172a',
    outline: 'none', background: '#fff',
  },

  postCard: {
    padding: 16, background: '#f8fafc', borderRadius: 12,
    borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0',
  },
  postHeader: { display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  postNameLink: { fontSize: 13, fontWeight: 700, color: '#0f172a', textDecoration: 'none' },
  postLocation: { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#64748b' },
  postTime: { fontSize: 11, color: '#94a3b8' },
  catTag: { display: 'inline-block', fontSize: 10, fontWeight: 700, color: '#475569', background: '#f1f5f9', padding: '2px 8px', borderRadius: 100, marginTop: 6, letterSpacing: 0.3, textTransform: 'uppercase' },
  postContent: { fontSize: 14, color: '#334155', lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap' },
  deleteBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    padding: 6, color: '#94a3b8',
    display: 'flex', alignItems: 'center', borderRadius: 6,
    marginLeft: 'auto', flexShrink: 0,
    transition: 'color 120ms ease, background 120ms ease',
  },

  /* Reply system */
  postActions: {
    display: 'flex', alignItems: 'center', gap: 12,
    marginTop: 12, paddingTop: 10,
    borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: '#e2e8f0',
  },
  replyBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '5px 10px',
    background: '#fff', color: '#475569',
    borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0',
    borderRadius: 8, fontSize: 12, fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 120ms ease, color 120ms ease, border-color 120ms ease',
  },
  replyCount: { fontSize: 11, color: '#94a3b8', fontWeight: 600 },
  replyComposer: {
    display: 'flex', gap: 10, alignItems: 'flex-start',
    marginTop: 12,
    padding: 12,
    background: '#fff',
    borderRadius: 10,
    borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0',
  },
  replyInput: {
    width: '100%', padding: '8px 12px',
    borderWidth: 1.5, borderStyle: 'solid', borderColor: '#e2e8f0',
    borderRadius: 8, fontSize: 13, color: '#0f172a',
    outline: 'none', resize: 'vertical', fontFamily: 'inherit',
    background: '#f8fafc', boxSizing: 'border-box',
  },
  btnSubtle: {
    padding: '6px 12px',
    background: 'transparent', color: '#64748b',
    border: 'none', borderRadius: 8,
    fontSize: 12, fontWeight: 600, cursor: 'pointer',
    transition: 'color 120ms ease',
  },
  repliesThread: {
    marginTop: 12, marginLeft: 18,
    paddingLeft: 14,
    borderLeftWidth: 2, borderLeftStyle: 'solid', borderLeftColor: '#e2e8f0',
    display: 'flex', flexDirection: 'column', gap: 10,
  },
  replyCard: {
    padding: 12,
    background: '#fff',
    borderRadius: 10,
    borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0',
  },
  replyHeader: { display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  replyContent: { fontSize: 13, color: '#334155', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' },

  emptyState: { textAlign: 'center', padding: '32px 20px', background: '#f8fafc', borderRadius: 12, marginTop: 4 },
  emptyTitle: { fontWeight: 700, color: '#0f172a', marginBottom: 4, fontSize: 14 },
  emptySub: { fontSize: 13, color: '#64748b', lineHeight: 1.5 },

  featureCard: {
    display: 'flex', alignItems: 'flex-start', gap: 14,
    padding: 16, background: '#f8fafc', borderRadius: 12,
    borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0',
    marginBottom: 10,
  },
  featureIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    background: '#fff',
    borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0',
    color: '#64748b',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  featureTitle: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 4, flexWrap: 'wrap' },
  featureBody: { fontSize: 12, color: '#475569', lineHeight: 1.6 },
  featureNote: { fontSize: 11, color: '#94a3b8', marginTop: 6, fontStyle: 'italic' },
  comingSoonPill: { fontSize: 10, fontWeight: 700, color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: 100, letterSpacing: 0.3, textTransform: 'uppercase' },

  loadingText: { textAlign: 'center', padding: 30, color: '#64748b', fontSize: 13 },
}