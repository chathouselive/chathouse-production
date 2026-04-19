import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export default function TopNav() {
  const { profile, signOut } = useAuth()
  const loc = useLocation()

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <Link to="/" style={styles.logo}>
          <span style={{ fontSize: 24 }}>🏠</span>
          <span style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 22, color: '#0f172a' }}>Chathouse</span>
        </Link>

        <div style={styles.links}>
          <Link to="/" style={{ ...styles.link, ...(loc.pathname === '/' ? styles.active : {}) }}>Listings</Link>
          {profile?.is_admin && (
            <Link to="/admin" style={{ ...styles.link, ...(loc.pathname.startsWith('/admin') ? styles.active : {}) }}>
              Admin
            </Link>
          )}
        </div>

        <div style={styles.right}>
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
        </div>
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 50,
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
    boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
  },
  inner: {
    maxWidth: 1160,
    margin: '0 auto',
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 24,
  },
  logo: { display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' },
  links: { display: 'flex', gap: 4, flex: 1 },
  link: {
    padding: '8px 14px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    color: '#64748b',
    textDecoration: 'none',
  },
  active: { background: '#e8f0fe', color: '#1a6cf5' },
  right: { display: 'flex', alignItems: 'center', gap: 12 },
  userBadge: { display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px 4px 4px', borderRadius: 100, textDecoration: 'none' },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #1a6cf5, #f97316)',
    color: '#fff',
    fontSize: 13,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarImg: { width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 },
  signOut: {
    padding: '7px 14px',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    color: '#475569',
    cursor: 'pointer',
  },
}
