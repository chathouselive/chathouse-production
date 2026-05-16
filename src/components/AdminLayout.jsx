import { useState, useEffect } from 'react'
import { NavLink, Navigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import TopNav from './TopNav'
import { supabase } from '../lib/supabase'

/* ============================================================
   Inline SVG icons — line-art style matching the rest of the app
   ============================================================ */
const Icon = {
  Chart: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
      <line x1="3" y1="20" x2="21" y2="20"/>
    </svg>
  ),
  Check: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  Camera: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  ),
  Home: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Users: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Buildings: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
      <path d="M9 6h.01"/><path d="M15 6h.01"/>
      <path d="M9 10h.01"/><path d="M15 10h.01"/>
      <path d="M9 14h.01"/><path d="M15 14h.01"/>
      <path d="M10 22v-4h4v4"/>
    </svg>
  ),
  Archive: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="21 8 21 21 3 21 3 8"/>
      <rect x="1" y="3" width="22" height="5"/>
      <line x1="10" y1="12" x2="14" y2="12"/>
    </svg>
  ),
  Sync: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/>
      <polyline points="1 20 1 14 7 14"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"/>
      <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"/>
    </svg>
  ),
}

export default function AdminLayout({ children }) {
  const { profile, loading } = useAuth()
  const [counts, setCounts] = useState({ verifications: 0, photos: 0, claims: 0 })

  useEffect(() => {
    if (profile?.is_admin) fetchPendingCounts()
  }, [profile])

  async function fetchPendingCounts() {
    const [
      { count: verifications },
      { count: photos },
      { count: claims },
    ] = await Promise.all([
      supabase.from('tenant_verifications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('photo_submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('listing_claims').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    ])
    setCounts({ verifications: verifications || 0, photos: photos || 0, claims: claims || 0 })
  }

  if (loading) return null
  if (!profile?.is_admin) return <Navigate to="/" replace />

  const links = [
    { to: '/admin', label: 'Overview', icon: <Icon.Chart/>, end: true, badge: 0 },
    { to: '/admin/verifications', label: 'Verifications', icon: <Icon.Check/>, badge: counts.verifications },
    { to: '/admin/photos', label: 'Photo Queue', icon: <Icon.Camera/>, badge: counts.photos },
    { to: '/admin/claims', label: 'Claims', icon: <Icon.Home/>, badge: counts.claims },
    { to: '/admin/users', label: 'Users', icon: <Icon.Users/>, badge: 0 },
    { to: '/admin/listings', label: 'Listings', icon: <Icon.Buildings/>, badge: 0 },
    { to: '/admin/archived', label: 'Archived', icon: <Icon.Archive/>, badge: 0 },
    { to: '/admin/sync', label: 'Sync', icon: <Icon.Sync/>, badge: 0 },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <TopNav />
      <div style={styles.shell}>
        <aside style={styles.sidebar}>
          <div style={styles.sidebarTitle}>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#0f172a', letterSpacing: 0.8, textTransform: 'uppercase' }}>ADMIN</span>
          </div>
          <nav style={styles.nav}>
            {links.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                style={({ isActive }) => ({
                  ...styles.link,
                  ...(isActive ? styles.linkActive : {}),
                })}
              >
                <span style={styles.linkIcon}>{l.icon}</span>
                <span style={{ flex: 1 }}>{l.label}</span>
                {l.badge > 0 && (
                  <span style={styles.badge}>{l.badge}</span>
                )}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main style={styles.main}>
          {children}
        </main>
      </div>
    </div>
  )
}

const styles = {
  shell: {
    maxWidth: 1280,
    margin: '0 auto',
    padding: '24px 20px',
    display: 'grid',
    gridTemplateColumns: '220px 1fr',
    gap: 24,
    minHeight: 'calc(100vh - 57px)',
  },
  sidebar: {
    background: '#fff',
    borderRadius: 16,
    border: '1.5px solid #e2e8f0',
    padding: 16,
    alignSelf: 'flex-start',
    position: 'sticky',
    top: 80,
  },
  sidebarTitle: { marginBottom: 12, paddingLeft: 10 },
  nav: { display: 'flex', flexDirection: 'column', gap: 2 },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    color: '#64748b',
    textDecoration: 'none',
    transition: 'background 0.15s, color 0.15s',
  },
  linkActive: { background: '#e8f0fe', color: '#1a6cf5' },
  linkIcon: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 16, height: 16,
  },
  badge: {
    background: '#ef4444',
    color: '#fff',
    fontSize: 10,
    fontWeight: 800,
    padding: '1px 6px',
    borderRadius: 100,
    minWidth: 18,
    textAlign: 'center',
  },
  main: { minWidth: 0 },
}