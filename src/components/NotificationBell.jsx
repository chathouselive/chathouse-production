import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

export default function NotificationBell() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropRef = useRef(null)

  const unreadCount = notifications.filter(n => !n.is_read).length

  useEffect(() => {
    if (!user) return
    fetchNotifications()

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, payload => {
        setNotifications(prev => [payload.new, ...prev])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user])

  useEffect(() => {
    function handleClick(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function fetchNotifications() {
    setLoading(true)
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
    setNotifications(data || [])
    setLoading(false)
  }

  async function markAllRead() {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  async function handleNotificationClick(notif) {
    // Mark as read
    await supabase.from('notifications').update({ is_read: true }).eq('id', notif.id)
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n))
    setOpen(false)
    if (notif.related_url) navigate(notif.related_url)
  }

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  function notifIcon(type) {
    switch (type) {
      case 'message': return '💬'
      case 'friend_request': return '👥'
      case 'link_request': return '🔗'
      case 'profile_update': return '📝'
      default: return '🔔'
    }
  }

  if (!user) return null

  return (
    <div style={{ position: 'relative' }} ref={dropRef}>
      <button
        onClick={() => { setOpen(o => !o); if (!open) fetchNotifications() }}
        style={styles.bellBtn}
      >
        🔔
        {unreadCount > 0 && (
          <span style={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div style={styles.dropdown}>
          <div style={styles.dropHeader}>
            <span style={styles.dropTitle}>Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={styles.markAllBtn}>Mark all read</button>
            )}
          </div>

          {loading ? (
            <div style={styles.center}>
              <div style={styles.spinner}/>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : notifications.length === 0 ? (
            <div style={styles.empty}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>No notifications yet</div>
            </div>
          ) : (
            <div style={styles.notifList}>
              {notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  style={{ ...styles.notifItem, background: n.is_read ? '#fff' : '#f0f7ff' }}
                >
                  <div style={styles.notifIcon}>{notifIcon(n.type)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: n.is_read ? 500 : 700, color: '#0f172a', marginBottom: 2 }}>
                      {n.title}
                    </div>
                    {n.body && (
                      <div style={{ fontSize: 12, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {n.body}
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{timeAgo(n.created_at)}</div>
                  </div>
                  {!n.is_read && <div style={styles.unreadDot}/>}
                </div>
              ))}
            </div>
          )}

          <div style={styles.dropFooter}>
            <Link to="/messages" onClick={() => setOpen(false)} style={styles.allMessagesLink}>
              Go to Messages →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  bellBtn: {
    position: 'relative', background: '#f1f5f9', border: 'none',
    borderRadius: 8, width: 36, height: 36, fontSize: 16,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    position: 'absolute', top: -4, right: -4,
    background: '#ef4444', color: '#fff',
    fontSize: 9, fontWeight: 800, padding: '1px 4px',
    borderRadius: 100, minWidth: 16, textAlign: 'center',
    border: '2px solid #fff',
  },
  dropdown: {
    position: 'absolute', right: 0, top: 44,
    width: 340, background: '#fff',
    borderRadius: 14, border: '1.5px solid #e2e8f0',
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    zIndex: 100, overflow: 'hidden',
  },
  dropHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 16px 10px', borderBottom: '1px solid #f1f5f9',
  },
  dropTitle: { fontSize: 14, fontWeight: 700, color: '#0f172a' },
  markAllBtn: {
    fontSize: 11, color: '#1a6cf5', background: 'none',
    border: 'none', cursor: 'pointer', fontWeight: 600,
  },
  notifList: { maxHeight: 360, overflowY: 'auto' },
  notifItem: {
    display: 'flex', alignItems: 'flex-start', gap: 10,
    padding: '12px 16px', cursor: 'pointer',
    borderBottom: '1px solid #f8fafc',
  },
  notifIcon: {
    width: 32, height: 32, borderRadius: '50%',
    background: '#f1f5f9', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontSize: 14, flexShrink: 0,
  },
  unreadDot: {
    width: 8, height: 8, borderRadius: '50%',
    background: '#1a6cf5', flexShrink: 0, marginTop: 4,
  },
  empty: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', padding: '32px 16px',
  },
  dropFooter: {
    padding: '10px 16px',
    borderTop: '1px solid #f1f5f9',
    textAlign: 'center',
  },
  allMessagesLink: {
    fontSize: 12, color: '#1a6cf5',
    fontWeight: 700, textDecoration: 'none',
  },
  center: { display: 'flex', justifyContent: 'center', padding: 20 },
  spinner: { width: 24, height: 24, borderRadius: '50%', border: '2px solid #e8f0fe', borderTop: '2px solid #1a6cf5', animation: 'spin 0.8s linear infinite' },
}
