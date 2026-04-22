import { useState, useEffect } from 'react'
import { NavLink, Navigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import TopNav from './TopNav'
import { supabase } from '../lib/supabase'

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
    { to: '/admin', label: 'Overview', icon: '📊', end: true, badge: 0 },
    { to: '/admin/verifications', label: 'Verifications', icon: '✓', badge: counts.verifications },
    { to: '/admin/photos', label: 'Photo Queue', icon: '📷', badge: counts.photos },
    { to: '/admin/claims', label: 'Claims', icon: '🏠', badge: counts.claims },
    { to: '/admin/users', label: 'Users', icon: '👥', badge: 0 },
    { to: '/admin/listings', label: 'Listings', icon: '🏘️', badge: 0 },
    { to: '/admin/sync', label: 'Sync', icon: '🔄', badge: 0 },
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
                <span style={{ fontSize: 16 }}>{l.icon}</span>
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
    transition: 'background 0.15s',
  },
  linkActive: { background: '#e8f0fe', color: '#1a6cf5' },
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
