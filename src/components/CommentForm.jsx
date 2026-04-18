import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'

const ROLES_BY_ACCOUNT_TYPE = {
  buyer: ['Past Tenant', 'Current Tenant', 'Neighbor', 'Buyer', 'Renter', 'Local'],
  agent: ['Agent', 'Local'],
  broker: ['Broker', 'Local'],
  landlord: ['Landlord', 'Past Tenant', 'Neighbor', 'Local'],
  management: ['Property Manager', 'Local'],
}

export default function CommentForm({ onSubmit }) {
  const { profile } = useAuth()
  const [text, setText] = useState('')
  const [role, setRole] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const availableRoles = ROLES_BY_ACCOUNT_TYPE[profile?.account_type] || ROLES_BY_ACCOUNT_TYPE.buyer

  async function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    if (!role) return setError('Please select your role for this comment.')
    setError('')
    setSubmitting(true)
    const { error } = await onSubmit({ text: text.trim(), roleLabel: role, isAnonymous })
    setSubmitting(false)
    if (error) setError(error.message || 'Failed to post comment')
    else {
      setText('')
      setRole('')
      setIsAnonymous(false)
    }
  }

  const canBeAnonymous = ['Past Tenant', 'Current Tenant', 'Neighbor'].includes(role)

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.head}>
        <span style={styles.headLabel}>Post as:</span>
        <select value={role} onChange={e => setRole(e.target.value)} style={styles.select}>
          <option value="">Choose your role...</option>
          {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Share what you know about this property — the good, the bad, and the honest..."
        rows={3}
        style={styles.textarea}
      />

      {canBeAnonymous && (
        <label style={styles.anonLabel}>
          <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} />
          <span>Post anonymously <span style={{ color: '#94a3b8' }}>(your identity is hidden but your role is shown)</span></span>
        </label>
      )}

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.actions}>
        <span style={styles.hint}>
          {text.length > 0 && `${text.length} chars`}
        </span>
        <button type="submit" disabled={submitting || !text.trim() || !role} style={{ ...styles.btn, opacity: submitting || !text.trim() || !role ? 0.5 : 1 }}>
          {submitting ? 'Posting...' : 'Post comment'}
        </button>
      </div>
    </form>
  )
}

const styles = {
  form: {
    padding: 16,
    background: '#f8fafc',
    border: '1.5px solid #e2e8f0',
    borderRadius: 12,
    marginBottom: 20,
  },
  head: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  headLabel: { fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.3 },
  select: {
    padding: '7px 10px',
    border: '1.5px solid #e2e8f0',
    borderRadius: 8,
    fontSize: 13,
    background: '#fff',
    color: '#0f172a',
    outline: 'none',
    fontWeight: 600,
  },
  textarea: {
    width: '100%',
    padding: 12,
    border: '1.5px solid #e2e8f0',
    borderRadius: 10,
    fontSize: 14,
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
    background: '#fff',
    color: '#0f172a',
    lineHeight: 1.5,
  },
  anonLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
    color: '#64748b',
    marginTop: 10,
    cursor: 'pointer',
  },
  error: { marginTop: 10, padding: 10, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', fontSize: 12 },
  actions: { marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  hint: { fontSize: 12, color: '#94a3b8' },
  btn: {
    padding: '9px 18px',
    background: '#1a6cf5',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
}
