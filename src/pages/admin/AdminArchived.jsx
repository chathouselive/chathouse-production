import { useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { useArchivedListings } from '../../lib/useAdmin'
import { getListingImage } from '../../lib/streetView'

export default function AdminArchived() {
  const [search, setSearch] = useState('')
  const [source, setSource] = useState('all')
  const { listings, loading, restoreListing, permanentlyDeleteListing } =
    useArchivedListings({ source, search })
  const [restoring, setRestoring] = useState(null) // listing being restored (no confirm needed)
  const [deleting, setDeleting] = useState(null) // listing pending permanent delete (drives modal)
  const [actionError, setActionError] = useState(null)

  async function handleRestore(listing) {
    setActionError(null)
    setRestoring(listing.id) // disables button on this row while pending
    const result = await restoreListing(listing.id)
    setRestoring(null)
    if (!result.ok) {
      setActionError(`Couldn't restore: ${result.error}`)
    }
  }

  async function confirmPermanentDelete() {
    if (!deleting) return
    setActionError(null)
    const result = await permanentlyDeleteListing(deleting.id)
    if (!result.ok) {
      setActionError(`Couldn't delete: ${result.error}`)
      return // keep modal open so user sees the error
    }
    setDeleting(null)
  }

  return (
    <AdminLayout>
      <div style={styles.head}>
        <h1 style={styles.h1}>Archived Listings</h1>
        <p style={styles.sub}>
          Listings removed from the main view but preserved in the database.{' '}
          <Link to="/admin/listings" style={styles.backLink}>← Back to all listings</Link>
        </p>
      </div>

      <div style={styles.filters}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search address..."
          style={styles.search}
        />
        <div style={styles.chipGroup}>
          {['all', 'idx', 'community', 'rentcast'].map(s => (
            <button key={s} onClick={() => setSource(s)} style={{ ...styles.chip, ...(source === s ? styles.chipActive : {}) }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {actionError && (
        <div style={styles.errorBanner}>
          {actionError}
          <button onClick={() => setActionError(null)} style={styles.errorDismiss}>Dismiss</button>
        </div>
      )}

      {loading ? (
        <div style={styles.center}>Loading...</div>
      ) : listings.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyTitle}>No archived listings</div>
          <div style={styles.emptyBody}>When you archive a listing from the main view, it will appear here.</div>
        </div>
      ) : (
        <div style={styles.list}>
          {listings.map(l => (
            <div key={l.id} style={styles.row}>
              <img src={getListingImage(l)} alt={l.address} style={styles.thumb} />
              <div style={{ flex: 1, minWidth: 200 }}>
                <Link to={`/listing/${l.id}`} target="_blank" style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', textDecoration: 'none' }}>
                  {l.address}
                </Link>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  {l.city}{l.state ? `, ${l.state}` : ''} {l.zip} · {l.source}
                  <span style={styles.archivedTag}>ARCHIVED</span>
                </div>
                {l.archived_at && (
                  <div style={styles.archivedDate}>
                    Archived {new Date(l.archived_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button
                  onClick={() => handleRestore(l)}
                  disabled={restoring === l.id}
                  style={{ ...styles.restoreBtn, opacity: restoring === l.id ? 0.6 : 1 }}
                >
                  {restoring === l.id ? 'Restoring...' : 'Restore'}
                </button>
                <button onClick={() => setDeleting(l)} style={styles.deleteBtn}>
                  Permanently delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleting && (
        <div style={modalStyles.overlay} onClick={() => { setDeleting(null); setActionError(null) }}>
          <div style={modalStyles.modal} onClick={e => e.stopPropagation()}>
            <h2 style={modalStyles.title}>Permanently delete this listing?</h2>
            <p style={modalStyles.body}>
              <strong style={{ color: '#0f172a' }}>{deleting.address}</strong> will be removed from the database completely. This cannot be undone.
            </p>
            <div style={modalStyles.warningBox}>
              <strong style={modalStyles.warningTitle}>This will also delete:</strong>
              <ul style={modalStyles.warningList}>
                <li>All comments on this listing</li>
                <li>All likes, claims, and photo submissions</li>
                <li>Any AI risk reports generated for it</li>
                <li>Tenant verifications tied to this listing</li>
              </ul>
              <span style={modalStyles.warningFootnote}>
                Messages that shared this listing will be preserved (the share link will become inactive).
              </span>
            </div>
            {actionError && (
              <div style={modalStyles.modalError}>{actionError}</div>
            )}
            <div style={modalStyles.actions}>
              <button onClick={() => { setDeleting(null); setActionError(null) }} style={modalStyles.cancelBtn}>Cancel</button>
              <button onClick={confirmPermanentDelete} style={modalStyles.deleteBtn}>Permanently delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

const styles = {
  head: { marginBottom: 16 },
  h1: { fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 700, color: '#0f172a' },
  sub: { fontSize: 14, color: '#64748b', marginTop: 2 },
  backLink: { color: '#1a6cf5', textDecoration: 'none', fontWeight: 600 },
  filters: { display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' },
  search: {
    flex: 1, minWidth: 200, padding: '10px 14px',
    border: '1.5px solid #e2e8f0', borderRadius: 10,
    fontSize: 13, outline: 'none', background: '#fff', color: '#0f172a',
  },
  chipGroup: { display: 'flex', gap: 6 },
  chip: {
    padding: '7px 14px', border: '1.5px solid #e2e8f0', borderRadius: 100,
    background: '#fff', fontSize: 12, fontWeight: 600, color: '#64748b',
    cursor: 'pointer', textTransform: 'capitalize',
  },
  chipActive: { background: '#1a6cf5', color: '#fff', borderColor: '#1a6cf5' },
  errorBanner: {
    padding: '10px 14px', background: '#fef2f2', color: '#991b1b',
    border: '1px solid #fecaca', borderRadius: 10,
    fontSize: 13, marginBottom: 12,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
  },
  errorDismiss: {
    background: 'transparent', border: 'none', color: '#991b1b',
    fontWeight: 700, cursor: 'pointer', fontSize: 12,
  },
  center: { padding: 40, textAlign: 'center', color: '#64748b' },
  empty: {
    padding: '50px 20px', textAlign: 'center',
    background: '#fff', borderRadius: 12, border: '1.5px solid #e2e8f0',
  },
  emptyTitle: { fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 6 },
  emptyBody: { color: '#64748b', fontSize: 13 },
  list: { display: 'flex', flexDirection: 'column', gap: 8 },
  row: {
    display: 'flex', alignItems: 'center', gap: 14,
    padding: 12, background: '#fff',
    borderRadius: 12, border: '1.5px solid #e2e8f0',
    flexWrap: 'wrap',
  },
  thumb: { width: 70, height: 50, objectFit: 'cover', borderRadius: 8, flexShrink: 0, opacity: 0.7 },
  archivedTag: {
    marginLeft: 8, padding: '1px 6px',
    background: '#fef3c7', color: '#92400e',
    borderRadius: 4, fontSize: 9, fontWeight: 700, letterSpacing: 0.4,
  },
  archivedDate: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
  restoreBtn: {
    padding: '7px 12px', background: '#ecfdf5', color: '#047857',
    border: '1.5px solid #a7f3d0', borderRadius: 8,
    fontSize: 12, fontWeight: 600, cursor: 'pointer',
  },
  deleteBtn: {
    padding: '7px 12px', background: '#fef2f2', color: '#dc2626',
    border: '1.5px solid #fecaca', borderRadius: 8,
    fontSize: 12, fontWeight: 600, cursor: 'pointer',
  },
}

const modalStyles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(15,23,42,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: 20,
  },
  modal: { background: '#fff', borderRadius: 16, padding: 28, maxWidth: 500, width: '100%' },
  title: { fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 700, marginBottom: 10, color: '#0f172a' },
  body: { fontSize: 13, color: '#64748b', marginBottom: 14, lineHeight: 1.6 },
  warningBox: {
    padding: '12px 14px', marginBottom: 14,
    background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8,
  },
  warningTitle: { color: '#991b1b', fontSize: 12, display: 'block', marginBottom: 6 },
  warningList: { margin: '4px 0 8px 18px', padding: 0, color: '#991b1b', fontSize: 12, lineHeight: 1.6 },
  warningFootnote: { fontSize: 11, color: '#7f1d1d', fontStyle: 'italic' },
  modalError: {
    padding: '10px 12px', marginBottom: 12,
    background: '#fef2f2', color: '#991b1b',
    border: '1px solid #fecaca', borderRadius: 8,
    fontSize: 12,
  },
  actions: { display: 'flex', gap: 10, justifyContent: 'flex-end' },
  cancelBtn: {
    padding: '9px 16px', background: '#f1f5f9',
    border: 'none', borderRadius: 8,
    fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer',
  },
  deleteBtn: {
    padding: '9px 16px', background: '#dc2626',
    border: 'none', borderRadius: 8,
    fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer',
  },
}