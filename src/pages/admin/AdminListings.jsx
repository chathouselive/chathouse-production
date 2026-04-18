import { useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { useAdminListings } from '../../lib/useAdmin'
import { getListingImage } from '../../lib/streetView'

export default function AdminListings() {
  const [search, setSearch] = useState('')
  const [source, setSource] = useState('all')
  const { listings, loading, deleteListing, toggleActive } = useAdminListings({ source, search })
  const [deleting, setDeleting] = useState(null)

  async function confirmDelete() {
    if (!deleting) return
    await deleteListing(deleting.id)
    setDeleting(null)
  }

  return (
    <AdminLayout>
      <div style={styles.head}>
        <h1 style={styles.h1}>Listings</h1>
        <p style={styles.sub}>All listings on Chathouse. Hide or delete inappropriate entries.</p>
      </div>

      <div style={styles.filters}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search address..."
          style={styles.search}
        />
        <div style={styles.chipGroup}>
          {['all', 'rentcast', 'community'].map(s => (
            <button key={s} onClick={() => setSource(s)} style={{ ...styles.chip, ...(source === s ? styles.chipActive : {}) }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={styles.center}>Loading...</div>
      ) : listings.length === 0 ? (
        <div style={styles.empty}>No listings match.</div>
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
                  {!l.is_active && <span style={styles.hiddenTag}>HIDDEN</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => toggleActive(l.id, !l.is_active)} style={styles.hideBtn}>
                  {l.is_active ? 'Hide' : 'Unhide'}
                </button>
                <button onClick={() => setDeleting(l)} style={styles.deleteBtn}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleting && (
        <div style={modalStyles.overlay} onClick={() => setDeleting(null)}>
          <div style={modalStyles.modal} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Delete this listing?</h2>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16, lineHeight: 1.6 }}>
              <strong style={{ color: '#0f172a' }}>{deleting.address}</strong> will be permanently removed along with all its comments. This cannot be undone. Consider <em>hiding</em> instead.
            </p>
            <div style={modalStyles.actions}>
              <button onClick={() => setDeleting(null)} style={modalStyles.cancelBtn}>Cancel</button>
              <button onClick={confirmDelete} style={modalStyles.deleteBtn}>Delete permanently</button>
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
  center: { padding: 40, textAlign: 'center', color: '#64748b' },
  empty: { padding: 40, textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: 12, border: '1.5px solid #e2e8f0' },
  list: { display: 'flex', flexDirection: 'column', gap: 8 },
  row: {
    display: 'flex', alignItems: 'center', gap: 14,
    padding: 12, background: '#fff',
    borderRadius: 12, border: '1.5px solid #e2e8f0',
    flexWrap: 'wrap',
  },
  thumb: { width: 70, height: 50, objectFit: 'cover', borderRadius: 8, flexShrink: 0 },
  hiddenTag: { marginLeft: 8, padding: '1px 6px', background: '#fef3c7', color: '#92400e', borderRadius: 4, fontSize: 9, fontWeight: 700 },
  hideBtn: { padding: '7px 12px', background: '#f1f5f9', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#475569', cursor: 'pointer' },
  deleteBtn: { padding: '7px 12px', background: '#fef2f2', color: '#dc2626', border: '1.5px solid #fecaca', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
}

const modalStyles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 },
  modal: { background: '#fff', borderRadius: 16, padding: 28, maxWidth: 460, width: '100%' },
  actions: { display: 'flex', gap: 10, justifyContent: 'flex-end' },
  cancelBtn: { padding: '9px 16px', background: '#f1f5f9', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer' },
  deleteBtn: { padding: '9px 16px', background: '#dc2626', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer' },
}
