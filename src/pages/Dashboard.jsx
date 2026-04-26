import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import TopNav from '../components/TopNav'
import Footer from '../components/Footer'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

/* ============================================================
   Inline SVG icons — matching TopNav / Profile style
   ============================================================ */
const Icon = {
  Users: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Heart: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  Star: ({ size = 14, filled = false }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  Trophy: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>
  ),
  Bolt: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Pin: ({ size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Clock: ({ size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Home: ({ size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Message: ({ size = 13 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  Link: ({ size = 13 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  ),
  Bell: ({ size = 13 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  Refresh: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  ),
  Verified: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2.5c.6 0 1.18.18 1.66.52l1.34.95c.27.19.6.29.93.27l1.64-.07c1.18-.05 2.18.85 2.23 2.03l.07 1.64c.01.33.13.65.33.91l1 1.3a2.13 2.13 0 0 1 0 2.6l-1 1.3c-.2.26-.32.58-.33.91l-.07 1.64c-.05 1.18-1.05 2.08-2.23 2.03l-1.64-.07c-.33-.02-.66.08-.93.27l-1.34.95a2.13 2.13 0 0 1-2.32 0l-1.34-.95a1.59 1.59 0 0 0-.93-.27l-1.64.07c-1.18.05-2.18-.85-2.23-2.03l-.07-1.64a1.59 1.59 0 0 0-.33-.91l-1-1.3a2.13 2.13 0 0 1 0-2.6l1-1.3c.2-.26.32-.58.33-.91l.07-1.64c.05-1.18 1.05-2.08 2.23-2.03l1.64.07c.33.02.66-.08.93-.27l1.34-.95A2.13 2.13 0 0 1 12 2.5Z" fill="#1a6cf5"/>
      <path d="m8.5 12 2.5 2.5L15.5 9.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  ),
  X: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Megaphone: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 11 22 2 22 22 3 13 3 11"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
    </svg>
  ),
  ChartBar: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>
    </svg>
  ),
}

/* ============================================================
   Role pill — matches TopNav / Profile exactly
   ============================================================ */
const ROLE_STYLES = {
  buyer:      { label: 'Buyer / Renter',  bg: '#f1f5f9', fg: '#475569' },
  renter:     { label: 'Renter',          bg: '#f1f5f9', fg: '#475569' },
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
      display: 'inline-block',
      borderRadius: 100,
      fontWeight: 700,
      letterSpacing: 0.3,
      textTransform: 'uppercase',
      background: style.bg,
      color: style.fg,
      ...dims,
    }}>
      {style.label}
    </span>
  )
}

/* ============================================================
   Avatar — matches TopNav / Profile exactly
   ============================================================ */
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
      color: '#fff',
      fontSize: size <= 32 ? 13 : size <= 48 ? 16 : 22,
      fontWeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {profile?.name?.[0]?.toUpperCase() || '?'}
    </div>
  )
}

/* ============================================================
   Helpers
   ============================================================ */
function formatJoinedDate(isoString) {
  if (!isoString) return null
  try {
    return new Date(isoString).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  } catch { return null }
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

/* ============================================================
   Top-level Dashboard router (preserved logic)
   ============================================================ */
export default function Dashboard() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) { navigate('/signin'); return }
    if (!['agent', 'broker'].includes(profile?.account_type)) {
      navigate('/listings')
    }
  }, [user, profile])

  if (!profile) return null
  if (profile.account_type === 'agent') return <AgentDashboard profile={profile} user={user}/>
  if (profile.account_type === 'broker') return <BrokerDashboard profile={profile} user={user}/>
  return null
}

/* ============================================================
   Welcome Strip — slim, white, professional
   Same vibe as Profile header — name + secondary meta + role pill
   ============================================================ */
