import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import NotificationBell from './NotificationBell'

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

export default function TopNav() {
  const { user, profile, signOut } = useAuth()
  const loc = useLocation()

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <Link to={user ? '/listings' : '/'} style={styles.logo}>
          <ChathouseLogo height={48} />
        </Link>

        <div style={styles.links}>
          <Link to="/listings" style={{ ...styles.link, ...(loc.pathname === '/listings' ? styles.active : {}) }}>Listings</Link>
          {['agent','broker'].includes(profile?.account_type) && (
            <Link to="/dashboard" style={{ ...styles.link, ...(loc.pathname === '/dashboard' ? styles.active : {}) }}>Dashboard</Link>
          )}
          {profile?.account_type === 'landlord' && (
            <Link to="/my-property" style={{ ...styles.link, ...(loc.pathname === '/my-property' ? styles.active : {}) }}>My Property</Link>
          )}
          {profile?.account_type === 'management' && (
            <Link to="/property-dashboard" style={{ ...styles.link, ...(loc.pathname === '/property-dashboard' ? styles.active : {}) }}>Property Dashboard</Link>
          )}
          {profile?.is_admin && (
            <Link to="/admin" style={{ ...styles.link, ...(loc.pathname.startsWith('/admin') ? styles.active : {}) }}>
              Admin
            </Link>
          )}
        </div>

        <div style={styles.right}>
          {user ? (
            <>
              <NotificationBell />
              <Link to="/messages" style={{ ...styles.messagesBtn, ...(loc.pathname === '/messages' ? styles.messagesBtnActive : {}) }}>
                💬
              </Link>
              {profile && (
                <Link to={`/profile/${profile.id}`} style={styles.userBadge}>
                  {profile.photo_url ? (
                    <img src={profile.photo_url} alt={profile.name} style={styles.avatarImg}/>
                  ) : (
                    <div style={styles.avatar}>{profile.name?.[0]?.toUpperCase() || '?'}</div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{profile.name?.split(' ')[0]}</span>
                    <span style={{ fontSize: 10, color: '#64748b', textTransform: 'capitalize' }}>{profile.account_type}</span>
                  </div>
                </Link>
              )}
              <button onClick={signOut} style={styles.signOut}>Sign out</button>
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

const styles = {
  nav: { position: 'sticky', top: 0, zIndex: 50, background: '#fff', borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' },
  inner: { maxWidth: 1160, margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 16 },
  logo: { display: 'flex', alignItems: 'center', textDecoration: 'none' },
  links: { display: 'flex', gap: 4, flex: 1 },
  link: { padding: '8px 14px', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#64748b', textDecoration: 'none' },
  active: { background: '#e8f0fe', color: '#1a6cf5' },
  right: { display: 'flex', alignItems: 'center', gap: 8 },
  messagesBtn: { width: 36, height: 36, borderRadius: 8, background: '#f1f5f9', border: 'none', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' },
  messagesBtnActive: { background: '#e8f0fe' },
  userBadge: { display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px 4px 4px', borderRadius: 100, textDecoration: 'none' },
  avatar: { width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #1a6cf5, #f97316)', color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarImg: { width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 },
  signOut: { padding: '7px 14px', background: '#f1f5f9', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#475569', cursor: 'pointer' },
  signIn: { padding: '8px 16px', background: '#f1f5f9', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#475569', textDecoration: 'none' },
  signUp: { padding: '8px 16px', background: '#1a6cf5', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none' },
}
