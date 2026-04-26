import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import TopNav from '../components/TopNav'
import Footer from '../components/Footer'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

/* ============================================================
   Inline SVG icons — matching Profile / Dashboard system
   ============================================================ */
const Icon = {
  Building: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="6" x2="9" y2="6"/><line x1="15" y1="6" x2="15" y2="6"/><line x1="9" y1="10" x2="9" y2="10"/><line x1="15" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="9" y2="14"/><line x1="15" y1="14" x2="15" y2="14"/><path d="M10 22v-4h4v4"/>
    </svg>
  ),
  ChartBar: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>
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
  Verified: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2.5c.6 0 1.18.18 1.66.52l1.34.95c.27.19.6.29.93.27l1.64-.07c1.18-.05 2.18.85 2.23 2.03l.07 1.64c.01.33.13.65.33.91l1 1.3a2.13 2.13 0 0 1 0 2.6l-1 1.3c-.2.26-.32.58-.33.91l-.07 1.64c-.05 1.18-1.05 2.08-2.23 2.03l-1.64-.07c-.33-.02-.66.08-.93.27l-1.34.95a2.13 2.13 0 0 1-2.32 0l-1.34-.95a1.59 1.59 0 0 0-.93-.27l-1.64.07c-1.18.05-2.18-.85-2.23-2.03l-.07-1.64a1.59 1.59 0 0 0-.33-.91l-1-1.3a2.13 2.13 0 0 1 0-2.6l1-1.3c.2-.26.32-.58.33-.91l.07-1.64c.05-1.18 1.05-2.08 2.23-2.03l1.64.07c.33.02.66-.08.93-.27l1.34-.95A2.13 2.13 0 0 1 12 2.5Z" fill="#1a6cf5"/>
      <path d="m8.5 12 2.5 2.5L15.5 9.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  ),
  Info: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
}

/* Role pill (manager) */
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

/* ============================================================
   WelcomeStrip — slim, white, professional
   ============================================================ */
function WelcomeStrip({ profile }) {
  const joinedDate = formatJoinedDate(profile.created_at)
  const metaPieces = []
  if (profile.company) metaPieces.push(profile.company)
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
   Info banner — dismissable, persists in localStorage
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
   TabBar
   ============================================================ */
function TabBar({ activeTab, onChange }) {
  const tabs = [
    { id: 'properties', label: 'My Properties', icon: <Icon.Building size={14}/> },
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
              Portfolio Boost
              <span style={styles.comingSoonPill}>Coming soon</span>
            </div>
            <div style={styles.featureBody}>
              Surface your managed buildings in suggested cards across relevant searches and neighborhood pages.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   Manager Dashboard
   ============================================================ */
export default function ManagerDashboard() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('properties')
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

  if (!profile) return null

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <TopNav/>
      <div style={styles.page}>
        <WelcomeStrip profile={profile}/>
        <TabBar activeTab={activeTab} onChange={setActiveTab}/>

        {activeTab === 'properties' && (
          <>
            <InfoBanner
              userId={user.id}
              storageKey="manager_intro"
              title="Manage your buildings on Chathouse"
              body="Claim buildings you manage to handle your presence at scale. Comments from residents and prospects appear publicly — you can respond on behalf of the property to maintain professional engagement."
            />

            {/* Stat tiles */}
            <div style={styles.statsGrid}>
              <StatTile icon={<Icon.Building size={16}/>} label="Claimed Listings" value={claimedListings.length} accent="#1a6cf5"/>
              <StatTile icon={<Icon.Message size={16}/>} label="Total Comments" value={totalComments} accent="#6d28d9"/>
            </div>

            {/* Claimed Listings */}
            <div style={styles.card}>
              <div style={{ padding: 24 }}>
                <div style={styles.sectionHeader}>
                  <h2 style={styles.h2}>Your Claimed Listings</h2>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Link to="/listings" style={styles.btnSecondary}>
                      <Icon.Plus size={13}/> Claim Existing
                    </Link>
                    <Link to="/add-listing" style={styles.btnPrimary}>
                      <Icon.Plus size={13}/> Post a Listing
                    </Link>
                  </div>
                </div>

                {listingsLoading
                  ? <div style={styles.loadingText}>Loading...</div>
                  : claimedListings.length === 0
                    ? (
                      <div style={styles.emptyState}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10, color: '#94a3b8' }}>
                          <Icon.Building size={28}/>
                        </div>
                        <div style={styles.emptyTitle}>No claimed listings yet</div>
                        <div style={styles.emptySub}>Find your buildings on Chathouse and claim them to manage them here.</div>
                        <Link to="/listings" style={{ ...styles.btnPrimary, marginTop: 14, display: 'inline-flex' }}>
                          Browse listings to claim →
                        </Link>
                      </div>
                    )
                    : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {claimedListings.map(l => (
                          <Link key={l.id} to={`/listing/${l.id}`} style={styles.listingCard}>
                            <div style={styles.listingIcon}><Icon.Building size={18}/></div>
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
  btnSecondary: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '8px 14px', background: '#f1f5f9', color: '#475569',
    border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600,
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