function WelcomeStrip({ profile, verifiedLabel }) {
  const isVerified = !!profile.license_number
  const joinedDate = formatJoinedDate(profile.created_at)
  const licenseLabel = profile.account_type === 'broker' ? 'NMLS' : 'License'

  // Build the secondary meta line
  const metaPieces = []
  if (profile.company) metaPieces.push(profile.company)
  if (profile.license_number) metaPieces.push(`${licenseLabel} ${profile.license_number}`)
  if (joinedDate) metaPieces.push(`Member since ${joinedDate}`)

  return (
    <div style={styles.welcomeStrip}>
      <Avatar profile={profile} size={48}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={styles.welcomeName}>
          Welcome back, {profile.name?.split(' ')[0] || profile.name}
          {isVerified && (
            <span style={styles.welcomeVerified} title={`Verified ${verifiedLabel} — license number on file`}>
              <Icon.Verified size={16}/>
            </span>
          )}
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
   MLS Notice — dismissable, persists in localStorage
   ============================================================ */
function MlsNotice({ userId }) {
  const dismissKey = `chathouse_mls_notice_dismissed_${userId}`
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(dismissKey) === '1' } catch { return false }
  })

  if (dismissed) return null

  function handleDismiss() {
    try { localStorage.setItem(dismissKey, '1') } catch {}
    setDismissed(true)
  }

  return (
    <div style={styles.mlsNotice}>
      <span style={styles.mlsIconWrap}><Icon.Refresh size={16}/></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={styles.mlsTitle}>Your MLS listings sync to Chathouse automatically</div>
        <div style={styles.mlsBody}>
          No manual posting needed. Once a listing is submitted to the MLS it will appear on the feed within 24–48 hours and your agent profile will be attached.
        </div>
      </div>
      <button
        onClick={handleDismiss}
        style={styles.mlsDismiss}
        title="Dismiss"
        aria-label="Dismiss notice"
      >
        <Icon.X size={14}/>
      </button>
    </div>
  )
}

/* ============================================================
   Tab bar — Overview / Marketing
   ============================================================ */
function TabBar({ activeTab, onChange }) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Icon.ChartBar size={14}/> },
    { id: 'marketing', label: 'Marketing', icon: <Icon.Megaphone size={14}/> },
  ]
  return (
    <div style={styles.tabBar}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{ ...styles.tab, ...(activeTab === t.id ? styles.tabActive : {}) }}
        >
          <span style={{ display: 'flex', color: activeTab === t.id ? '#1a6cf5' : '#64748b' }}>{t.icon}</span>
          {t.label}
        </button>
      ))}
    </div>
  )
}

/* ============================================================
   StatTile — slim, monochrome, professional
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
   Marketing tab content — professional placeholder
   ============================================================ */
