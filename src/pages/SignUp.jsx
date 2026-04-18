import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

const ACCOUNT_TYPES = [
  { value: 'buyer', label: '🏘️ Resident, Buyer or Renter', sub: 'Free forever. Search, comment, connect.' },
  { value: 'agent', label: '🤝 Real Estate Agent', sub: 'Professional tools. Free during beta.' },
  { value: 'broker', label: '🏦 Mortgage Broker', sub: 'Lead generation. Free during beta.' },
  { value: 'landlord', label: '🏡 Individual Landlord', sub: 'Always free. Claim and respond.' },
  { value: 'management', label: '🏢 Property Manager', sub: 'Portfolio tools. Free during beta.' },
]

export default function SignUp() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [accountType, setAccountType] = useState('buyer')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [city, setCity] = useState('New York, NY')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    setError('')
    setLoading(true)
    const { error } = await signUp({ email, password, name, accountType, city })
    setLoading(false)
    if (error) setError(error.message)
    else navigate('/')
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>🏠 <span style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 24 }}>Chathouse</span></div>

        {step === 1 && (
          <>
            <h1 style={styles.heading}>How will you use Chathouse?</h1>
            <p style={styles.sub}>Pick the account that fits. You can change this later.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ACCOUNT_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setAccountType(t.value)}
                  style={{
                    textAlign: 'left',
                    padding: '14px 16px',
                    background: accountType === t.value ? '#e8f0fe' : '#fff',
                    border: `1.5px solid ${accountType === t.value ? '#1a6cf5' : '#e2e8f0'}`,
                    borderRadius: 12,
                    cursor: 'pointer',
                    transition: 'all .15s',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 3 }}>{t.label}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{t.sub}</div>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)} style={{ ...styles.button, marginTop: 20 }}>Continue →</button>
          </>
        )}

        {step === 2 && (
          <>
            <h1 style={styles.heading}>Create your account</h1>
            <p style={styles.sub}>{ACCOUNT_TYPES.find(t => t.value === accountType)?.label}</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={styles.label}>Full name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required style={styles.input} placeholder="Jane Smith" />
              </div>
              <div>
                <label style={styles.label}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={styles.input} placeholder="you@email.com" />
              </div>
              <div>
                <label style={styles.label}>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={styles.input} placeholder="••••••••" />
              </div>
              <div>
                <label style={styles.label}>City</label>
                <select value={city} onChange={e => setCity(e.target.value)} style={{ ...styles.input, background: '#fff' }}>
                  <option>New York, NY</option>
                  <option>Brooklyn, NY</option>
                  <option>Austin, TX</option>
                  <option>Atlanta, GA</option>
                  <option>Other</option>
                </select>
              </div>

              {error && <div style={styles.error}>{error}</div>}

              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button type="button" onClick={() => setStep(1)} style={styles.buttonSecondary}>← Back</button>
                <button type="submit" disabled={loading} style={{ ...styles.button, flex: 1, opacity: loading ? 0.6 : 1 }}>
                  {loading ? 'Creating account...' : 'Create account →'}
                </button>
              </div>
            </form>
          </>
        )}

        <p style={styles.footer}>
          Already have an account? <Link to="/signin" style={{ fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    background: 'linear-gradient(135deg, #e8f0fe 0%, #fff 50%, #fff3e8 100%)',
  },
  card: {
    width: '100%',
    maxWidth: 480,
    background: '#fff',
    borderRadius: 20,
    padding: 36,
    boxShadow: '0 20px 60px rgba(26,108,245,0.12)',
    border: '1.5px solid #e2e8f0',
  },
  logo: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 },
  heading: { fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 700, marginBottom: 6, color: '#0f172a' },
  sub: { fontSize: 14, color: '#64748b', marginBottom: 22 },
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 },
  input: {
    width: '100%',
    padding: '12px 14px',
    border: '1.5px solid #e2e8f0',
    borderRadius: 10,
    fontSize: 14,
    color: '#0f172a',
    outline: 'none',
  },
  button: {
    width: '100%',
    padding: '13px 20px',
    background: '#1a6cf5',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
  },
  buttonSecondary: {
    padding: '13px 18px',
    background: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
  },
  error: {
    padding: '10px 14px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 8,
    color: '#dc2626',
    fontSize: 13,
  },
  footer: { fontSize: 13, color: '#64748b', textAlign: 'center', marginTop: 24 },
}
