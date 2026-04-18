import { useAuth } from '../lib/AuthContext'

export default function Home() {
  const { profile, signOut } = useAuth()

  return (
    <div style={{ minHeight: '100vh', padding: 40, maxWidth: 880, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 28 }}>🏠</span>
          <span style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 24 }}>Chathouse</span>
        </div>
        <button onClick={signOut} style={{
          padding: '8px 16px',
          background: '#f1f5f9',
          border: 'none',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          color: '#475569',
        }}>Sign out</button>
      </header>

      <div style={{
        padding: 32,
        background: 'linear-gradient(135deg, #e8f0fe, #fff)',
        border: '1.5px solid rgba(26,108,245,0.2)',
        borderRadius: 20,
      }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 700, marginBottom: 12 }}>
          Welcome, {profile?.name?.split(' ')[0] || 'there'}! 👋
        </h1>
        <p style={{ color: '#64748b', lineHeight: 1.7, marginBottom: 20 }}>
          Your Chathouse account is live. You're signed in as a <strong style={{ color: '#0f172a' }}>{profile?.account_type}</strong>.
        </p>

        <div style={{ background: '#fff', padding: 20, borderRadius: 14, border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: '#0f172a' }}>Your profile:</h3>
          <pre style={{ fontSize: 12, color: '#475569', overflow: 'auto', fontFamily: 'monospace' }}>
            {JSON.stringify(profile, null, 2)}
          </pre>
        </div>

        <p style={{ marginTop: 20, fontSize: 13, color: '#64748b' }}>
          🚧 The full app is being built in waves. Listings, comments, messaging, and dashboards are coming next.
        </p>
      </div>
    </div>
  )
}