function MarketingTab({ accountType }) {
  return (
    <>
      <div style={styles.card}>
        <div style={{ padding: 24 }}>
          <h2 style={styles.h2}>Marketing</h2>
          <p style={styles.cardSub}>
            Tools to grow your reach on Chathouse. New marketing features will appear here as they roll out.
          </p>

          {/* Coming soon: Zip Code Advertising */}
          <div style={styles.featureCard}>
            <div style={styles.featureIconWrap}><Icon.Pin size={16}/></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={styles.featureTitle}>
                Zip Code Advertising
                <span style={styles.comingSoonPill}>Coming soon</span>
              </div>
              <div style={styles.featureBody}>
                Own a zip code and get featured placement when {accountType === 'broker' ? 'borrowers' : 'buyers'} browse listings in that area.
              </div>
              <div style={styles.featureNote}>
                Featured placement is paid — not an editorial recommendation.
              </div>
            </div>
          </div>

          {/* Coming soon: Profile boost */}
          <div style={styles.featureCard}>
            <div style={styles.featureIconWrap}><Icon.Bolt size={16}/></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={styles.featureTitle}>
                Profile Boost
                <span style={styles.comingSoonPill}>Coming soon</span>
              </div>
              <div style={styles.featureBody}>
                Surface your profile in suggested {accountType === 'broker' ? 'broker' : 'agent'} cards across relevant listings and searches.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

/* ============================================================
   AGENT DASHBOARD
   ============================================================ */
function AgentDashboard({ profile, user }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [clients, setClients] = useState([])
  const [clientsLoading, setClientsLoading] = useState(true)
  const [stats, setStats] = useState({ linkedBuyers: 0, commentLikes: 0, reviews: 0, avgRating: 0 })
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => { fetchAgentData() }, [])

  async function fetchAgentData() {
    const [
      { count: linkedBuyers },
      { data: reviewData },
      { data: commentData },
      { data: notifications },
    ] = await Promise.all([
      supabase.from('agent_clients').select('*', { count: 'exact', head: true }).eq('agent_id', user.id),
      supabase.from('reviews').select('rating').eq('reviewee_id', user.id),
      supabase.from('comments').select('id').eq('user_id', user.id),
      supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
    ])

    let commentLikes = 0
    if (commentData && commentData.length > 0) {
      const ids = commentData.map(c => c.id)
      const { count } = await supabase.from('comment_likes').select('*', { count: 'exact', head: true }).in('comment_id', ids)
      commentLikes = count || 0
    }

    const avgRating = reviewData && reviewData.length > 0
      ? Math.round((reviewData.reduce((s, r) => s + r.rating, 0) / reviewData.length) * 10) / 10
      : 0

    setStats({ linkedBuyers: linkedBuyers || 0, commentLikes, reviews: reviewData?.length || 0, avgRating })
    setRecentActivity(notifications || [])

    setClientsLoading(true)
    const { data: clientRows } = await supabase
      .from('agent_clients')
      .select('id, client_user_id, created_at')
      .eq('agent_id', user.id)
      .order('created_at', { ascending: false })

    if (clientRows && clientRows.length > 0) {
      const ids = clientRows.map(c => c.client_user_id)
      const { data: clientProfiles } = await supabase
        .from('profiles')
        .select('id, name, photo_url, account_type, city, move_timeline, looking_for')
        .in('id', ids)
      const pm = {}; clientProfiles?.forEach(p => { pm[p.id] = p })
      setClients(clientRows.map(c => ({ ...pm[c.client_user_id], linkedAt: c.created_at, clientRowId: c.id })).filter(Boolean))
    } else {
      setClients([])
    }
    setClientsLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <TopNav/>
      <div style={styles.page}>
        <WelcomeStrip profile={profile} verifiedLabel="Agent"/>
        <TabBar activeTab={activeTab} onChange={setActiveTab}/>

        {activeTab === 'overview' && (
          <>
            <MlsNotice userId={user.id}/>

            {/* Stat tiles */}
            <div style={styles.statsGrid}>
              <StatTile icon={<Icon.Users size={16}/>} label="Linked Buyers" value={stats.linkedBuyers} accent="#1a6cf5"/>
              <StatTile icon={<Icon.Heart size={16}/>} label="Comment Likes" value={stats.commentLikes} accent="#dc2626"/>
              <StatTile icon={<Icon.Star size={16}/>} label="Reviews" value={stats.reviews} accent="#f59e0b"/>
              <StatTile icon={<Icon.Trophy size={16}/>} label="Avg Rating" value={stats.avgRating > 0 ? `${stats.avgRating}` : '—'} accent="#16a34a"/>
            </div>

            {/* Linked Clients */}
            <div style={styles.card}>
              <div style={{ padding: 24 }}>
                <div style={styles.sectionHeader}>
                  <h2 style={styles.h2}>Linked Clients</h2>
                  <span style={styles.sectionCount}>{stats.linkedBuyers} active</span>
                </div>
                {clientsLoading
                  ? <div style={styles.loadingText}>Loading...</div>
                  : clients.length === 0
                    ? <EmptyState
                        icon={<Icon.Users size={28}/>}
                        title="No linked clients yet"
                        sub="When buyers send you a link request and you accept, they'll appear here."
                      />
                    : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {clients.map(client => (
                          <ClientRow key={client.id} client={client} timeAgo={timeAgo} accent="#1a6cf5"/>
                        ))}
                      </div>
                    )
                }
              </div>
            </div>

            {/* Recent Activity */}
            {recentActivity.length > 0 && (
              <div style={styles.card}>
                <div style={{ padding: 24 }}>
                  <h2 style={styles.h2}>Recent Activity</h2>
                  <div style={styles.activityList}>
                    {recentActivity.map(n => (
                      <ActivityItem key={n.id} item={n}/>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'marketing' && <MarketingTab accountType="agent"/>}
      </div>
      <Footer/>
    </div>
  )
}

/* ============================================================
   BROKER DASHBOARD
   ============================================================ */
function BrokerDashboard({ profile, user }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [buyerFeed, setBuyerFeed] = useState([])
  const [feedFilter, setFeedFilter] = useState('all')
  const [feedLoading, setFeedLoading] = useState(true)
  const [stats, setStats] = useState({ activeLeads: 0, linkedClients: 0, reviews: 0, avgRating: 0 })
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => { fetchBrokerData() }, [])

  async function fetchBrokerData() {
    const [
      { count: linkedClients },
      { data: reviewData },
      { data: notifications },
      { data: buyerProfiles },
    ] = await Promise.all([
      supabase.from('agent_clients').select('*', { count: 'exact', head: true }).eq('agent_id', user.id),
      supabase.from('reviews').select('rating').eq('reviewee_id', user.id),
      supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('profiles').select('id, name, photo_url, city, move_timeline, looking_for, created_at').eq('account_type', 'buyer').order('created_at', { ascending: false }).limit(50),
    ])

    const buyerIds = buyerProfiles?.map(p => p.id) || []
    let brokerLinkedIds = new Set()
    if (buyerIds.length > 0) {
      const { data: linkedData } = await supabase
        .from('agent_clients')
        .select('client_user_id')
        .in('client_user_id', buyerIds)
      linkedData?.forEach(r => brokerLinkedIds.add(r.client_user_id))
    }

    const enrichedBuyers = (buyerProfiles || []).map(p => ({ ...p, hasBroker: brokerLinkedIds.has(p.id) }))
    const avgRating = reviewData && reviewData.length > 0
      ? Math.round((reviewData.reduce((s, r) => s + r.rating, 0) / reviewData.length) * 10) / 10
      : 0
    const noBrokerCount = enrichedBuyers.filter(b => !b.hasBroker).length

    setStats({ activeLeads: noBrokerCount, linkedClients: linkedClients || 0, reviews: reviewData?.length || 0, avgRating })
    setBuyerFeed(enrichedBuyers)
    setRecentActivity(notifications || [])
    setFeedLoading(false)
  }

  const filteredFeed = buyerFeed.filter(b => {
    if (feedFilter === 'no_broker') return !b.hasBroker
    if (feedFilter === 'has_broker') return b.hasBroker
    return true
  })

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <TopNav/>
      <div style={styles.page}>
        <WelcomeStrip profile={profile} verifiedLabel="Broker"/>
        <TabBar activeTab={activeTab} onChange={setActiveTab}/>

        {activeTab === 'overview' && (
          <>
            {/* Stat tiles */}
            <div style={styles.statsGrid}>
              <StatTile icon={<Icon.Bolt size={16}/>} label="No-Broker Buyers" value={stats.activeLeads} accent="#f59e0b"/>
              <StatTile icon={<Icon.Users size={16}/>} label="Linked Clients" value={stats.linkedClients} accent="#6d28d9"/>
              <StatTile icon={<Icon.Star size={16}/>} label="Reviews" value={stats.reviews} accent="#16a34a"/>
              <StatTile icon={<Icon.Trophy size={16}/>} label="Avg Rating" value={stats.avgRating > 0 ? `${stats.avgRating}` : '—'} accent="#1a6cf5"/>
            </div>

            {/* Buyer Lead Feed */}
            <div style={styles.card}>
              <div style={{ padding: 24 }}>
                <div style={styles.sectionHeader}>
                  <h2 style={styles.h2}>Buyer Lead Feed</h2>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {[['all', 'All'], ['no_broker', 'No Broker'], ['has_broker', 'Has Broker']].map(([val, label]) => (
                      <button
                        key={val}
                        onClick={() => setFeedFilter(val)}
                        style={{
                          ...styles.filterChip,
                          ...(feedFilter === val ? { background: '#ede9fe', color: '#6d28d9', borderColor: '#ddd6fe' } : {})
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {feedLoading
                  ? <div style={styles.loadingText}>Loading...</div>
                  : filteredFeed.length === 0
                    ? <EmptyState
                        icon={<Icon.Users size={28}/>}
                        title="No buyers found"
                        sub="Check back as more buyers join Chathouse."
                      />
                    : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {filteredFeed.map(buyer => (
                          <LeadRow key={buyer.id} buyer={buyer} timeAgo={timeAgo} accent="#6d28d9"/>
                        ))}
                      </div>
                    )
                }
              </div>
            </div>

            {/* Recent Activity */}
            {recentActivity.length > 0 && (
              <div style={styles.card}>
                <div style={{ padding: 24 }}>
                  <h2 style={styles.h2}>Recent Activity</h2>
                  <div style={styles.activityList}>
                    {recentActivity.map(n => (
                      <ActivityItem key={n.id} item={n}/>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'marketing' && <MarketingTab accountType="broker"/>}
      </div>
      <Footer/>
    </div>
  )
}

/* ============================================================
   ClientRow — used in Linked Clients (agent)
   ============================================================ */
function ClientRow({ client, timeAgo, accent }) {
  return (
    <Link to={`/profile/${client.id}`} style={styles.row}>
      <Avatar profile={client} size={44}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={styles.rowTopLine}>
          <span style={styles.rowName}>{client.name}</span>
          <span style={styles.clientBadge}>Your client</span>
        </div>
        <div style={styles.rowMeta}>
          {client.city && <span style={styles.rowMetaItem}><Icon.Pin size={11}/> {client.city}</span>}
          {client.move_timeline && <span style={styles.rowMetaItem}><Icon.Clock size={11}/> {client.move_timeline}</span>}
          {client.looking_for && <span style={styles.rowMetaItem}><Icon.Home size={11}/> {client.looking_for}</span>}
        </div>
      </div>
      <div style={styles.rowRight}>
        <span style={styles.timeAgo}>{timeAgo(client.linkedAt)}</span>
        <Link
          to={`/messages?user=${client.id}`}
          onClick={e => e.stopPropagation()}
          style={styles.messageBtn}
        >
          <Icon.Message size={12}/> Message
        </Link>
      </div>
    </Link>
  )
}

/* ============================================================
   LeadRow — used in Buyer Lead Feed (broker)
   ============================================================ */
function LeadRow({ buyer, timeAgo, accent }) {
  return (
    <div style={styles.row}>
      <Link to={`/profile/${buyer.id}`} style={styles.rowLeft}>
        <Avatar profile={buyer} size={44}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={styles.rowTopLine}>
            <span style={styles.rowName}>{buyer.name}</span>
            {buyer.hasBroker
              ? <span style={styles.tagHasBroker}>Has broker</span>
              : <span style={styles.tagNoBroker}>No broker</span>}
          </div>
          <div style={styles.rowMeta}>
            {buyer.city && <span style={styles.rowMetaItem}><Icon.Pin size={11}/> {buyer.city}</span>}
            {buyer.move_timeline && <span style={styles.rowMetaItem}><Icon.Clock size={11}/> {buyer.move_timeline}</span>}
            {buyer.looking_for && <span style={styles.rowMetaItem}><Icon.Home size={11}/> {buyer.looking_for}</span>}
          </div>
        </div>
      </Link>
      <div style={styles.rowRight}>
        <span style={styles.timeAgo}>{timeAgo(buyer.created_at)}</span>
        <Link
          to={`/messages?user=${buyer.id}`}
          style={styles.messageBtn}
        >
          <Icon.Message size={12}/> Message
        </Link>
      </div>
    </div>
  )
}

/* ============================================================
   ActivityItem — used in Recent Activity
   ============================================================ */
function ActivityItem({ item }) {
  const iconFor = type => {
    if (type === 'message') return <Icon.Message size={13}/>
    if (type === 'link_request') return <Icon.Link size={13}/>
    if (type === 'friend_request') return <Icon.Users size={13}/>
    return <Icon.Bell size={13}/>
  }
  return (
    <div style={styles.activityItem}>
      <span style={styles.activityIcon}>{iconFor(item.type)}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={styles.activityTitle}>{item.title}</div>
        <div style={styles.activityTime}>{timeAgo(item.created_at)}</div>
      </div>
    </div>
  )
}

/* ============================================================
   EmptyState — reused across sections
   ============================================================ */
function EmptyState({ icon, title, sub }) {
  return (
    <div style={styles.emptyState}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10, color: '#94a3b8' }}>{icon}</div>
      <div style={styles.emptyTitle}>{title}</div>
      <div style={styles.emptySub}>{sub}</div>
    </div>
  )
}

/* ============================================================
   Styles — matching Profile.jsx design system
   ============================================================ */
const styles = {
  page: { maxWidth: 860, margin: '0 auto', padding: '24px 20px 60px' },

  /* Welcome strip */
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
    display: 'flex', alignItems: 'center', gap: 8,
    lineHeight: 1.2,
  },
  welcomeVerified: { display: 'inline-flex', alignItems: 'center', lineHeight: 0 },
  welcomeMeta: { fontSize: 12, color: '#64748b', marginTop: 4 },

  /* MLS notice */
  mlsNotice: {
    display: 'flex', alignItems: 'flex-start', gap: 12,
    padding: '14px 18px',
    background: '#fff',
    borderRadius: 12,
    borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0',
    borderLeftWidth: 3, borderLeftColor: '#1a6cf5',
    marginBottom: 16,
  },
  mlsIconWrap: {
    width: 32, height: 32, borderRadius: 8,
    background: '#e8f0fe', color: '#1a6cf5',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  mlsTitle: { fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 2 },
  mlsBody: { fontSize: 12, color: '#475569', lineHeight: 1.6 },
  mlsDismiss: {
    width: 28, height: 28,
    border: 'none', background: 'transparent',
    borderRadius: 6, cursor: 'pointer',
    color: '#94a3b8',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
    transition: 'background 120ms ease, color 120ms ease',
  },

  /* Tab bar */
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
    marginBottom: -1.5,
    whiteSpace: 'nowrap',
    transition: 'color 120ms ease, border-color 120ms ease',
  },
  tabActive: { color: '#1a6cf5', borderBottomColor: '#1a6cf5' },

  /* Stat tiles */
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gap: 12,
    marginBottom: 16,
  },
  statTile: {
    background: '#fff',
    borderRadius: 12,
    borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0',
    padding: 16,
    boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
  },
  statTileTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statTileIcon: { display: 'inline-flex' },
  statTileValue: {
    fontFamily: 'var(--serif)',
    fontSize: 26, fontWeight: 700, color: '#0f172a',
    lineHeight: 1.1, marginBottom: 6,
  },
  statTileLabel: {
    fontSize: 11, fontWeight: 600, color: '#94a3b8',
    textTransform: 'uppercase', letterSpacing: 0.5,
    display: 'inline-flex', alignItems: 'center', gap: 6,
  },
  statDot: { width: 5, height: 5, borderRadius: '50%', display: 'inline-block' },

  /* Generic card */
  card: {
    background: '#fff',
    borderRadius: 16,
    borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0',
    marginBottom: 16,
    boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
    overflow: 'hidden',
  },
  cardSub: { fontSize: 13, color: '#64748b', marginTop: -8, marginBottom: 16, lineHeight: 1.6 },

  /* Section internals */
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 },
  h2: { fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 },
  sectionCount: { fontSize: 11, color: '#64748b', fontWeight: 600, background: '#f1f5f9', padding: '4px 10px', borderRadius: 100 },

  /* Filter chips */
  filterChip: {
    padding: '6px 12px',
    borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0',
    borderRadius: 100,
    background: '#fff',
    fontSize: 12, fontWeight: 600,
    color: '#64748b', cursor: 'pointer',
    transition: 'background 120ms ease, color 120ms ease, border-color 120ms ease',
  },

  /* Generic row (clients & leads) */
  row: {
    display: 'flex', alignItems: 'flex-start', gap: 12,
    padding: 14,
    background: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0',
    textDecoration: 'none', color: 'inherit',
    transition: 'background 120ms ease, border-color 120ms ease',
    flexWrap: 'wrap',
  },
  rowLeft: { display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, textDecoration: 'none', color: 'inherit', minWidth: 0 },
  rowTopLine: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 },
  rowName: { fontSize: 14, fontWeight: 700, color: '#0f172a' },
  rowMeta: { display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 2 },
  rowMetaItem: { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b' },
  rowRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 },
  timeAgo: { fontSize: 11, color: '#94a3b8' },
  messageBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    fontSize: 12, fontWeight: 700,
    padding: '6px 12px',
    background: '#e8f0fe', color: '#1a6cf5',
    borderRadius: 8,
    textDecoration: 'none',
    border: 'none', cursor: 'pointer',
    transition: 'background 120ms ease',
  },

  /* Status badges/tags */
  clientBadge: { fontSize: 10, fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: 100, letterSpacing: 0.3, textTransform: 'uppercase' },
  tagHasBroker: { fontSize: 10, fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: 100, letterSpacing: 0.3, textTransform: 'uppercase' },
  tagNoBroker: { fontSize: 10, fontWeight: 700, color: '#c2410c', background: '#ffedd5', padding: '2px 8px', borderRadius: 100, letterSpacing: 0.3, textTransform: 'uppercase' },

  /* Activity */
  activityList: { display: 'flex', flexDirection: 'column', gap: 12 },
  activityItem: { display: 'flex', alignItems: 'flex-start', gap: 10 },
  activityIcon: {
    width: 32, height: 32, borderRadius: 8,
    background: '#f1f5f9', color: '#64748b',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  activityTitle: { fontSize: 13, color: '#0f172a', fontWeight: 500, lineHeight: 1.4 },
  activityTime: { fontSize: 11, color: '#94a3b8', marginTop: 2 },

  /* Empty state */
  emptyState: { textAlign: 'center', padding: '32px 20px', background: '#f8fafc', borderRadius: 12, marginTop: 4 },
  emptyTitle: { fontWeight: 700, color: '#0f172a', marginBottom: 4, fontSize: 14 },
  emptySub: { fontSize: 13, color: '#64748b', lineHeight: 1.5 },

  /* Marketing tab feature cards */
  featureCard: {
    display: 'flex', alignItems: 'flex-start', gap: 14,
    padding: 16,
    background: '#f8fafc',
    borderRadius: 12,
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
  featureTitle: {
    display: 'flex', alignItems: 'center', gap: 8,
    fontSize: 14, fontWeight: 700, color: '#0f172a',
    marginBottom: 4, flexWrap: 'wrap',
  },
  featureBody: { fontSize: 12, color: '#475569', lineHeight: 1.6 },
  featureNote: { fontSize: 11, color: '#94a3b8', marginTop: 6, fontStyle: 'italic' },
  comingSoonPill: {
    fontSize: 10, fontWeight: 700,
    color: '#64748b', background: '#f1f5f9',
    padding: '2px 8px', borderRadius: 100,
    letterSpacing: 0.3, textTransform: 'uppercase',
  },

  loadingText: { textAlign: 'center', padding: 30, color: '#64748b', fontSize: 13 },
}