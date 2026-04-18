import { useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { useVerificationsQueue } from '../../lib/useAdmin'

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function AdminVerifications() {
  const [tab, setTab] = useState('pending')
  const { items, loading, approve, reject, getDocumentUrl } = useVerificationsQueue(tab)
  const [rejecting, setRejecting] = useState(null) // the item being rejected
  const [rejectReason, setRejectReason] = useState('')

  async function handleViewDocument(path) {
    const url = await getDocumentUrl(path)
    if (url) window.open(url, '_blank')
    else alert('Could not load document')
  }

  async function handleReject() {
    if (!rejecting) return
    await reject(rejecting.id, rejectReason)
    setRejecting(null)
    setRejectReason('')
  }

  return (
    <AdminLayout>
      <div style={styles.head}>
        <h1 style={styles.h1}>Tenant Verifications</h1>
        <p style={styles.sub}>Review uploaded proof of residency. Approve to grant the user a ✓ badge on this listing.</p>
      </div>

      <div style={styles.tabs}>
        {['pending', 'approved', 'rejected'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}
          >
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={styles.center}>Loading...</div>
      ) : items.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>✓</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
            No {tab} verifications
          </div>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            {tab === 'pending' ? "You're all caught up!" : `No verifications have been ${tab}.`}
          </div>
        </div>
      ) : (
        <div style={styles.list}>
          {items.map(v => (
            <div key={v.id} style={styles.row}>
              <div style={styles.rowBody}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                  <div style={styles.avatar}>{v.profile?.name?.[0]?.toUpperCase() || '?'}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{v.profile?.name || 'Unknown'}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{v.profile?.email} · {v.profile?.account_type}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', fontSize: 12, color: '#94a3b8' }}>{timeAgo(v.created_at)}</div>
                </div>
                <div style={styles.listingBox}>
                  <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.3, fontWeight: 700, marginBottom: 4 }}>Verifying residency at</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{v.listing?.address || v.address}</div>
                  {v.listing && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{v.listing.city}{v.listing.state ? `, ${v.listing.state}` : ''} {v.listing.zip}</div>}
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 10, flexWrap: 'wrap' }}>
                  <div style={styles.docTypeTag}>📄 {v.document_type || 'Document'}</div>
                  <button onClick={() => handleViewDocument(v.document_url)} style={styles.viewBtn}>
                    View document ↗
                  </button>
                  {tab === 'rejected' && v.rejection_reason && (
                    <div style={{ fontSize: 12, color: '#dc2626', fontStyle: 'italic' }}>Reason: {v.rejection_reason}</div>
                  )}
                </div>
              </div>
              {tab === 'pending' && (
                <div style={styles.actions}>
                  <button onClick={() => approve(v.id)} style={styles.approveBtn}>Approve</button>
                  <button onClick={() => setRejecting(v)} style={styles.rejectBtn}>Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {rejecting && (
        <div style={modalStyles.overlay} onClick={() => setRejecting(null)}>
          <div style={modalStyles.modal} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Reject verification?</h2>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 14 }}>
              Let <strong>{rejecting.profile?.name}</strong> know why. They'll be able to try again with better proof.
            </p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Document is illegible. Utility bill didn't show your name. Dates don't match claim."
              rows={3}
              style={modalStyles.textarea}
            />
            <div style={modalStyles.actions}>
              <button onClick={() => setRejecting(null)} style={modalStyles.cancelBtn}>Cancel</button>
              <button onClick={handleReject} style={modalStyles.confirmBtn}>Reject verification</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

const styles = {
  head: { marginBottom: 20 },
  h1: { fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 700, color: '#0f172a' },
  sub: { fontSize: 14, color: '#64748b', marginTop: 2 },
  tabs: { display: 'flex', gap: 6, marginBottom: 16 },
  tab: {
    padding: '7px 14px', background: '#fff',
    border: '1.5px solid #e2e8f0', borderRadius: 100,
    fontSize: 13, fontWeight: 600, color: '#64748b', cursor: 'pointer',
    textTransform: 'capitalize',
  },
  tabActive: { background: '#1a6cf5', color: '#fff', borderColor: '#1a6cf5' },
  center: { padding: 40, textAlign: 'center', color: '#64748b' },
  empty: {
    padding: 60, textAlign: 'center',
    background: '#fff', borderRadius: 16, border: '1.5px solid #e2e8f0',
  },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  row: {
    padding: 18, background: '#fff',
    borderRadius: 14, border: '1.5px solid #e2e8f0',
    display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
  },
  rowBody: { flex: 1, minWidth: 260 },
  avatar: {
    width: 40, height: 40, borderRadius: '50%',
    background: 'linear-gradient(135deg, #1a6cf5, #f97316)',
    color: '#fff', fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  listingBox: { padding: 10, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' },
  docTypeTag: {
    padding: '4px 10px', background: '#e8f0fe', color: '#1a6cf5',
    borderRadius: 6, fontSize: 11, fontWeight: 700,
  },
  viewBtn: {
    padding: '6px 12px', background: '#fff', border: '1.5px solid #cbd5e1',
    borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#475569', cursor: 'pointer',
  },
  actions: { display: 'flex', gap: 8, alignSelf: 'flex-start' },
  approveBtn: {
    padding: '9px 18px', background: '#16a34a', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
  },
  rejectBtn: {
    padding: '9px 18px', background: '#fff', color: '#dc2626',
    border: '1.5px solid #fecaca', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
  },
}

const modalStyles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: 20,
  },
  modal: {
    background: '#fff', borderRadius: 16, padding: 28,
    maxWidth: 460, width: '100%',
  },
  textarea: {
    width: '100%', padding: 10, border: '1.5px solid #e2e8f0',
    borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit', resize: 'vertical',
  },
  actions: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 14 },
  cancelBtn: {
    padding: '9px 16px', background: '#f1f5f9', border: 'none', borderRadius: 8,
    fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer',
  },
  confirmBtn: {
    padding: '9px 16px', background: '#dc2626', border: 'none', borderRadius: 8,
    fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer',
  },
}
