import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

const ROLE_STYLES = {
  'Past Tenant (Verified)': { bg: '#dcfce7', color: '#166534', icon: '✓' },
  'Past Tenant': { bg: '#f0f9ff', color: '#0369a1', icon: '🏠' },
  'Current Tenant': { bg: '#fef3c7', color: '#92400e', icon: '🔑' },
  'Neighbor': { bg: '#ede9fe', color: '#6b21a8', icon: '👋' },
  'Buyer': { bg: '#e8f0fe', color: '#1a6cf5', icon: '🏘️' },
  'Renter': { bg: '#e8f0fe', color: '#1a6cf5', icon: '🔍' },
  'Local': { bg: '#f1f5f9', color: '#475569', icon: '📍' },
  'Agent': { bg: '#fff3e8', color: '#c2410c', icon: '🤝' },
  'Broker': { bg: '#fff3e8', color: '#c2410c', icon: '🏦' },
  'Landlord': { bg: '#f3e8ff', color: '#7e22ce', icon: '🏡' },
  'Property Manager': { bg: '#f3e8ff', color: '#7e22ce', icon: '🏢' },
}

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString()
}

export default function Comment({ comment, onLike }) {
  const { profile: currentUserProfile } = useAuth()
  const [deleting, setDeleting] = useState(false)

  const profile = comment.profile || {}
  const displayName = comment.is_anonymous ? 'Anonymous Tenant' : profile.name || 'User'
  const initial = (comment.is_anonymous ? 'A' : (profile.name?.[0] || '?')).toUpperCase()
  const roleStyle = ROLE_STYLES[comment.role_label] || ROLE_STYLES['Local']

  const canAdmin = currentUserProfile?.is_admin
  const clickable = !comment.is_anonymous && profile.id

  async function handleDelete() {
    if (!window.confirm('Delete this comment permanently?')) return
    setDeleting(true)
    const { error } = await supabase.from('comments').delete().eq('id', comment.id)
    if (error) {
      setDeleting(false)
      alert('Failed to delete: ' + error.message)
    }
  }

  if (comment.is_hidden) return null

  return (
    <div style={styles.comment}>
      {clickable ? (
        <Link to={`/profile/${profile.id}`} style={styles.avatarLink}>
          {profile.photo_url ? (
            <img src={profile.photo_url} alt={displayName} style={styles.avatarImg}/>
          ) : (
            <div style={styles.avatar}>{initial}</div>
          )}
        </Link>
      ) : (
        <div style={styles.avatar}>{initial}</div>
      )}
      <div style={styles.body}>
        <div style={styles.head}>
          {clickable ? (
            <Link to={`/profile/${profile.id}`} style={styles.nameLink}>{displayName}</Link>
          ) : (
            <span style={styles.name}>{displayName}</span>
          )}
          {comment.role_label && (
            <span style={{ ...styles.role, background: roleStyle.bg, color: roleStyle.color }}>
              {roleStyle.icon} {comment.role_label}
            </span>
          )}
          {profile.is_admin && <span style={styles.adminBadge}>ADMIN</span>}
          <span style={styles.time}>· {timeAgo(comment.created_at)}</span>
          {canAdmin && (
            <button onClick={handleDelete} disabled={deleting} style={styles.deleteBtn} title="Delete (admin)">
              🗑
            </button>
          )}
        </div>
        <p style={styles.text}>{comment.text}</p>
        <div style={styles.actions}>
          <button onClick={() => onLike(comment.id)} style={styles.likeBtn}>
            ❤️ {comment.likes_count || 0}
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  comment: { display: 'flex', gap: 12, padding: '16px 0', borderBottom: '1px solid #f1f5f9' },
  avatarLink: { textDecoration: 'none', flexShrink: 0 },
  avatar: {
    width: 40, height: 40, borderRadius: '50%',
    background: 'linear-gradient(135deg, #1a6cf5, #f97316)',
    color: '#fff', fontSize: 15, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarImg: { width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, display: 'block' },
  body: { flex: 1, minWidth: 0 },
  head: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 4 },
  name: { fontSize: 13, fontWeight: 700, color: '#0f172a' },
  nameLink: { fontSize: 13, fontWeight: 700, color: '#0f172a', textDecoration: 'none' },
  role: { fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 },
  adminBadge: { fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 4, background: '#0f172a', color: '#fff', letterSpacing: 0.5 },
  time: { fontSize: 11, color: '#94a3b8' },
  deleteBtn: {
    marginLeft: 'auto',
    background: 'transparent', border: 'none',
    fontSize: 12, padding: '2px 6px', cursor: 'pointer',
    color: '#94a3b8', borderRadius: 4,
  },
  text: { fontSize: 14, color: '#334155', lineHeight: 1.55, whiteSpace: 'pre-wrap' },
  actions: { marginTop: 8, display: 'flex', gap: 14 },
  likeBtn: {
    background: 'transparent', border: 'none', padding: 0,
    fontSize: 12, color: '#64748b', cursor: 'pointer', fontWeight: 500,
  },
}
