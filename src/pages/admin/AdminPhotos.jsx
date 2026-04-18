import { useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { usePhotoQueue } from '../../lib/useAdmin'

export default function AdminPhotos() {
  const [tab, setTab] = useState('pending')
  const { items, loading, approve, reject } = usePhotoQueue(tab)
  const [rejecting, setRejecting] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  async function handleReject() {
    if (!rejecting) return
    await reject(rejecting.id, rejectReason)
    setRejecting(null)
    setRejectReason('')
  }

  return (
    <AdminLayout>
      <div style={styles.head}>
        <h1 style={styles.h1}>Photo Queue</h1>
        <p style={styles.sub}>Review user-submitted photos for listings. Approve to replace the current cover photo.</p>
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
          <div style={{ fontSize: 36, marginBottom: 8 }}>📷</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
            No {tab} photos
          </div>
        </div>
      ) : (
        <div style={styles.list}>
          {items.map(p => (
            <div key={p.id} style={styles.row}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <div style={styles.photoLabel}>Current</div>
                  {p.listing?.img_url ? (
                    <img src={p.listing.img_url} alt="current" style={styles.photo}/>
                  ) : <div style={{ ...styles.photo, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No current</div>}
                </div>
                <div>
                  <div style={{ ...styles.photoLabel, color: '#16a34a' }}>Submitted →</div>
                  <img src={p.photo_url} alt="submitted" style={styles.photo}/>
                </div>
              </div>
              <div style={styles.meta}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{p.listing?.address}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Submitted by {p.profile?.name}</div>
                </div>
                {tab === 'pending' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => approve(p)} style={styles.approveBtn}>Approve &amp; replace</button>
                    <button onClick={() => setRejecting(p)} style={styles.rejectBtn}>Reject</button>
                  </div>
                )}
              </div>
              {p.caption && <div style={{ marginTop: 10, fontSize: 13, color: '#475569', fontStyle: 'italic' }}>"{p.caption}"</div>}
            </div>
          ))}
        </div>
      )}

      {rejecting && (
        <div style={modalStyles.overlay} onClick={() => setRejecting(null)}>
          <div style={modalStyles.modal} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 700, marginBottom: 14 }}>Reject photo?</h2>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Reason (optional)..."
              rows={3}
              style={modalStyles.textarea}
            />
            <div style={modalStyles.actions}>
              <button onClick={() => setRejecting(null)} style={modalStyles.cancelBtn}>Cancel</button>
              <button onClick={handleReject} style={modalStyles.confirmBtn}>Reject photo</button>
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
  empty: { padding: 60, textAlign: 'center', background: '#fff', borderRadius: 16, border: '1.5px solid #e2e8f0' },
  list: { display: 'flex', flexDirection: 'column', gap: 14 },
  row: { padding: 18, background: '#fff', borderRadius: 14, border: '1.5px solid #e2e8f0' },
  photoLabel: { fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 6 },
  photo: { width: '100%', height: 180, objectFit: 'cover', borderRadius: 10, border: '1px solid #e2e8f0' },
  meta: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' },
  approveBtn: { padding: '9px 16px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' },
  rejectBtn: { padding: '9px 16px', background: '#fff', color: '#dc2626', border: '1.5px solid #fecaca', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' },
}

const modalStyles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 },
  modal: { background: '#fff', borderRadius: 16, padding: 28, maxWidth: 460, width: '100%' },
  textarea: { width: '100%', padding: 10, border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit', resize: 'vertical' },
  actions: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 14 },
  cancelBtn: { padding: '9px 16px', background: '#f1f5f9', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer' },
  confirmBtn: { padding: '9px 16px', background: '#dc2626', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer' },
}
