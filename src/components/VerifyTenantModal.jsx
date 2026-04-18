import { useState } from 'react'

export default function VerifyTenantModal({ listing, role, onClose, onSubmit }) {
  const [file, setFile] = useState(null)
  const [documentType, setDocumentType] = useState('lease')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const isCurrent = role === 'Current Tenant'
  const address = `${listing.address}, ${listing.city} ${listing.state || ''} ${listing.zip || ''}`.trim()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!file) return setError('Please upload a document.')
    if (file.size > 10 * 1024 * 1024) return setError('File must be under 10MB.')
    setError('')
    setSubmitting(true)
    const { error } = await onSubmit({ file, documentType, address })
    setSubmitting(false)
    if (error) setError(error)
    else onClose()
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={styles.close}>✕</button>

        <div style={styles.header}>
          <div style={styles.icon}>✓</div>
          <h2 style={styles.title}>Get your Verified Tenant badge</h2>
          <p style={styles.sub}>
            Upload proof that you {isCurrent ? 'currently live' : 'lived'} at this address.
            Reviewed by a human within 24 hours. Your document is private and never shown publicly.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.listingBox}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 }}>Verifying</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{listing.address}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{listing.city}{listing.state ? `, ${listing.state}` : ''} {listing.zip}</div>
          </div>

          <label style={styles.label}>Document type</label>
          <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} style={styles.select}>
            <option value="lease">Lease agreement</option>
            <option value="utility">Utility bill (with my name + this address)</option>
            <option value="mail">Piece of mail (with my name + this address)</option>
            <option value="other">Other proof of residency</option>
          </select>

          <label style={styles.label}>Upload document</label>
          <div style={styles.fileWrap}>
            <input
              id="verifyFile"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.heic"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ display: 'none' }}
            />
            <label htmlFor="verifyFile" style={styles.fileBtn}>
              {file ? '📎 ' + file.name : '+ Choose file (PDF, JPG, PNG)'}
            </label>
          </div>

          <div style={styles.privacy}>
            🔒 <strong>Your privacy is protected.</strong> Documents are stored encrypted,
            reviewed only by Chathouse admins, and never shown publicly. You can post
            anonymously and keep your verified badge.
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.actions}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>Cancel</button>
            <button type="submit" disabled={submitting || !file} style={{ ...styles.submitBtn, opacity: submitting || !file ? 0.5 : 1 }}>
              {submitting ? 'Uploading...' : 'Submit for review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: 20,
  },
  modal: {
    background: '#fff', borderRadius: 20, padding: 32,
    maxWidth: 500, width: '100%', position: 'relative',
    maxHeight: '90vh', overflowY: 'auto',
    boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
  },
  close: {
    position: 'absolute', top: 16, right: 16,
    background: 'transparent', border: 'none',
    width: 32, height: 32, borderRadius: '50%',
    fontSize: 18, color: '#64748b', cursor: 'pointer',
  },
  header: { textAlign: 'center', marginBottom: 24 },
  icon: {
    width: 56, height: 56, borderRadius: '50%',
    background: '#dcfce7', color: '#166534',
    fontSize: 28, fontWeight: 900,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 14px',
  },
  title: { fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 8 },
  sub: { fontSize: 13, color: '#64748b', lineHeight: 1.6 },
  listingBox: { padding: 14, background: '#f8fafc', borderRadius: 10, marginBottom: 18, border: '1px solid #e2e8f0' },
  label: { display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 6, marginTop: 14 },
  select: {
    width: '100%', padding: '10px 12px',
    border: '1.5px solid #e2e8f0', borderRadius: 10,
    fontSize: 14, background: '#fff', color: '#0f172a', outline: 'none',
  },
  fileWrap: { marginTop: 2 },
  fileBtn: {
    display: 'block', padding: '20px 14px',
    border: '2px dashed #cbd5e1', borderRadius: 10,
    fontSize: 13, color: '#64748b', cursor: 'pointer',
    textAlign: 'center', fontWeight: 600,
  },
  privacy: {
    marginTop: 16, padding: 12, background: '#e8f0fe',
    borderRadius: 8, fontSize: 12, color: '#1e40af', lineHeight: 1.5,
  },
  error: { marginTop: 12, padding: 10, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', fontSize: 13 },
  actions: { marginTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end' },
  cancelBtn: {
    padding: '10px 18px', background: '#f1f5f9',
    border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600,
    color: '#475569', cursor: 'pointer',
  },
  submitBtn: {
    padding: '10px 20px', background: '#1a6cf5',
    border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700,
    color: '#fff', cursor: 'pointer',
  },
}
