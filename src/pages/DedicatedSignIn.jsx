import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import Footer from '../components/Footer'

function ChathouseLogo({ height = 40 }) {
  return (
    <svg height={height} viewBox="0 0 480 140" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
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

export default function DedicatedSignIn() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn({ email, password })
    setLoading(false)
    if (error) setError(error.message)
    else navigate('/listings')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <header style={styles.topbar}>
        <div style={styles.topbarInner}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <ChathouseLogo height={40} />
          </Link>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#64748b' }}>No account?</span>
            <Link to="/signup" style={styles.signUpBtn}>Sign up free →</Link>
          </div>
        </div>
      </header>

      {/* Form */}
      <div style={styles.body}>
        <div style={styles.card}>
          <h1 style={styles.heading}>Welcome back</h1>
          <p style={styles.sub}>Sign in to access your Chathouse account.</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                style={styles.input}
              />
            </div>
            <div>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={styles.input}
              />
            </div>
            {error && <div style={styles.error}>{error}</div>}
            <button
              type="submit"
              disabled={loading}
              style={{ ...styles.button, opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>

          <div style={styles.divider}>
            <span style={styles.dividerText}>or</span>
          </div>

          <p style={styles.signupPrompt}>
            Don't have an account?{' '}
            <Link to="/signup" style={styles.link}>Sign up free</Link>
            {' '}— it takes 30 seconds.
          </p>

          <p style={styles.backLink}>
            <Link to="/" style={styles.link}>← Back to home</Link>
          </p>
        </div>

        {/* Trust note */}
        <div style={styles.trustNote}>
          <span style={styles.trustIcon}>🔒</span>
          <span style={styles.trustText}>Free for buyers, renters, and neighbors · Always will be</span>
        </div>
      </div>

      <Footer />
    </div>
  )
}

const styles = {
  topbar: {
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky', top: 0, zIndex: 40,
  },
  topbarInner: {
    maxWidth: 1100, margin: '0 auto',
    padding: '14px 20px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  signUpBtn: {
    padding: '8px 16px', background: '#1a6cf5', color: '#fff',
    borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none',
  },
  body: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
  },
  card: {
    width: '100%',
    maxWidth: 440,
    background: '#fff',
    borderRadius: 20,
    padding: '40px 36px',
    border: '1.5px solid #e2e8f0',
    boxShadow: '0 8px 32px rgba(26,108,245,0.08)',
    marginBottom: 20,
  },
  heading: {
    fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 700,
    color: '#0f172a', marginBottom: 6,
  },
  sub: { fontSize: 14, color: '#64748b', marginBottom: 28 },
  label: {
    display: 'block', fontSize: 12, fontWeight: 600,
    color: '#64748b', marginBottom: 6,
  },
  input: {
    width: '100%', padding: '12px 14px',
    border: '1.5px solid #e2e8f0', borderRadius: 10,
    fontSize: 14, color: '#0f172a', outline: 'none',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%', padding: '13px',
    background: '#1a6cf5', color: '#fff',
    border: 'none', borderRadius: 10,
    fontSize: 15, fontWeight: 700, cursor: 'pointer',
    marginTop: 4,
  },
  error: {
    padding: '10px 14px', background: '#fef2f2',
    border: '1px solid #fecaca', borderRadius: 8,
    color: '#dc2626', fontSize: 13,
  },
  divider: {
    display: 'flex', alignItems: 'center',
    margin: '24px 0 20px',
    gap: 12,
  },
  dividerText: {
    fontSize: 12, color: '#94a3b8', fontWeight: 500,
    background: '#fff', padding: '0 8px',
  },
  signupPrompt: {
    fontSize: 14, color: '#475569',
    textAlign: 'center', lineHeight: 1.6,
    marginBottom: 12,
  },
  backLink: {
    textAlign: 'center', fontSize: 13, color: '#94a3b8',
  },
  link: { color: '#1a6cf5', textDecoration: 'none', fontWeight: 600 },
  trustNote: {
    display: 'flex', alignItems: 'center', gap: 8,
    fontSize: 12, color: '#94a3b8',
  },
  trustIcon: { fontSize: 14 },
  trustText: {},
}
