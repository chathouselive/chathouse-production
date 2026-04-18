import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { useAdminStats } from '../../lib/useAdmin'

export default function AdminOverview() {
  const { stats, loading } = useAdminStats()

  return (
    <AdminLayout>
      <div style={styles.head}>
        <h1 style={styles.h1}>Overview</h1>
        <p style={styles.sub}>Platform health and pending work.</p>
      </div>

      {loading ? (
        <div style={styles.center}>Loading...</div>
      ) : (
        <>
          {(stats.pendingVerifications > 0 || stats.pendingPhotos > 0) && (
            <div style={styles.urgentBox}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 700, color: '#92400e', marginBottom: 8 }}>
                ⚠ Needs your attention
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {stats.pendingVerifications > 0 && (
                  <Link to="/admin/verifications" style={styles.urgentLink}>
                    ✓ {stats.pendingVerifications} pending verification{stats.pendingVerifications === 1 ? '' : 's'} →
                  </Link>
                )}
                {stats.pendingPhotos > 0 && (
                  <Link to="/admin/photos" style={styles.urgentLink}>
                    📷 {stats.pendingPhotos} pending photo{stats.pendingPhotos === 1 ? '' : 's'} →
                  </Link>
                )}
              </div>
            </div>
          )}

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Users ({stats.totalUsers})</h2>
            <div style={styles.grid}>
              <Stat label="Buyers / Renters" value={stats.buyers} color="#1a6cf5" />
              <Stat label="Agents" value={stats.agents} color="#ea580c" />
              <Stat label="Brokers" value={stats.brokers} color="#c2410c" />
              <Stat label="Landlords" value={stats.landlords} color="#7c3aed" />
              <Stat label="Property Managers" value={stats.managers} color="#9333ea" />
            </div>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Content</h2>
            <div style={styles.grid}>
              <Stat label="Total listings" value={stats.totalListings} color="#1a6cf5" />
              <Stat label="Rentcast synced" value={stats.rentcastListings} color="#16a34a" />
              <Stat label="Community added" value={stats.communityListings} color="#7c3aed" />
              <Stat label="Total comments" value={stats.totalComments} color="#0f172a" />
            </div>
          </section>
        </>
      )}
    </AdminLayout>
  )
}

function Stat({ label, value, color }) {
  return (
    <div style={styles.stat}>
      <div style={{ fontSize: 28, fontWeight: 800, color: color || '#0f172a', fontFamily: 'var(--serif)' }}>{value ?? 0}</div>
      <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginTop: 4 }}>{label}</div>
    </div>
  )
}

const styles = {
  head: { marginBottom: 22 },
  h1: { fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 700, color: '#0f172a' },
  sub: { fontSize: 14, color: '#64748b', marginTop: 2 },
  section: { marginBottom: 28 },
  sectionTitle: { fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 12 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: 12,
  },
  stat: {
    padding: 18,
    background: '#fff',
    borderRadius: 14,
    border: '1.5px solid #e2e8f0',
  },
  urgentBox: {
    padding: 18,
    background: '#fef3c7',
    border: '1px solid #fcd34d',
    borderRadius: 14,
    marginBottom: 24,
  },
  urgentLink: {
    display: 'inline-block',
    padding: '8px 14px',
    background: '#fff',
    border: '1.5px solid #fcd34d',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 700,
    color: '#92400e',
    textDecoration: 'none',
  },
  center: { padding: 40, textAlign: 'center', color: '#64748b' },
}
