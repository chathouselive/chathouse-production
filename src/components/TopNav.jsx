import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import NotificationBell from './NotificationBell'

/* ============================================================
   Chathouse logo (unchanged)
   ============================================================ */
function ChathouseLogo({ height = 32 }) {
  return (
    <svg height={height} viewBox="0 0 600 140" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <g transform="translate(24, 16) scale(0.84)">
        <polygon points="54,0 108,46 96,46 96,108 12,108 12,46 0,46" fill="#1A6FE8"/>
        <rect x="38" y="72" width="32" height="36" rx="4" fill="white"/>
        <rect x="58" y="18" width="36" height="28" rx="7" fill="white"/>
        <polygon points="62,46 74,46 66,54" fill="white"/>
        <circle cx="67" cy="32" r="3" fill="#1A6FE8"/>
        <circle cx="76" cy="32" r="3" fill="#1A6FE8"/>
        <circle cx="85" cy="32" r="3" fill="#1A6FE8"/>
      </g>
      <text x="120" y="84" fontFamily="Arial, Helvetica, sans-serif" fontSize="58" letterSpacing="-2">
        <tspan fontWeight="800" fill="#0F1F3D">chat</tspan>
        <tspan fontWeight="400" fill="#1A6FE8" letterSpacing="-2">house</tspan>
      </text>
      <text x="120" y="112" fontFamily="Arial, Helvetica, sans-serif" fontWeight="400" fontSize="13" fill="#8A94A6" letterSpacing="1.5">FIND. TALK. MOVE.</text>
    </svg>
  )
}

/* ============================================================
   Inline SVG icons (no emoji)
   ============================================================ */
const ChatIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)

const ChevronDown = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)

const SignOutIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

const UnlinkIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/>
    <line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
)

const SettingsIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)

/* ============================================================
   Role pill: distinct color per account type
   ============================================================ */
const ROLE_STYLES = {
  buyer:      { label: 'Buyer',    bg: '#f1f5f9', fg: '#475569' },
  renter:     { label: 'Renter',   bg: '#f1f5f9', fg: '#475569' },
  agent:      { label: 'Agent',    bg: '#dbeafe', fg: '#1d4ed8' },
  broker:     { label: 'Broker',   bg: '#ede9fe', fg: '#6d28d9' },
  landlord:   { label: 'Landlord', bg: '#dcfce7', fg: '#15803d' },
  management: { label: 'Manager',  bg: '#ffedd5', fg: '#c2410c' },
}

function RolePill({ accountType }) {
  const style = ROLE_STYLES[accountType] || ROLE_STYLES.buyer
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 100,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 0.3,
      textTransform: 'uppercase',
      background: style.bg,
      color: style.fg,
    }}>
      {style.label}
    </span>
  )
}

/* ============================================================
   Avatar with initials fallback
   ============================================================ */
function Avatar({ profile, size = 32 }) {
  if (profile?.photo_url) {
    return <img src={profile.photo_url} alt={profile.name} style={{
      width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0,
    }}/>
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, #1a6cf5, #f97316)',
      color: '#fff',
      fontSize: size <= 32 ? 13 : 18,
      fontWeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {profile?.name?.[0]?.toUpperCase() || '?'}
    </div>
  )
}

/* ============================================================
   Linked person card (for buyer dropdown: My Agent / My Broker)
   ============================================================ */
