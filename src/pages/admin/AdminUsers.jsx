import { useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { useAdminUsers } from '../../lib/useAdmin'

export default function AdminUsers() {
  const [search, setSearch] = useState('')
  const { users, loading } = useAdminUsers(search)

  return (
    <AdminLayout>
      <div style={styles.head}>
        <h1 style={styles.h1}>Users</h1>
        <p style={styles.sub}>All registered Chathouse users.</p>
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search name or email..."
        style={styles.search}
      />

      {loading ? (
        <div style={styles.center}>Loading...</div>
      ) : (
        <div style={styles.table}>
          <div style={styles.thead}>
            <div>Name</div>
            <div>Email</div>
            <div>Type</div>
            <div>City</div>
            <div>Joined</div>
          </div>
          {users.map(u => (
            <div key={u.id} style={styles.tr}>
              <div style={styles.td}>
                <div style={styles.avatar}>{u.name?.[0]?.toUpperCase() || '?'}</div>
                <span>
                  {u.name}
                  {u.is_admin && <span style={styles.adminTag}>ADMIN</span>}
                </span>
              </div>
              <div style={{ ...styles.td, color: '#64748b', fontSize: 12 }}>{u.email}</div>
              <div style={styles.td}>
                <span style={{ ...styles.typeTag, background: typeColor(u.account_type).bg, color: typeColor(u.account_type).fg }}>
                  {u.account_type}
                </span>
              </div>
              <div style={{ ...styles.td, color: '#64748b', fontSize: 12 }}>{u.city || '—'}</div>
              <div style={{ ...styles.td, color: '#94a3b8', fontSize: 12 }}>{new Date(u.created_at).toLocaleDateString()}</div>
            </div>
          ))}
          {users.length === 0 && <div style={{ padding: 30, textAlign: 'center', color: '#64748b', fontSize: 13 }}>No users match your search.</div>}
        </div>
      )}
    </AdminLayout>
  )
}

function typeColor(type) {
  const map = {
    buyer: { bg: '#e8f0fe', fg: '#1a6cf5' },
    agent: { bg: '#fff3e8', fg: '#ea580c' },
    broker: { bg: '#fff3e8', fg: '#c2410c' },
    landlord: { bg: '#f3e8ff', fg: '#7e22ce' },
    management: { bg: '#f3e8ff', fg: '#9333ea' },
  }
  return map[type] || { bg: '#f1f5f9', fg: '#64748b' }
}

const styles = {
  head: { marginBottom: 16 },
  h1: { fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 700, color: '#0f172a' },
  sub: { fontSize: 14, color: '#64748b', marginTop: 2 },
  search: {
    width: '100%', padding: '10px 14px',
    border: '1.5px solid #e2e8f0', borderRadius: 10,
    fontSize: 13, outline: 'none', marginBottom: 16,
    background: '#fff', color: '#0f172a',
  },
  table: { background: '#fff', borderRadius: 12, border: '1.5px solid #e2e8f0', overflow: 'hidden' },
  thead: {
    display: 'grid',
    gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr',
    padding: '10px 14px',
    fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.3,
    borderBottom: '1px solid #e2e8f0',
    background: '#f8fafc',
  },
  tr: {
    display: 'grid',
    gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr',
    padding: '12px 14px',
    borderBottom: '1px solid #f1f5f9',
    alignItems: 'center',
    fontSize: 13,
  },
  td: { display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' },
  avatar: {
    width: 28, height: 28, borderRadius: '50%',
    background: 'linear-gradient(135deg, #1a6cf5, #f97316)',
    color: '#fff', fontSize: 12, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  adminTag: { fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: '#0f172a', color: '#fff', marginLeft: 6, letterSpacing: 0.5 },
  typeTag: { padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, textTransform: 'capitalize' },
  center: { padding: 40, textAlign: 'center', color: '#64748b' },
}
