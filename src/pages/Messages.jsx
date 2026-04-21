import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import TopNav from '../components/TopNav'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

export default function Messages() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initUserId = searchParams.get('user')

  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!user) { navigate('/signin'); return }
    fetchConversations()
  }, [user])

  useEffect(() => {
    if (!initUserId || !user) return
    handleInitConversation()
  }, [initUserId, user])

  async function handleInitConversation() {
    // Check if conversation already exists
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .or(`and(user1_id.eq.${user.id},user2_id.eq.${initUserId}),and(user1_id.eq.${initUserId},user2_id.eq.${user.id})`)
      .single()

    if (existing) {
      // Fetch other user profile
      const otherId = existing.user1_id === user.id ? existing.user2_id : existing.user1_id
      const { data: otherProfile } = await supabase
        .from('profiles')
        .select('id, name, photo_url, account_type')
        .eq('id', otherId)
        .single()
      setActiveConv({ ...existing, other_user: otherProfile || { id: otherId } })
      fetchConversations()
      return
    }

    // Create new conversation
    const { data: newConv } = await supabase
      .from('conversations')
      .insert({ user1_id: user.id, user2_id: initUserId })
      .select()
      .single()

    if (newConv) {
      const { data: otherProfile } = await supabase
        .from('profiles')
        .select('id, name, photo_url, account_type')
        .eq('id', initUserId)
        .single()
      setActiveConv({ ...newConv, other_user: otherProfile || { id: initUserId } })
      fetchConversations()
    }
  }

  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv.id)
      markConversationRead(activeConv.id)
    }
  }, [activeConv])

  useEffect(() => {
    if (!activeConv) return
    const channel = supabase
      .channel(`messages:${activeConv.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${activeConv.id}`,
      }, payload => {
        setMessages(prev => [...prev, payload.new])
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [activeConv])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function fetchConversations() {
    setLoading(true)
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false, nullsFirst: false })

    if (!data || data.length === 0) { setConversations([]); setLoading(false); return }

    const otherUserIds = data.map(c => c.user1_id === user.id ? c.user2_id : c.user1_id)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, photo_url, account_type')
      .in('id', otherUserIds)

    const profileMap = {}
    profiles?.forEach(p => { profileMap[p.id] = p })

    // Get unread counts
    const convIds = data.map(c => c.id)
    const { data: unreadData } = await supabase
      .from('messages')
      .select('conversation_id')
      .in('conversation_id', convIds)
      .eq('is_read', false)
      .neq('sender_id', user.id)

    const unreadMap = {}
    unreadData?.forEach(m => {
      unreadMap[m.conversation_id] = (unreadMap[m.conversation_id] || 0) + 1
    })

    // Get last message per conversation
    const { data: lastMessages } = await supabase
      .from('messages')
      .select('conversation_id, text, sender_id, created_at')
      .in('conversation_id', convIds)
      .order('created_at', { ascending: false })

    const lastMsgMap = {}
    lastMessages?.forEach(m => {
      if (!lastMsgMap[m.conversation_id]) lastMsgMap[m.conversation_id] = m
    })

    const enriched = data.map(c => {
      const otherId = c.user1_id === user.id ? c.user2_id : c.user1_id
      return {
        ...c,
        other_user: profileMap[otherId] || { id: otherId, name: 'Unknown' },
        unread: unreadMap[c.id] || 0,
        last_message: lastMsgMap[c.id] || null,
      }
    })

    setConversations(enriched)
    setLoading(false)
  }

  async function openOrCreateConversation(otherUserId) {
    // Check if conversation already exists
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .or(`and(user1_id.eq.${user.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user.id})`)
      .single()

    if (existing) {
      await fetchConversations()
      return existing
    }

    // Create new conversation
    const { data: newConv } = await supabase
      .from('conversations')
      .insert({ user1_id: user.id, user2_id: otherUserId })
      .select()
      .single()

    await fetchConversations()
    return newConv
  }

  async function fetchMessages(convId) {
    setMessagesLoading(true)
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })
    setMessages(data || [])
    setMessagesLoading(false)
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'instant' }), 50)
  }

  async function markConversationRead(convId) {
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', convId)
      .neq('sender_id', user.id)
      .eq('is_read', false)
    setConversations(prev => prev.map(c =>
      c.id === convId ? { ...c, unread: 0 } : c
    ))
  }

  async function sendMessage() {
    if (!newMessage.trim() || !activeConv || sending) return
    setSending(true)
    const text = newMessage.trim()
    setNewMessage('')

    await supabase.from('messages').insert({
      conversation_id: activeConv.id,
      sender_id: user.id,
      text,
      is_read: false,
    })

    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', activeConv.id)

    // Create notification for recipient
    await supabase.from('notifications').insert({
      user_id: activeConv.other_user.id,
      type: 'message',
      title: `New message from ${profile?.name?.split(' ')[0]}`,
      body: text.length > 60 ? text.slice(0, 60) + '...' : text,
      related_user_id: user.id,
      related_url: `/messages?user=${user.id}`,
    })

    setSending(false)
    fetchConversations()
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function timeAgo(dateStr) {
    if (!dateStr) return ''
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m`
    if (hours < 24) return `${hours}h`
    if (days < 7) return `${days}d`
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const ACCOUNT_TYPE_LABELS = {
    buyer: { label: 'Buyer', color: '#1a6cf5', bg: '#e8f0fe', icon: '🏘️' },
    agent: { label: 'Agent', color: '#ea580c', bg: '#fff3e8', icon: '🤝' },
    broker: { label: 'Broker', color: '#c2410c', bg: '#fff3e8', icon: '🏦' },
    landlord: { label: 'Landlord', color: '#7e22ce', bg: '#f3e8ff', icon: '🏡' },
    management: { label: 'Prop. Mgr', color: '#9333ea', bg: '#f3e8ff', icon: '🏢' },
  }

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0)

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <TopNav />
      <div style={styles.page}>
        <div style={styles.container}>

          {/* Left sidebar — conversation list */}
          <div style={styles.sidebar}>
            <div style={styles.sidebarHeader}>
              <h1 style={styles.sidebarTitle}>
                Messages {totalUnread > 0 && <span style={styles.unreadBadge}>{totalUnread}</span>}
              </h1>
            </div>

            {loading ? (
              <div style={styles.center}>
                <div style={styles.spinner}/>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : conversations.length === 0 ? (
              <div style={styles.emptyConvs}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4, fontSize: 14 }}>No messages yet</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Visit someone's profile to start a conversation.</div>
              </div>
            ) : (
              <div style={styles.convList}>
                {conversations.map(conv => {
                  const isActive = activeConv?.id === conv.id
                  const typeMeta = ACCOUNT_TYPE_LABELS[conv.other_user?.account_type] || ACCOUNT_TYPE_LABELS.buyer
                  return (
                    <div
                      key={conv.id}
                      onClick={() => setActiveConv(conv)}
                      style={{ ...styles.convItem, ...(isActive ? styles.convItemActive : {}), ...(conv.unread > 0 ? styles.convItemUnread : {}) }}
                    >
                      <div style={styles.convAvatar}>
                        {conv.other_user?.photo_url ? (
                          <img src={conv.other_user.photo_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}/>
                        ) : (
                          <div style={{ ...styles.convAvatarInitial, background: isActive ? '#fff' : 'linear-gradient(135deg, #1a6cf5, #f97316)', color: isActive ? '#1a6cf5' : '#fff' }}>
                            {conv.other_user?.name?.[0]?.toUpperCase()}
                          </div>
                        )}
                        {conv.unread > 0 && <div style={styles.unreadDot}/>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                          <span style={{ fontSize: 13, fontWeight: conv.unread > 0 ? 700 : 600, color: isActive ? '#1a6cf5' : '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {conv.other_user?.name}
                          </span>
                          <span style={{ fontSize: 10, color: '#94a3b8', flexShrink: 0, marginLeft: 4 }}>
                            {timeAgo(conv.last_message?.created_at)}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: conv.unread > 0 ? '#334155' : '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: conv.unread > 0 ? 600 : 400 }}>
                          {conv.last_message ? (
                            conv.last_message.sender_id === user.id ? `You: ${conv.last_message.text}` : conv.last_message.text
                          ) : (
                            <span style={{ fontStyle: 'italic' }}>No messages yet</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right panel — message thread */}
          <div style={styles.thread}>
            {!activeConv ? (
              <div style={styles.noConv}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Your messages</h2>
                <p style={{ fontSize: 14, color: '#64748b', maxWidth: 300, textAlign: 'center', lineHeight: 1.6 }}>
                  Select a conversation or visit someone's profile to start messaging.
                </p>
              </div>
            ) : (
              <>
                {/* Thread header */}
                <div style={styles.threadHeader}>
                  <Link to={`/profile/${activeConv.other_user.id}`} style={styles.threadHeaderLeft}>
                    <div style={styles.threadAvatar}>
                      {activeConv.other_user?.photo_url ? (
                        <img src={activeConv.other_user.photo_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}/>
                      ) : (
                        <div style={styles.threadAvatarInitial}>{activeConv.other_user?.name?.[0]?.toUpperCase()}</div>
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{activeConv.other_user?.name}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        {ACCOUNT_TYPE_LABELS[activeConv.other_user?.account_type]?.icon} {ACCOUNT_TYPE_LABELS[activeConv.other_user?.account_type]?.label}
                      </div>
                    </div>
                  </Link>
                  <Link to={`/profile/${activeConv.other_user.id}`} style={styles.viewProfileBtn}>View profile →</Link>
                </div>

                {/* Messages */}
                <div style={styles.messageList}>
                  {messagesLoading ? (
                    <div style={styles.center}><div style={styles.spinner}/></div>
                  ) : messages.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8', fontSize: 13 }}>
                      No messages yet. Say hello! 👋
                    </div>
                  ) : (
                    <>
                      {messages.map((msg, i) => {
                        const isMe = msg.sender_id === user.id
                        const showAvatar = !isMe && (i === 0 || messages[i-1].sender_id !== msg.sender_id)
                        return (
                          <div key={msg.id} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 8, marginBottom: 4 }}>
                            {!isMe && (
                              <div style={{ width: 28, height: 28, flexShrink: 0 }}>
                                {showAvatar && (
                                  activeConv.other_user?.photo_url ? (
                                    <img src={activeConv.other_user.photo_url} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}/>
                                  ) : (
                                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #1a6cf5, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>
                                      {activeConv.other_user?.name?.[0]?.toUpperCase()}
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                            <div style={{ maxWidth: '70%' }}>
                              <div style={{
                                padding: '10px 14px',
                                borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                background: isMe ? '#1a6cf5' : '#fff',
                                color: isMe ? '#fff' : '#0f172a',
                                fontSize: 14,
                                lineHeight: 1.5,
                                border: isMe ? 'none' : '1px solid #e2e8f0',
                                wordBreak: 'break-word',
                              }}>
                                {msg.text}
                              </div>
                              <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2, textAlign: isMe ? 'right' : 'left' }}>
                                {timeAgo(msg.created_at)}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      <div ref={bottomRef}/>
                    </>
                  )}
                </div>

                {/* Input */}
                <div style={styles.inputRow}>
                  <textarea
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message ${activeConv.other_user?.name?.split(' ')[0]}...`}
                    style={styles.messageInput}
                    rows={1}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sending || !newMessage.trim()}
                    style={{ ...styles.sendBtn, opacity: sending || !newMessage.trim() ? 0.5 : 1 }}
                  >
                    ➤
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { flex: 1, padding: '20px', maxWidth: 1100, margin: '0 auto', width: '100%', boxSizing: 'border-box' },
  container: { display: 'flex', gap: 0, height: 'calc(100vh - 120px)', background: '#fff', borderRadius: 16, border: '1.5px solid #e2e8f0', overflow: 'hidden' },
  sidebar: { width: 320, flexShrink: 0, borderRight: '1.5px solid #e2e8f0', display: 'flex', flexDirection: 'column' },
  sidebarHeader: { padding: '20px 20px 14px', borderBottom: '1px solid #f1f5f9' },
  sidebarTitle: { fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 },
  unreadBadge: { background: '#ef4444', color: '#fff', fontSize: 11, fontWeight: 800, padding: '2px 7px', borderRadius: 100 },
  convList: { flex: 1, overflowY: 'auto' },
  convItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f8fafc' },
  convItemActive: { background: '#e8f0fe' },
  convItemUnread: { background: '#f8fafc' },
  convAvatar: { position: 'relative', width: 44, height: 44, flexShrink: 0 },
  convAvatarInitial: { width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700 },
  unreadDot: { position: 'absolute', top: 0, right: 0, width: 10, height: 10, borderRadius: '50%', background: '#1a6cf5', border: '2px solid #fff' },
  emptyConvs: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' },
  thread: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
  threadHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1.5px solid #e2e8f0', flexShrink: 0 },
  threadHeaderLeft: { display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' },
  threadAvatar: { width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(135deg, #1a6cf5, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  threadAvatarInitial: { color: '#fff', fontSize: 16, fontWeight: 700 },
  viewProfileBtn: { fontSize: 12, color: '#1a6cf5', fontWeight: 700, textDecoration: 'none' },
  messageList: { flex: 1, overflowY: 'auto', padding: '20px 20px 10px', display: 'flex', flexDirection: 'column', gap: 2 },
  inputRow: { display: 'flex', gap: 8, padding: '12px 16px', borderTop: '1.5px solid #e2e8f0', alignItems: 'flex-end', flexShrink: 0 },
  messageInput: { flex: 1, padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 20, fontSize: 14, outline: 'none', resize: 'none', fontFamily: 'inherit', background: '#f8fafc', color: '#0f172a', maxHeight: 120, overflowY: 'auto' },
  sendBtn: { width: 40, height: 40, borderRadius: '50%', background: '#1a6cf5', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  noConv: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 40 },
  spinner: { width: 32, height: 32, borderRadius: '50%', border: '3px solid #e8f0fe', borderTop: '3px solid #1a6cf5', animation: 'spin 0.8s linear infinite' },
}
