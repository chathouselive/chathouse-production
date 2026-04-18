import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'

const ROLES_BY_ACCOUNT_TYPE = {
  buyer: ['Past Tenant', 'Current Tenant', 'Neighbor', 'Buyer', 'Renter', 'Local'],
  agent: ['Agent', 'Local'],
  broker: ['Broker', 'Local'],
  landlord: ['Landlord', 'Past Tenant', 'Neighbor', 'Local'],
  management: ['Property Manager', 'Local'],
}

const VERIFIABLE_ROLES = ['Past Tenant', 'Current Tenant']

export default function CommentForm({ onSubmit, verificationStatus, onOpenVerify }) {
  const { profile } = useAuth()
  const [text, setText] = useState('')
  const [role, setRole] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showGateModal, setShowGateModal] = useState(false)

  const availableRoles = ROLES_BY_ACCOUNT_TYPE[profile?.account_type] || ROLES_BY_ACCOUNT_TYPE.buyer
  const roleRequiresVerification = VERIFIABLE_ROLES.includes(role)
  const isVerified = verificationStatus === 'approved'
  const isBlocked = roleRequiresVerification && !isVerified

  function handleRoleChange(newRole) {
    setRole(newRole)
    // If they pick a verifiable role and they're not approved, show the gate modal
    if (VERIFIABLE_ROLES.includes(newRole) && verificationStatus !== 'approved') {
      setShowGateModal(true)
    }
  }

  function handleGateCancel() {
    setShowGateModal(false)
    setRole('') // reset role picker
  }

  function handleGateVerify() {
    setShowGateModal(false)
    onOpenVerify()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    if (!role) return setError('Please select your role for this comment.')
    if (isBlocked) {
      setError(null)
      setShowGateModal(true)
      return
    }
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
    <>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.head}>
          <span style={styles.headLabel}>Post as:</span>
          <select value={role} onChange={e => handleRoleChange(e.target.value)} style={styles.select}>
            <option value="">Choose your role...</option>
            {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {roleRequiresVerification && verificationStatus === 'pending' && (
          <div style={styles.pendingBanner}>
            ⏳ Your verification is under admin review. You can post as <strong>Neighbor</strong> or <strong>Local</strong> while you wait, or choose a different role.
          </div>
        )}

        {roleRequiresVerification && isVerified && (
          <div style={styles.approvedBanner}>
            ✓ You're a Verified {role} at this listing. Your comment will show the ✓ badge.
          </div>
        )}

        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={isBlocked ? 'Verify your tenancy above to post as ' + role + '...' : 'Share what you know about this property — the good, the bad, and the honest...'}
          rows={3}
          disabled={isBlocked}
          style={{ ...styles.textarea, opacity: isBlocked ? 0.5 : 1, cursor: isBlocked ? 'not-allowed' : 'text' }}
        />

        {canBeAnonymous && !isBlocked && (
          <label style={styles.anonLabel}>
            <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} />
            <span>Post anonymously <span style={{ color: '#94a3b8' }}>(your identity is hidden but your role {isVerified ? 'and ✓ badge ' : ''}is shown)</span></span>
          </label>
        )}

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.actions}>
          <span style={styles.hint}>
            {text.length > 0 && `${text.length} chars`}
          </span>
          <button
            type="submit"
            disabled={submitting || !text.trim() || !role || isBlocked}
            style={{ ...styles.btn, opacity: submitting || !text.trim() || !role || isBlocked ? 0.5 : 1 }}
          >
            {submitting ? 'Posting...' : isBlocked ? '🔒 Verification required' : 'Post comment'}
          </button>
        </div>
      </form>

      {showGateModal && (
        <div style={gateStyles.overlay} onClick={handleGateCancel}>
          <div style={gateStyles.modal} onClick={e => e.stopPropagation()}>
            <div style={gateStyles.icon}>🔒</div>
            <h2 style={gateStyles.title}>
              Verification required
            </h2>
            <p style={gateStyles.body}>
              To post as <strong>{role}</strong>, you need to verify you {role === 'Current Tenant' ? 'currently live' : 'lived'} at this address. This keeps Chathouse trustworthy for everyone.
            </p>
            <div style={gateStyles.reasons}>
              <div style={gateStyles.reason}>✓ Upload a lease, utility bill, or piece of mail with your name</div>
              <div style={gateStyles.reason}>✓ Reviewed by a human within 24 hours</div>
              <div style={gateStyles.reason}>✓ Documents stay private — never shown publicly</div>
              <div style={gateStyles.reason}>✓ You can still post anonymously once verified</div>
            </div>
            {verificationStatus === 'pending' && (
              <div style={gateStyles.pending}>
                ⏳ You already submitted verification — it's pending admin review. You'll be able to post once approved.
              </div>
            )}
            {verificationStatus === 'rejected' && (
              <div style={gateStyles.rejected}>
                Your previous verification was not approved. You can submit new proof below.
              </div>
            )}
            <div style={gateStyles.actions}>
              <button onClick={handleGateCancel} style={gateStyles.cancelBtn}>Pick a different role</button>
              {verificationStatus !== 'pending' && (
                <button onClick={handleGateVerify} style={gateStyles.verifyBtn}>
                  Verify now →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const styles = {
  form: { padding: 16, background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 12, marginBottom: 20 },
  head: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  headLabel: { fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.3 },
  select: {
    padding: '7px 10px', border: '1.5px solid #e2e8f0', borderRadius: 8,
    fontSize: 13, background: '#fff', color: '#0f172a', outline: 'none', fontWeight: 600,
  },
  pendingBanner: {
    padding: 10, background: '#fef3c7', border: '1px solid #fcd34d',
    borderRadius: 8, fontSize: 12, color: '#92400e', marginBottom: 12,
  },
  approvedBanner: {
    padding: 10, background: '#dcfce7', border: '1px solid #86efac',
    borderRadius: 8, fontSize: 12, color: '#166534', fontWeight: 600, marginBottom: 12,
  },
  textarea: {
    width: '100%', padding: 12, border: '1.5px solid #e2e8f0', borderRadius: 10,
    fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit',
    background: '#fff', color: '#0f172a', lineHeight: 1.5,
  },
  anonLabel: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748b', marginTop: 10, cursor: 'pointer' },
  error: { marginTop: 10, padding: 10, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', fontSize: 12 },
  actions: { marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  hint: { fontSize: 12, color: '#94a3b8' },
  btn: {
    padding: '9px 18px', background: '#1a6cf5', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
}

const gateStyles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: 20,
  },
  modal: {
    background: '#fff', borderRadius: 20, padding: 32,
    maxWidth: 460, width: '100%',
    boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
    textAlign: 'center',
  },
  icon: {
    fontSize: 36, marginBottom: 12,
  },
  title: { fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 10 },
  body: { fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 18 },
  reasons: {
    background: '#f8fafc', padding: 16, borderRadius: 12,
    textAlign: 'left', marginBottom: 18,
    border: '1px solid #e2e8f0',
  },
  reason: { fontSize: 13, color: '#475569', lineHeight: 1.8 },
  pending: {
    padding: 12, background: '#fef3c7', border: '1px solid #fcd34d',
    borderRadius: 8, fontSize: 12, color: '#92400e', marginBottom: 16,
  },
  rejected: {
    padding: 12, background: '#fef2f2', border: '1px solid #fecaca',
    borderRadius: 8, fontSize: 12, color: '#dc2626', marginBottom: 16,
  },
  actions: {
    display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap',
  },
  cancelBtn: {
    padding: '11px 18px', background: '#f1f5f9', color: '#475569',
    border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  verifyBtn: {
    padding: '11px 22px', background: '#16a34a', color: '#fff',
    border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
  },
}
