import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import TopNav from '../components/TopNav'
import Footer from '../components/Footer'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

const ACCOUNT_TYPE_LABELS = {
  buyer: { label: 'Buyer / Renter', color: '#1a6cf5', bg: '#e8f0fe', icon: '🏘️' },
  agent: { label: 'Agent', color: '#ea580c', bg: '#fff3e8', icon: '🤝' },
  broker: { label: 'Mortgage Broker', color: '#c2410c', bg: '#fff3e8', icon: '🏦' },
  landlord: { label: 'Landlord', color: '#7e22ce', bg: '#f3e8ff', icon: '🏡' },
  management: { label: 'Property Manager', color: '#9333ea', bg: '#f3e8ff', icon: '🏢' },
}

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
  if (profile.account_type === 'agent') return <AgentDashboard profile={profile} user={user} />
  if (profile.account_type === 'broker') return <BrokerDashboard profile={profile} user={user} />
  return null
}

// ─── AGENT DASHBOARD ───────────────────────────────────────────────────────────

function AgentDashboard({ profile, user }) {
  const [clients, setClients] = useState([])
  const [clientsLoading, setClientsLoading] = useState(true)
  const [stats, setStats] = useState({ linkedBuyers: 0, commentLikes: 0, reviews: 0, avgRating: 0 })
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    fetchAgentData()
  }, [])

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

    // Comment likes
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

    // Fetch linked clients
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

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000), hours = Math.floor(diff / 3600000), days = Math.floor(diff / 86400000)
    if (mins < 1) return 'just now'; if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`; if (days < 7) return `${days}d ago`
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0fdf4' }}>
      <TopNav />
      <div style={styles.page}>

        {/* Welcome banner */}
        <div style={{ ...styles.welcomeBanner, background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)', border: '1.5px solid #86efac' }}>
          <div style={{ ...styles.welcomeAvatar, background: '#16a34a' }}>
            {profile.photo_url ? <img src={profile.photo_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}/> : <span style={{ fontSize: 28 }}>🤝</span>}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#14532d', fontFamily: 'var(--serif)' }}>
              Welcome back, {profile.name?.split(' ')[0]}
            </div>
            <div style={{ fontSize: 13, color: '#166534', marginTop: 2 }}>
              {profile.company && `${profile.company} · `}
              {profile.license_number && `License ${profile.license_number} · `}
              Pro plan
            </div>
          </div>
          <div style={{ ...styles.verifiedBadge, background: '#16a34a' }}>✓ Verified Agent</div>
        </div>

        {/* MLS sync notice */}
        <div style={styles.mlsNotice}>
          <span style={{ fontSize: 20 }}>🔄</span>
          <div>
            <span style={{ fontWeight: 700, color: '#1e40af' }}>Your MLS listings sync to Chathouse automatically</span>
            <span style={{ color: '#3b82f6' }}> — no manual posting needed. Once a listing is submitted to the MLS it will appear on the feed within 24–48 hours and your agent profile will be attached.</span>
          </div>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          <StatCard icon="👥" label="Linked Buyers" value={stats.linkedBuyers} color="#16a34a" bg="#dcfce7" border="#86efac"/>
          <StatCard icon="❤️" label="Comment Likes" value={stats.commentLikes} color="#dc2626" bg="#fee2e2" border="#fca5a5"/>
          <StatCard icon="⭐" label="Reviews" value={stats.reviews} color="#d97706" bg="#fef3c7" border="#fcd34d"/>
          <StatCard icon="🏆" label="Avg Rating" value={stats.avgRating > 0 ? `${stats.avgRating}/5` : '—'} color="#7c3aed" bg="#f3e8ff" border="#c4b5fd"/>
        </div>

        {/* Linked Clients */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>👥 Your Linked Clients</h2>
            <span style={styles.sectionCount}>{stats.linkedBuyers} active</span>
          </div>
          {clientsLoading ? (
            <div style={styles.center}><div style={styles.spinner}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
          ) : clients.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>No linked clients yet</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>When buyers send you a link request and you accept, they'll appear here.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {clients.map(client => (
                <Link key={client.id} to={`/profile/${client.id}`} style={styles.clientCard}>
                  <div style={styles.clientAvatar}>
                    {client.photo_url ? <img src={client.photo_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}/> : <div style={styles.clientAvatarInitial}>{client.name?.[0]?.toUpperCase()}</div>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={styles.clientName}>{client.name}</span>
                      <span style={styles.clientBadge}>✓ Your client</span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      {client.city && <span style={styles.clientMeta}>📍 {client.city}</span>}
                      {client.move_timeline && <span style={styles.clientMeta}>⏱ {client.move_timeline}</span>}
                      {client.looking_for && <span style={styles.clientMeta}>🏠 {client.looking_for}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <span style={styles.timeAgo}>{timeAgo(client.linkedAt)}</span>
                    <Link to={`/messages?user=${client.id}`} onClick={e => e.stopPropagation()} style={styles.messageClientBtn}>💬 Message</Link>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Zip Code Advertising — placeholder */}
        <div style={styles.section}>
          <div style={{ ...styles.zipAdCard, background: 'linear-gradient(135deg, #dcfce7, #d1fae5)', border: '1.5px solid #86efac' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#14532d', marginBottom: 4 }}>📍 Zip Code Advertising</div>
                <div style={{ fontSize: 13, color: '#166534', maxWidth: 340, lineHeight: 1.5 }}>Own a zip code and get featured placement when buyers browse listings in that area.</div>
                <div style={{ fontSize: 11, color: '#16a34a', marginTop: 6, fontStyle: 'italic' }}>Note: Featured placement is paid — not an editorial recommendation.</div>
              </div>
              <button style={{ ...styles.zipAdBtn, background: '#16a34a' }} disabled>
                Coming Soon
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>🔔 Recent Activity</h2>
            <div style={styles.activityList}>
              {recentActivity.map(n => (
                <div key={n.id} style={styles.activityItem}>
                  <span style={styles.activityIcon}>{n.type === 'message' ? '💬' : n.type === 'link_request' ? '🔗' : n.type === 'friend_request' ? '👥' : '🔔'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 500 }}>{n.title}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{timeAgo(n.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

// ─── BROKER DASHBOARD ──────────────────────────────────────────────────────────

function BrokerDashboard({ profile, user }) {
  const [buyerFeed, setBuyerFeed] = useState([])
  const [feedFilter, setFeedFilter] = useState('all')
  const [feedLoading, setFeedLoading] = useState(true)
  const [stats, setStats] = useState({ activeLeads: 0, linkedClients: 0, reviews: 0, avgRating: 0 })
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    fetchBrokerData()
  }, [])

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

    // Check which buyers have a broker linked
    const buyerIds = buyerProfiles?.map(p => p.id) || []
    let brokerLinkedIds = new Set()
    if (buyerIds.length > 0) {
      const { data: linkedData } = await supabase
        .from('agent_clients')
        .select('client_user_id')
        .in('client_user_id', buyerIds)
      linkedData?.forEach(r => brokerLinkedIds.add(r.client_user_id))
    }

    const enrichedBuyers = (buyerProfiles || []).map(p => ({
      ...p,
      hasBroker: brokerLinkedIds.has(p.id),
    }))

    const avgRating = reviewData && reviewData.length > 0
      ? Math.round((reviewData.reduce((s, r) => s + r.rating, 0) / reviewData.length) * 10) / 10
      : 0

    const noBrokerCount = enrichedBuyers.filter(b => !b.hasBroker).length

    setStats({ activeLeads: noBrokerCount, linkedClients: linkedClients || 0, reviews: reviewData?.length || 0, avgRating })
    setBuyerFeed(enrichedBuyers)
    setRecentActivity(notifications || [])
    setFeedLoading(false)
  }

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000), hours = Math.floor(diff / 3600000), days = Math.floor(diff / 86400000)
    if (mins < 1) return 'just now'; if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`; if (days < 7) return `${days}d ago`
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const filteredFeed = buyerFeed.filter(b => {
    if (feedFilter === 'no_broker') return !b.hasBroker
    if (feedFilter === 'has_broker') return b.hasBroker
    return true
  })

  return (
    <div style={{ minHeight: '100vh', background: '#faf5ff' }}>
      <TopNav />
      <div style={styles.page}>

        {/* Welcome banner */}
        <div style={{ ...styles.welcomeBanner, background: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)', border: '1.5px solid #c4b5fd' }}>
          <div style={{ ...styles.welcomeAvatar, background: '#7c3aed' }}>
            {profile.photo_url ? <img src={profile.photo_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}/> : <span style={{ fontSize: 28 }}>🏦</span>}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#3b0764', fontFamily: 'var(--serif)' }}>
              Welcome back, {profile.name?.split(' ')[0]}
            </div>
            <div style={{ fontSize: 13, color: '#6d28d9', marginTop: 2 }}>
              {profile.company && `${profile.company} · `}
              {profile.license_number && `NMLS ${profile.license_number} · `}
              Pro plan
            </div>
          </div>
          <div style={{ ...styles.verifiedBadge, background: '#7c3aed' }}>✓ Verified Broker</div>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          <StatCard icon="⚡" label="No-Broker Buyers" value={stats.activeLeads} color="#d97706" bg="#fef3c7" border="#fcd34d"/>
          <StatCard icon="👥" label="Linked Clients" value={stats.linkedClients} color="#7c3aed" bg="#f3e8ff" border="#c4b5fd"/>
          <StatCard icon="⭐" label="Reviews" value={stats.reviews} color="#16a34a" bg="#dcfce7" border="#86efac"/>
          <StatCard icon="🏆" label="Avg Rating" value={stats.avgRating > 0 ? `${stats.avgRating}/5` : '—'} color="#1a6cf5" bg="#e8f0fe" border="#93c5fd"/>
        </div>

        {/* Buyer Lead Feed */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>🏦 Buyer Lead Feed</h2>
            <div style={{ display: 'flex', gap: 6 }}>
              {[['all', 'All'], ['no_broker', 'No Broker'], ['has_broker', 'Has Broker']].map(([val, label]) => (
                <button key={val} onClick={() => setFeedFilter(val)} style={{ ...styles.filterChip, ...(feedFilter === val ? { background: '#7c3aed', color: '#fff', borderColor: '#7c3aed' } : {}) }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {feedLoading ? (
            <div style={styles.center}><div style={styles.spinner}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
          ) : filteredFeed.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>No buyers found</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>Check back as more buyers join Chathouse.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredFeed.map(buyer => (
                <div key={buyer.id} style={styles.leadCard}>
                  <Link to={`/profile/${buyer.id}`} style={styles.leadLeft}>
                    <div style={styles.clientAvatar}>
                      {buyer.photo_url ? <img src={buyer.photo_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}/> : <div style={styles.clientAvatarInitial}>{buyer.name?.[0]?.toUpperCase()}</div>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={styles.clientName}>{buyer.name}</span>
                        {buyer.hasBroker ? (
                          <span style={{ ...styles.brokerTag, background: '#dcfce7', color: '#16a34a' }}>✓ Has broker</span>
                        ) : (
                          <span style={{ ...styles.brokerTag, background: '#fef3c7', color: '#d97706' }}>⚡ No broker</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        {buyer.city && <span style={styles.clientMeta}>📍 {buyer.city}</span>}
                        {buyer.move_timeline && <span style={styles.clientMeta}>⏱ {buyer.move_timeline}</span>}
                        {buyer.looking_for && <span style={styles.clientMeta}>🏠 {buyer.looking_for}</span>}
                      </div>
                    </div>
                  </Link>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                    <span style={styles.timeAgo}>{timeAgo(buyer.created_at)}</span>
                    <Link to={`/messages?user=${buyer.id}`} style={{ ...styles.messageClientBtn, background: '#f3e8ff', color: '#7c3aed' }}>💬 Message</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Zip Code Advertising — placeholder */}
        <div style={styles.section}>
          <div style={{ ...styles.zipAdCard, background: 'linear-gradient(135deg, #f3e8ff, #ede9fe)', border: '1.5px solid #c4b5fd' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#3b0764', marginBottom: 4 }}>📍 Zip Code Advertising</div>
                <div style={{ fontSize: 13, color: '#6d28d9', maxWidth: 340, lineHeight: 1.5 }}>Own a zip code and get featured placement when buyers browse listings in that area.</div>
              </div>
              <button style={{ ...styles.zipAdBtn, background: '#7c3aed' }} disabled>
                Coming Soon
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>🔔 Recent Activity</h2>
            <div style={styles.activityList}>
              {recentActivity.map(n => (
                <div key={n.id} style={styles.activityItem}>
                  <span style={styles.activityIcon}>{n.type === 'message' ? '💬' : n.type === 'link_request' ? '🔗' : n.type === 'friend_request' ? '👥' : '🔔'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 500 }}>{n.title}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{timeAgo(n.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

// ─── SHARED COMPONENTS ─────────────────────────────────────────────────────────

function StatCard({ icon, label, value, color, bg, border }) {
  return (
    <div style={{ padding: 18, background: bg, borderRadius: 14, border: `1.5px solid ${border}`, textAlign: 'center' }}>
      <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 800, color }}>{value ?? 0}</div>
      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
    </div>
  )
}

const styles = {
  page: { maxWidth: 860, margin: '0 auto', padding: '24px 20px 60px' },
  welcomeBanner: { display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px', borderRadius: 16, marginBottom: 16, flexWrap: 'wrap' },
  welcomeAvatar: { width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' },
  verifiedBadge: { padding: '8px 16px', borderRadius: 100, color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 },
  mlsNotice: { display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 18px', background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: 12, marginBottom: 16, fontSize: 13, lineHeight: 1.6 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 },
  section: { background: '#fff', borderRadius: 16, border: '1.5px solid #e2e8f0', padding: 24, marginBottom: 16 },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 },
  sectionTitle: { fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 700, color: '#0f172a' },
  sectionCount: { fontSize: 12, color: '#64748b', fontWeight: 600, background: '#f1f5f9', padding: '4px 10px', borderRadius: 100 },
  clientCard: { display: 'flex', alignItems: 'flex-start', gap: 12, padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', textDecoration: 'none', color: 'inherit' },
  leadCard: { display: 'flex', alignItems: 'flex-start', gap: 12, padding: 16, background: '#faf5ff', borderRadius: 12, border: '1px solid #e9d5ff' },
  leadLeft: { display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, textDecoration: 'none', color: 'inherit' },
  clientAvatar: { width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(135deg, #1a6cf5, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  clientAvatarInitial: { color: '#fff', fontSize: 16, fontWeight: 700 },
  clientName: { fontSize: 14, fontWeight: 700, color: '#0f172a' },
  clientBadge: { fontSize: 11, fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: 100 },
  brokerTag: { fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100 },
  clientMeta: { fontSize: 12, color: '#64748b' },
  timeAgo: { fontSize: 11, color: '#94a3b8' },
  messageClientBtn: { fontSize: 12, fontWeight: 700, padding: '6px 12px', background: '#e8f0fe', color: '#1a6cf5', borderRadius: 8, textDecoration: 'none', border: 'none', cursor: 'pointer' },
  filterChip: { padding: '6px 12px', border: '1.5px solid #e2e8f0', borderRadius: 100, background: '#fff', fontSize: 12, fontWeight: 600, color: '#64748b', cursor: 'pointer' },
  activityList: { display: 'flex', flexDirection: 'column', gap: 12 },
  activityItem: { display: 'flex', alignItems: 'flex-start', gap: 10 },
  activityIcon: { width: 32, height: 32, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 },
  zipAdCard: { borderRadius: 12, padding: 20 },
  zipAdBtn: { padding: '10px 20px', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'not-allowed', opacity: 0.7 },
  emptyState: { textAlign: 'center', padding: '32px 20px', background: '#f8fafc', borderRadius: 12 },
  center: { display: 'flex', justifyContent: 'center', padding: 32 },
  spinner: { width: 32, height: 32, borderRadius: '50%', border: '3px solid #e8f0fe', borderTop: '3px solid #1a6cf5', animation: 'spin 0.8s linear infinite' },
}
