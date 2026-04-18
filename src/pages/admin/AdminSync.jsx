import { useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { triggerRentcastSync } from '../../lib/useAdmin'

const CITIES = [
  'Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Williamsburg',
  'Upper West Side', 'Harlem',
  'Jersey City', 'Hoboken', 'Newark', 'Weehawken', 'Hackensack',
]

export default function AdminSync() {
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  async function runSync(city = null) {
    setSyncing(true)
    setError('')
    setResult(null)
    const { data, error } = await triggerRentcastSync(city)
    setSyncing(false)
    if (error) setError(error)
    else setResult(data)
  }

  return (
    <AdminLayout>
      <div style={styles.head}>
        <h1 style={styles.h1}>Rentcast Sync</h1>
        <p style={styles.sub}>Pull fresh rental listings from Rentcast. 1 API request per city — be mindful of the 50/month free tier.</p>
      </div>

      <div style={styles.card}>
        <h2 style={styles.h2}>Sync all 12 priority cities</h2>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>
          This uses 12 API requests. Typically run weekly to refresh all launch areas.
        </p>
        <button onClick={() => runSync(null)} disabled={syncing} style={{ ...styles.syncBtn, opacity: syncing ? 0.5 : 1 }}>
          {syncing ? 'Syncing...' : '🔄 Sync all 12 cities'}
        </button>
      </div>

      <div style={styles.card}>
        <h2 style={styles.h2}>Sync a single city</h2>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>
          Uses 1 API request. Useful for testing or refreshing a specific area.
        </p>
        <div style={styles.cityGrid}>
          {CITIES.map(c => (
            <button key={c} onClick={() => runSync(c)} disabled={syncing} style={{ ...styles.cityBtn, opacity: syncing ? 0.5 : 1 }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={styles.error}>
          Error: {error}
        </div>
      )}

      {result && (
        <div style={styles.result}>
          <h3 style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Sync results</h3>
          <div style={styles.resultGrid}>
            <Stat label="Cities attempted" value={result.cities_attempted} />
            <Stat label="Successful" value={result.synced} color="#16a34a" />
            <Stat label="New listings" value={result.inserted} color="#1a6cf5" />
            <Stat label="Updated" value={result.updated} color="#7c3aed" />
          </div>
          {result.errors && result.errors.length > 0 && (
            <div style={{ marginTop: 14, padding: 12, background: '#fef2f2', borderRadius: 8, fontSize: 12, color: '#dc2626' }}>
              <strong>Errors ({result.errors.length}):</strong>
              <ul style={{ marginTop: 6, marginLeft: 20 }}>
                {result.errors.slice(0, 10).map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  )
}

function Stat({ label, value, color }) {
  return (
    <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, textAlign: 'center' }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: color || '#0f172a', fontFamily: 'var(--serif)' }}>{value ?? 0}</div>
      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginTop: 2 }}>{label}</div>
    </div>
  )
}

const styles = {
  head: { marginBottom: 20 },
  h1: { fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 700, color: '#0f172a' },
  sub: { fontSize: 14, color: '#64748b', marginTop: 2 },
  card: { padding: 22, background: '#fff', borderRadius: 14, border: '1.5px solid #e2e8f0', marginBottom: 14 },
  h2: { fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 6 },
  syncBtn: { padding: '11px 22px', background: '#1a6cf5', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  cityGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 },
  cityBtn: { padding: '10px 12px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#475569', cursor: 'pointer' },
  error: { padding: 14, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, color: '#dc2626', fontSize: 13 },
  result: { padding: 22, background: '#fff', borderRadius: 14, border: '1.5px solid #86efac' },
  resultGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8 },
}