function LinkedPersonCard({ label, person, onUnlink, unlinking }) {
  if (!person) {
    return (
      <div style={ddStyles.linkedEmpty}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
        <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>None linked</div>
      </div>
    )
  }
  return (
    <div style={ddStyles.linkedCard}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar profile={person} size={36} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
          <Link to={`/profile/${person.id}`} style={{
            fontSize: 13, fontWeight: 600, color: '#0f172a', textDecoration: 'none',
            display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {person.name}
          </Link>
        </div>
      </div>
      <button onClick={onUnlink} disabled={unlinking} style={{
        marginTop: 8, width: '100%',
        padding: '6px 10px', background: '#fff',
        borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0',
        borderRadius: 6, fontSize: 11, fontWeight: 600, color: '#64748b',
        cursor: unlinking ? 'wait' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        opacity: unlinking ? 0.6 : 1,
      }}>
        <UnlinkIcon /> {unlinking ? 'Unlinking…' : 'Unlink'}
      </button>
    </div>
  )
}

/* ============================================================
   Main TopNav
   ============================================================ */
export default function TopNav() {
  const { user, profile, signOut } = useAuth()
  const loc = useLocation()
  const navigate = useNavigate()

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [linkedAgent, setLinkedAgent] = useState(null)
  const [linkedBroker, setLinkedBroker] = useState(null)
  const [unlinking, setUnlinking] = useState(null) // 'agent' | 'broker' | null
  const dropdownRef = useRef(null)

  const isBuyer = profile?.account_type === 'buyer' || profile?.account_type === 'renter'

  /* ----- Click outside + ESC to close dropdown ----- */
  useEffect(() => {
    if (!dropdownOpen) return
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    const escHandler = (e) => { if (e.key === 'Escape') setDropdownOpen(false) }
    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', escHandler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('keydown', escHandler)
    }
  }, [dropdownOpen])

  /* ----- Fetch linked agent + broker (buyers only) -----
     The "linked" state lives in representation_requests with status='accepted'.
     Query for accepted rows where this user is the lead, then fetch the
     agent's profile and split by their account_type (agent vs broker). */
  useEffect(() => {
    if (!user || !isBuyer) return
    let cancelled = false

    async function fetchLinks() {
      console.log('[TopNav] Fetching links for user:', user.id)

      const { data: links, error } = await supabase
        .from('representation_requests')
        .select('agent_id, lead_user_id, status')
        .eq('status', 'accepted')
        .eq('lead_user_id', user.id)

      console.log('[TopNav] representation_requests rows:', { links, error })

      if (cancelled) return
      if (error || !links || links.length === 0) {
        setLinkedAgent(null)
        setLinkedBroker(null)
        return
      }

      const agentIds = links.map(r => r.agent_id).filter(Boolean)
      console.log('[TopNav] Agent IDs to fetch:', agentIds)

      if (agentIds.length === 0) {
        setLinkedAgent(null)
        setLinkedBroker(null)
        return
      }

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, photo_url, account_type')
        .in('id', agentIds)

      console.log('[TopNav] linked profiles:', { profiles, profilesError })

      if (cancelled) return
      if (profilesError || !profiles) {
        setLinkedAgent(null)
        setLinkedBroker(null)
        return
      }

      const agent = profiles.find(p => p.account_type === 'agent') || null
      const broker = profiles.find(p => p.account_type === 'broker') || null

      console.log('[TopNav] Setting linkedAgent:', agent, 'linkedBroker:', broker)

      setLinkedAgent(agent)
      setLinkedBroker(broker)
    }

    fetchLinks()
    return () => { cancelled = true }
  }, [user, isBuyer, dropdownOpen]) // refetch when dropdown opens

  /* ----- Unlink handler -----
     Updates representation_requests.status from 'accepted' to 'unlinked'.
     Covers both directions in case of any data oddity. */
  async function handleUnlink(personId, role) {
    if (!user || !personId) return
    setUnlinking(role)
    try {
      const { error } = await supabase
        .from('representation_requests')
        .delete()
        .eq('agent_id', personId)
        .eq('lead_user_id', user.id)

      if (error) {
        console.error('Unlink failed:', error)
        alert('Unlink failed. Please try again.')
        return
      }

      if (role === 'agent') setLinkedAgent(null)
      if (role === 'broker') setLinkedBroker(null)
    } catch (err) {
      console.error('Unlink failed:', err)
      alert('Unlink failed. Please try again.')
    } finally {
      setUnlinking(null)
    }
  }

  async function handleSignOut() {
    setDropdownOpen(false)
    await signOut()
    navigate('/')
  }

  const isActive = (path) => loc.pathname === path
  const isActivePrefix = (prefix) => loc.pathname.startsWith(prefix)

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        {/* ===== Logo ===== */}
        <Link to={user ? '/listings' : '/'} style={styles.logo}>
          <ChathouseLogo height={48} />
        </Link>

        {/* ===== Center tabs ===== */}
        <div style={styles.links}>
          <Link to="/listings" style={{ ...styles.link, ...(isActive('/listings') ? styles.linkActive : {}) }}>
            Listings
          </Link>

          {['agent', 'broker'].includes(profile?.account_type) && (
            <Link to="/dashboard" style={{ ...styles.link, ...(isActive('/dashboard') ? styles.linkActive : {}) }}>
              Dashboard
            </Link>
          )}

          {profile?.account_type === 'landlord' && (
            <Link to="/my-property" style={{ ...styles.link, ...(isActive('/my-property') ? styles.linkActive : {}) }}>
              My Property
            </Link>
          )}

          {profile?.account_type === 'management' && (
            <Link to="/property-dashboard" style={{ ...styles.link, ...(isActive('/property-dashboard') ? styles.linkActive : {}) }}>
              Property Dashboard
            </Link>
          )}

          {profile?.is_admin && (
            <Link to="/admin" style={{ ...styles.link, ...(isActivePrefix('/admin') ? styles.linkActive : {}) }}>
              Admin
            </Link>
          )}
        </div>

        {/* ===== Right cluster ===== */}
        <div style={styles.right}>
          {user ? (
            <>
              <NotificationBell />

              <Link
                to="/messages"
                style={{ ...styles.iconBtn, ...(isActive('/messages') ? styles.iconBtnActive : {}) }}
                aria-label="Messages"
              >
                <ChatIcon />
              </Link>

              {profile && (
                <div style={{ position: 'relative' }} ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(o => !o)}
                    style={{
                      ...styles.userBadge,
                      ...(dropdownOpen ? styles.userBadgeOpen : {}),
                    }}
                  >
                    <Avatar profile={profile} size={32} />
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                        {profile.name?.split(' ')[0]}
                      </span>
                      <RolePill accountType={profile.account_type} />
                    </div>
                    <span style={{
                      color: '#94a3b8',
                      transition: 'transform 150ms ease',
                      transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      display: 'flex',
                    }}>
                      <ChevronDown />
                    </span>
                  </button>

                  {dropdownOpen && (
                    <ProfileDropdown
                      profile={profile}
                      isBuyer={isBuyer}
                      linkedAgent={linkedAgent}
                      linkedBroker={linkedBroker}
                      unlinking={unlinking}
                      onUnlinkAgent={() => handleUnlink(linkedAgent?.id, 'agent')}
                      onUnlinkBroker={() => handleUnlink(linkedBroker?.id, 'broker')}
                      onSignOut={handleSignOut}
                      onClose={() => setDropdownOpen(false)}
                    />
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <Link to="/signin" style={styles.signIn}>Sign in</Link>
              <Link to="/signup" style={styles.signUp}>Sign up →</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

/* ============================================================
   Profile Dropdown Panel
   ============================================================ */
function ProfileDropdown({ profile, isBuyer, linkedAgent, linkedBroker, unlinking, onUnlinkAgent, onUnlinkBroker, onSignOut, onClose }) {
  return (
    <div style={ddStyles.panel}>
      {/* ----- Header (avatar + name + role) ----- */}
      <div style={ddStyles.header}>
        <Avatar profile={profile} size={48} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {profile.name}
          </div>
          <div style={{ marginTop: 4 }}>
            <RolePill accountType={profile.account_type} />
          </div>
        </div>
      </div>

      {/* ----- Stats row ----- */}
      {/* TODO wire these up to real DB counts (saved listings, comments, likes) */}
      <div style={ddStyles.stats}>
        <Stat label="Saved" value={0} />
        <Stat label="Comments" value={0} />
        <Stat label="Likes" value={0} />
      </div>

      {/* ----- Buyer-only: My Agent / My Broker linked cards ----- */}
      {isBuyer && (
        <div style={ddStyles.linkedSection}>
          <LinkedPersonCard
            label="My Agent"
            person={linkedAgent}
            onUnlink={onUnlinkAgent}
            unlinking={unlinking === 'agent'}
          />
          <div style={{ height: 8 }} />
          <LinkedPersonCard
            label="My Broker"
            person={linkedBroker}
            onUnlink={onUnlinkBroker}
            unlinking={unlinking === 'broker'}
          />
        </div>
      )}

      {/* ----- Divider ----- */}
      <div style={ddStyles.divider} />

      {/* ----- Menu items ----- */}
      <Link to={`/profile/${profile.id}`} style={ddStyles.menuItem} onClick={onClose}>
        <span style={{ width: 20, display: 'flex' }}>
          <Avatar profile={profile} size={18} />
        </span>
        View profile
      </Link>

      <Link to="/profile/edit" style={ddStyles.menuItem} onClick={onClose}>
        <span style={{ width: 20, display: 'flex', color: '#64748b' }}>
          <SettingsIcon size={16} />
        </span>
        Account settings
      </Link>

      <button onClick={onSignOut} style={{ ...ddStyles.menuItem, width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}>
        <span style={{ width: 20, display: 'flex', color: '#64748b' }}>
          <SignOutIcon size={16} />
        </span>
        Sign out
      </button>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div style={{ flex: 1, textAlign: 'center', padding: '8px 4px' }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{value}</div>
      <div style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>{label}</div>
    </div>
  )
}

/* ============================================================
   Styles
   Note: userBadge uses longhand borderWidth/borderStyle/borderColor
   instead of shorthand `border` to avoid React's warning about
   mixing shorthand with property overrides.
   ============================================================ */
const styles = {
  nav: {
    position: 'sticky', top: 0, zIndex: 50,
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
    boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
  },
  inner: {
    maxWidth: 1160, margin: '0 auto',
    padding: '12px 20px',
    display: 'flex', alignItems: 'center', gap: 16,
  },
  logo: { display: 'flex', alignItems: 'center', textDecoration: 'none' },

  links: { display: 'flex', gap: 4, flex: 1 },
  link: {
    padding: '8px 14px',
    borderRadius: 8,
    fontSize: 14, fontWeight: 600,
    color: '#64748b',
    textDecoration: 'none',
    transition: 'background 120ms ease, color 120ms ease',
  },
  linkActive: { background: '#e8f0fe', color: '#1a6cf5' },

  right: { display: 'flex', alignItems: 'center', gap: 8 },

  iconBtn: {
    width: 36, height: 36,
    borderRadius: 8,
    background: '#f1f5f9',
    border: 'none',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    textDecoration: 'none',
    color: '#475569',
    transition: 'background 120ms ease, color 120ms ease',
  },
  iconBtnActive: { background: '#e8f0fe', color: '#1a6cf5' },

  userBadge: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '4px 10px 4px 4px',
    borderRadius: 100,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'transparent',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'background 120ms ease, border-color 120ms ease',
  },
  userBadgeOpen: {
    background: '#f8fafc',
    borderColor: '#e2e8f0',
  },

  signIn: {
    padding: '8px 16px',
    background: '#f1f5f9',
    borderRadius: 8,
    fontSize: 13, fontWeight: 600,
    color: '#475569',
    textDecoration: 'none',
  },
  signUp: {
    padding: '8px 16px',
    background: '#1a6cf5',
    color: '#fff',
    borderRadius: 8,
    fontSize: 13, fontWeight: 700,
    textDecoration: 'none',
  },
}

const ddStyles = {
  panel: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    width: 320,
    background: '#fff',
    borderRadius: 12,
    border: '1px solid #e2e8f0',
    boxShadow: '0 10px 40px rgba(15, 23, 42, 0.12), 0 2px 8px rgba(15, 23, 42, 0.06)',
    padding: 12,
    zIndex: 100,
    animation: 'chathouseDropdownIn 150ms ease-out',
  },
  header: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '8px 8px 12px',
  },
  stats: {
    display: 'flex',
    background: '#f8fafc',
    borderRadius: 8,
    margin: '0 0 12px',
  },
  linkedSection: {
    marginBottom: 8,
  },
  linkedCard: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: 10,
  },
  linkedEmpty: {
    background: '#fafafa',
    border: '1px dashed #e2e8f0',
    borderRadius: 8,
    padding: 10,
  },
  divider: {
    height: 1,
    background: '#f1f5f9',
    margin: '4px -12px 4px',
  },
  menuItem: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 8px',
    borderRadius: 6,
    fontSize: 13, fontWeight: 500,
    color: '#0f172a',
    textDecoration: 'none',
    transition: 'background 100ms ease',
  },
}

/* Inject the dropdown animation keyframes once */
if (typeof document !== 'undefined' && !document.getElementById('chathouse-topnav-anim')) {
  const styleEl = document.createElement('style')
  styleEl.id = 'chathouse-topnav-anim'
  styleEl.textContent = `
    @keyframes chathouseDropdownIn {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `
  document.head.appendChild(styleEl)
}