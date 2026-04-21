import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import TopNav from '../components/TopNav'
import Footer from '../components/Footer'
import { useProfile } from '../lib/useProfile'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

const ACCOUNT_TYPE_LABELS = {
  buyer: { label: 'Buyer / Renter', color: '#1a6cf5', bg: '#e8f0fe', icon: '🏘️' },
  agent: { label: 'Agent', color: '#ea580c', bg: '#fff3e8', icon: '🤝' },
  broker: { label: 'Mortgage Broker', color: '#c2410c', bg: '#fff3e8', icon: '🏦' },
  landlord: { label: 'Landlord', color: '#7e22ce', bg: '#f3e8ff', icon: '🏡' },
  management: { label: 'Property Manager', color: '#9333ea', bg: '#f3e8ff', icon: '🏢' },
}

const POST_PLACEHOLDERS = {
  agent: 'Share a market update, tip, or insight with the community...',
  broker: 'Share a rate update, financing tip, or market insight...',
  landlord: 'Share an update about your properties or the rental market...',
  management: 'Share a portfolio update or property management insight...',
  buyer: "Share what you're looking for or your experience so far...",
}

export default function Profile() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { profile, loading } = useProfile(userId)
  const isOwn = user?.id === userId
  const isPro = ['agent', 'broker'].includes(profile?.account_type)

  const [activeTab, setActiveTab] = useState('updates')

  // Posts
  const [posts, setPosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [postContent, setPostContent] = useState('')
  const [posting, setPosting] = useState(false)
  const [postError, setPostError] = useState('')

  // Friends
  const [friends, setFriends] = useState([])
  const [friendsLoading, setFriendsLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState(null)
  const [connectionId, setConnectionId] = useState(null)

  // Client links
  const [clientLinksCount, setClientLinksCount] = useState(0)

  // Requests
  const [friendRequests, setFriendRequests] = useState([])
  const [linkRequests, setLinkRequests] = useState([])
  const [requestsLoading, setRequestsLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    fetchPosts()
    fetchFriends()
    if (user && !isOwn) checkConnectionStatus()
    if (user && isOwn) fetchRequests()
  }, [userId, user])

  useEffect(() => {
    if (profile && isPro) fetchClientLinksCount()
  }, [profile])

  async function fetchClientLinksCount() {
    const { count } = await supabase
      .from('agent_clients')
      .select('*', { count: 'exact', head: true })
      .eq('agent_id', userId)
      .eq('status', 'active')
    setClientLinksCount(count || 0)
  }

  async function fetchPosts() {
    setPostsLoading(true)
    const { data } = await supabase
      .from('profile_posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    setPosts(data || [])
    setPostsLoading(false)
  }

  async function fetchFriends() {
    setFriendsLoading(true)
    const { data } = await supabase
      .from('connections')
      .select('id, requester_id, recipient_id, status')
      .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
      .eq('status', 'accepted')
    if (data && data.length > 0) {
      const friendIds = data.map(c => c.requester_id === userId ? c.recipient_id : c.requester_id)
      const connectionMap = {}
      data.forEach(c => {
        const fId = c.requester_id === userId ? c.recipient_id : c.requester_id
        connectionMap[fId] = c.id
      })
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, photo_url, account_type, city')
        .in('id', friendIds)
      setFriends((profiles || []).map(p => ({ ...p, connectionId: connectionMap[p.id] })))
    } else {
      setFriends([])
    }
    setFriendsLoading(false)
  }

  async function fetchRequests() {
    setRequestsLoading(true)

    // Friend requests — pending connections where I am the recipient
    const { data: connData } = await supabase
      .from('connections')
      .select('id, requester_id, created_at')
      .eq('recipient_id', user.id)
      .eq('status', 'pending')
    if (connData && connData.length > 0) {
      const requesterIds = connData.map(c => c.requester_id)
      const { data: requesterProfiles } = await supabase
        .from('profiles')
        .select('id, name, photo_url, account_type, city')
        .in('id', requesterIds)
      const profileMap = {}
      requesterProfiles?.forEach(p => { profileMap[p.id] = p })
      setFriendRequests(connData.map(c => ({ ...c, requester: profileMap[c.requester_id] })))
    } else {
      setFriendRequests([])
    }

    // Link requests — only for agents/brokers
    if (isPro) {
      const { data: linkData } = await supabase
        .from('representation_requests')
        .select('id, lead_user_id, message, created_at, status')
        .eq('agent_id', user.id)
        .eq('status', 'pending')
      if (linkData && linkData.length > 0) {
        const userIds = linkData.map(r => r.lead_user_id).filter(Boolean)
        const { data: userProfiles } = await supabase
          .from('profiles')
          .select('id, name, photo_url, account_type, city')
          .in('id', userIds)
        const profileMap = {}
        userProfiles?.forEach(p => { profileMap[p.id] = p })
        setLinkRequests(linkData.map(r => ({ ...r, requester: profileMap[r.lead_user_id] })))
      } else {
        setLinkRequests([])
      }
    }

    setRequestsLoading(false)
  }

  async function checkConnectionStatus() {
    if (!user) return
    const { data } = await supabase
      .from('connections')
      .select('id, status, requester_id')
      .or(`and(requester_id.eq.${user.id},recipient_id.eq.${userId}),and(requester_id.eq.${userId},recipient_id.eq.${user.id})`)
      .single()
    if (data) {
      setConnectionId(data.id)
      if (data.status === 'accepted') setConnectionStatus('accepted')
      else if (data.requester_id === user.id) setConnectionStatus('sent')
      else setConnectionStatus('pending')
    }
  }

  async function sendFriendRequest() {
    if (!user) return
    const { data, error } = await supabase
      .from('connections')
      .insert({ requester_id: user.id, recipient_id: userId, status: 'pending', connection_type: 'friend' })
      .select().single()
    if (!error && data) { setConnectionStatus('sent'); setConnectionId(data.id) }
  }

  async function acceptFriendRequest() {
    if (!connectionId) return
    await supabase.from('connections').update({ status: 'accepted' }).eq('id', connectionId)
    setConnectionStatus('accepted')
    fetchFriends()
  }

  async function acceptFriendRequestFromList(connId, requesterId) {
    await supabase.from('connections').update({ status: 'accepted' }).eq('id', connId)
    setFriendRequests(prev => prev.filter(r => r.id !== connId))
    fetchFriends()
  }

  async function declineFriendRequest(connId) {
    await supabase.from('connections').delete().eq('id', connId)
    setFriendRequests(prev => prev.filter(r => r.id !== connId))
  }

  async function acceptLinkRequest(reqId) {
    await supabase
      .from('representation_requests')
      .update({ status: 'accepted', responded_at: new Date().toISOString() })
      .eq('id', reqId)
    setLinkRequests(prev => prev.filter(r => r.id !== reqId))
    fetchClientLinksCount()
  }

  async function declineLinkRequest(reqId) {
    await supabase
      .from('representation_requests')
      .update({ status: 'declined', responded_at: new Date().toISOString() })
      .eq('id', reqId)
    setLinkRequests(prev => prev.filter(r => r.id !== reqId))
  }

  async function unfriend(connId) {
    await supabase.from('connections').delete().eq('id', connId)
    setFriends(prev => prev.filter(f => f.connectionId !== connId))
    if (connId === connectionId) setConnectionStatus(null)
  }

  async function handlePost() {
    if (!postContent.trim()) return
    setPostError('')
    setPosting(true)
    const { error } = await supabase
      .from('profile_posts')
      .insert({ user_id: user.id, content: postContent.trim() })
    setPosting(false)
    if (error) setPostError('Failed to post. Please try again.')
    else { setPostContent(''); fetchPosts() }
  }

  async function handleDeletePost(postId) {
    await supabase.from('profile_posts').delete().eq('id', postId)
    setPosts(prev => prev.filter(p => p.id !== postId))
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

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <TopNav />
      <div style={styles.center}>
        <div style={styles.spinner}/>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )

  if (!profile) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <TopNav />
      <div style={styles.center}>Profile not found. <Link to="/listings">Go home</Link></div>
    </div>
  )

  const typeMeta = ACCOUNT_TYPE_LABELS[profile.account_type] || ACCOUNT_TYPE_LABELS.buyer
  const h = profile.highlights || {}
  const placeholder = POST_PLACEHOLDERS[profile.account_type] || POST_PLACEHOLDERS.buyer
  const totalRequests = friendRequests.length + linkRequests.length

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <TopNav />
      <div style={styles.page}>
        <Link to="/listings" style={styles.back}>← Back</Link>

        {/* Banner + avatar */}
        <div style={styles.card}>
          <div style={styles.banner}/>
          <div style={{ padding: '0 24px 24px' }}>
            <div style={styles.headerRow}>
              <div style={styles.avatarWrap}>
                {profile.photo_url ? (
                  <img src={profile.photo_url} alt={profile.name} style={styles.avatarImg}/>
                ) : (
                  <div style={styles.avatarInitial}>{profile.name?.[0]?.toUpperCase()}</div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0, paddingTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <h1 style={styles.name}>{profile.name}</h1>
                  {profile.is_admin && <span style={styles.adminBadge}>ADMIN</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                  <span style={{ ...styles.typeBadge, background: typeMeta.bg, color: typeMeta.color }}>
                    {typeMeta.icon} {typeMeta.label}
                  </span>
                  {profile.city && <span style={styles.metaText}>📍 {profile.city}</span>}
                  {profile.move_timeline && <span style={styles.metaText}>· Moving in {profile.move_timeline}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                {isOwn && (
                  <button onClick={() => navigate('/profile/edit')} style={styles.editBtn}>✏️ Edit profile</button>
                )}
                {!isOwn && user && (
                  <>
                    {connectionStatus === null && (
                      <button onClick={sendFriendRequest} style={styles.actionBtn}>👥 Add Friend</button>
                    )}
                    {connectionStatus === 'sent' && (
                      <button disabled style={{ ...styles.actionBtn, opacity: 0.6, cursor: 'default' }}>⏳ Request Sent</button>
                    )}
                    {connectionStatus === 'pending' && (
                      <button onClick={acceptFriendRequest} style={{ ...styles.actionBtn, background: '#16a34a' }}>✅ Accept Request</button>
                    )}
                    {connectionStatus === 'accepted' && (
                      <button onClick={() => unfriend(connectionId)} style={{ ...styles.actionBtn, background: '#f1f5f9', color: '#64748b' }}>👥 Friends</button>
                    )}
                  </>
                )}
              </div>
            </div>

            {profile.bio ? (
              <p style={styles.bio}>{profile.bio}</p>
            ) : isOwn ? (
              <p style={styles.bioPlaceholder}>Add a bio so others know who you are.</p>
            ) : null}

            {/* Stats row */}
            <div style={styles.statsRow}>
              <div style={styles.stat}>
                <div style={styles.statNum}>{posts.length}</div>
                <div style={styles.statLabel}>Updates</div>
              </div>
              <div style={styles.stat}>
                <div style={styles.statNum}>{friends.length}</div>
                <div style={styles.statLabel}>Friends</div>
              </div>
              {isPro && (
                <div style={styles.stat}>
                  <div style={styles.statNum}>{clientLinksCount}</div>
                  <div style={styles.statLabel}>Clients</div>
                </div>
              )}
              {isPro && h.avg_rating && (
                <div style={styles.stat}>
                  <div style={styles.statNum}>{h.avg_rating} ⭐</div>
                  <div style={styles.statLabel}>Rating</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Highlights */}
        {profile.account_type === 'agent' && (
          <HighlightsCard title="Agent Highlights" items={[
            { icon: '🏙️', label: 'Market', value: h.market },
            { icon: '📅', label: 'Experience', value: h.experience },
            { icon: '🏠', label: 'Deals Closed', value: h.deals_closed },
            { icon: '⭐', label: 'Avg Rating', value: h.avg_rating },
            { icon: '🏢', label: 'Brokerage', value: profile.company || h.brokerage },
            { icon: '🎓', label: 'Specialty', value: h.specialty },
          ]} license={profile.license_number} isOwn={isOwn}/>
        )}
        {profile.account_type === 'broker' && (
          <HighlightsCard title="Broker Highlights" items={[
            { icon: '🏦', label: 'Lender', value: profile.company || h.lender },
            { icon: '📅', label: 'Experience', value: h.experience },
            { icon: '📋', label: 'Loans Closed', value: h.loans_closed },
            { icon: '⭐', label: 'Avg Rating', value: h.avg_rating },
            { icon: '💰', label: 'Loan Types', value: h.loan_types },
            { icon: '⚡', label: 'Avg Close Time', value: h.avg_close_time },
          ]} license={profile.license_number} isOwn={isOwn}/>
        )}
        {profile.account_type === 'landlord' && (
          <HighlightsCard title="Landlord" items={[
            { icon: '🏢', label: 'Company', value: profile.company },
            { icon: '🏡', label: 'Properties', value: Array.isArray(profile.verified_properties) ? profile.verified_properties.length || 'Claim buildings to show here' : 0 },
            { icon: '📅', label: 'On Chathouse since', value: new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) },
          ]} isOwn={isOwn}/>
        )}
        {profile.account_type === 'management' && (
          <HighlightsCard title="Property Management" items={[
            { icon: '🏢', label: 'Company', value: profile.company },
            { icon: '🏘️', label: 'Portfolio Size', value: Array.isArray(profile.verified_properties) ? profile.verified_properties.length || 'Claim buildings to show here' : 0 },
            { icon: '📅', label: 'On Chathouse since', value: new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) },
          ]} isOwn={isOwn}/>
        )}
        {profile.account_type === 'buyer' && profile.looking_for && (
          <div style={styles.card}>
            <div style={{ padding: 24 }}>
              <h2 style={styles.h2}>What I'm looking for</h2>
              <p style={styles.lookingFor}>{profile.looking_for}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={styles.card}>
          <div style={styles.tabRow}>
            <button onClick={() => setActiveTab('updates')} style={{ ...styles.tab, ...(activeTab === 'updates' ? styles.tabActive : {}) }}>
              📝 Updates {posts.length > 0 && `(${posts.length})`}
            </button>
            <button onClick={() => setActiveTab('friends')} style={{ ...styles.tab, ...(activeTab === 'friends' ? styles.tabActive : {}) }}>
              👥 Friends {friends.length > 0 && `(${friends.length})`}
            </button>
            {isPro && (
              <button onClick={() => setActiveTab('links')} style={{ ...styles.tab, ...(activeTab === 'links' ? styles.tabActive : {}) }}>
                🔗 Client Links {clientLinksCount > 0 && `(${clientLinksCount})`}
              </button>
            )}
            {isOwn && (
              <button onClick={() => setActiveTab('requests')} style={{ ...styles.tab, ...(activeTab === 'requests' ? styles.tabActive : {}) }}>
                📬 Requests {totalRequests > 0 && <span style={styles.requestBadge}>{totalRequests}</span>}
              </button>
            )}
          </div>

          <div style={{ padding: '0 24px 24px' }}>

            {/* Updates tab */}
            {activeTab === 'updates' && (
              <>
                {isOwn && (
                  <div style={styles.composerInner}>
                    <div style={styles.composerAvatar}>
                      {profile.photo_url ? (
                        <img src={profile.photo_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}/>
                      ) : (
                        <div style={styles.composerAvatarInitial}>{profile.name?.[0]?.toUpperCase()}</div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <textarea value={postContent} onChange={e => setPostContent(e.target.value)} placeholder={placeholder} style={styles.composerInput} rows={3}/>
                      {postError && <div style={styles.postError}>{postError}</div>}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                        <button onClick={handlePost} disabled={posting || !postContent.trim()} style={{ ...styles.postBtn, opacity: posting || !postContent.trim() ? 0.5 : 1 }}>
                          {posting ? 'Posting...' : 'Post'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {postsLoading ? (
                  <div style={styles.loadingText}>Loading...</div>
                ) : posts.length === 0 ? (
                  <EmptyState icon="📝" title="No updates yet" sub={isOwn ? 'Share your first update above.' : 'No updates posted yet.'}/>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                    {posts.map(post => (
                      <div key={post.id} style={styles.postCard}>
                        <div style={styles.postHeader}>
                          <div style={styles.postAvatar}>
                            {profile.photo_url ? <img src={profile.photo_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}/> : <div style={styles.postAvatarInitial}>{profile.name?.[0]?.toUpperCase()}</div>}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <span style={styles.postName}>{profile.name}</span>
                              <span style={{ ...styles.typeBadge, fontSize: 10, padding: '2px 8px', background: typeMeta.bg, color: typeMeta.color }}>{typeMeta.icon} {typeMeta.label}</span>
                              <span style={styles.postTime}>{timeAgo(post.created_at)}</span>
                            </div>
                          </div>
                          {isOwn && <button onClick={() => handleDeletePost(post.id)} style={styles.deleteBtn}>🗑️</button>}
                        </div>
                        <p style={styles.postContent}>{post.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Friends tab */}
            {activeTab === 'friends' && (
              <>
                {friendsLoading ? (
                  <div style={styles.loadingText}>Loading...</div>
                ) : friends.length === 0 ? (
                  <EmptyState icon="👥" title="No friends yet" sub={isOwn ? 'Connect with people you meet in listing conversations.' : 'No connections yet.'}/>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                    {friends.map(friend => {
                      const fm = ACCOUNT_TYPE_LABELS[friend.account_type] || ACCOUNT_TYPE_LABELS.buyer
                      return (
                        <div key={friend.id} style={styles.friendCard}>
                          <Link to={`/profile/${friend.id}`} style={styles.friendLeft}>
                            <div style={styles.friendAvatar}>
                              {friend.photo_url ? <img src={friend.photo_url} alt={friend.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}/> : <div style={styles.friendAvatarInitial}>{friend.name?.[0]?.toUpperCase()}</div>}
                            </div>
                            <div>
                              <div style={styles.friendName}>{friend.name}</div>
                              {friend.city && <div style={styles.friendCity}>📍 {friend.city}</div>}
                              <span style={{ ...styles.typeBadge, fontSize: 10, padding: '2px 8px', marginTop: 4, display: 'inline-block', background: fm.bg, color: fm.color }}>{fm.icon} {fm.label}</span>
                            </div>
                          </Link>
                          <div style={styles.friendActions}>
                            <Link to={`/profile/${friend.id}`} style={styles.messageBtn}>💬 Message</Link>
                            {isOwn && <button onClick={() => unfriend(friend.connectionId)} style={styles.unfriendBtn}>Unfriend</button>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}

            {/* Client Links tab — agents/brokers only */}
            {activeTab === 'links' && isPro && (
              <div style={styles.linksTab}>
                <div style={styles.linksCount}>{clientLinksCount}</div>
                <div style={styles.linksTitle}>Active Client Links</div>
                <div style={styles.linksSub}>
                  {profile.account_type === 'agent'
                    ? 'Buyers who have linked this agent to their Chathouse profile'
                    : 'Borrowers who have linked this broker to their Chathouse profile'}
                </div>
                {isPro && h.avg_rating && (
                  <div style={styles.linksStats}>
                    <div style={styles.linksStat}>
                      <div style={styles.linksStatNum}>{h.avg_rating} ⭐</div>
                      <div style={styles.linksStatLabel}>Avg rating</div>
                    </div>
                  </div>
                )}
                <div style={styles.linksPrivacyNote}>
                  🔒 Client details are private. Only you can view who your linked clients are via your dashboard.
                </div>
              </div>
            )}

            {/* Requests tab — own profile only */}
            {activeTab === 'requests' && isOwn && (
              <>
                {requestsLoading ? (
                  <div style={styles.loadingText}>Loading...</div>
                ) : (friendRequests.length === 0 && linkRequests.length === 0) ? (
                  <EmptyState icon="📬" title="No pending requests" sub="Friend and link requests will appear here."/>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 16 }}>

                    {/* Friend requests */}
                    {friendRequests.length > 0 && (
                      <div>
                        <div style={styles.requestSectionTitle}>👥 Friend Requests ({friendRequests.length})</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                          {friendRequests.map(req => {
                            const fm = ACCOUNT_TYPE_LABELS[req.requester?.account_type] || ACCOUNT_TYPE_LABELS.buyer
                            return (
                              <div key={req.id} style={styles.requestCard}>
                                <Link to={`/profile/${req.requester_id}`} style={styles.requestLeft}>
                                  <div style={styles.requestAvatar}>
                                    {req.requester?.photo_url ? <img src={req.requester.photo_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}/> : <div style={styles.requestAvatarInitial}>{req.requester?.name?.[0]?.toUpperCase()}</div>}
                                  </div>
                                  <div>
                                    <div style={styles.requestName}>{req.requester?.name || 'Unknown user'}</div>
                                    {req.requester?.city && <div style={styles.requestMeta}>📍 {req.requester.city}</div>}
                                    <span style={{ ...styles.typeBadge, fontSize: 10, padding: '2px 8px', marginTop: 4, display: 'inline-block', background: fm.bg, color: fm.color }}>{fm.icon} {fm.label}</span>
                                    <div style={styles.requestTime}>{timeAgo(req.created_at)}</div>
                                  </div>
                                </Link>
                                <div style={styles.requestActions}>
                                  <button onClick={() => acceptFriendRequestFromList(req.id, req.requester_id)} style={styles.acceptBtn}>✅ Accept</button>
                                  <button onClick={() => declineFriendRequest(req.id)} style={styles.declineBtn}>✕ Decline</button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Link requests — agents/brokers only */}
                    {isPro && linkRequests.length > 0 && (
                      <div>
                        <div style={styles.requestSectionTitle}>🔗 Link Requests ({linkRequests.length})</div>
                        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>
                          These users are requesting you as their {profile.account_type === 'agent' ? 'agent' : 'mortgage broker'}.
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {linkRequests.map(req => {
                            const fm = ACCOUNT_TYPE_LABELS[req.requester?.account_type] || ACCOUNT_TYPE_LABELS.buyer
                            return (
                              <div key={req.id} style={{ ...styles.requestCard, borderLeft: '3px solid #f97316' }}>
                                <Link to={`/profile/${req.lead_user_id}`} style={styles.requestLeft}>
                                  <div style={styles.requestAvatar}>
                                    {req.requester?.photo_url ? <img src={req.requester.photo_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}/> : <div style={{ ...styles.requestAvatarInitial, background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>{req.requester?.name?.[0]?.toUpperCase()}</div>}
                                  </div>
                                  <div>
                                    <div style={styles.requestName}>{req.requester?.name || 'Unknown user'}</div>
                                    {req.requester?.city && <div style={styles.requestMeta}>📍 {req.requester.city}</div>}
                                    <span style={{ ...styles.typeBadge, fontSize: 10, padding: '2px 8px', marginTop: 4, display: 'inline-block', background: fm.bg, color: fm.color }}>{fm.icon} {fm.label}</span>
                                    {req.message && <div style={styles.requestMessage}>"{req.message}"</div>}
                                    <div style={styles.requestTime}>{timeAgo(req.created_at)}</div>
                                  </div>
                                </Link>
                                <div style={styles.requestActions}>
                                  <button onClick={() => acceptLinkRequest(req.id)} style={styles.acceptBtn}>✅ Accept</button>
                                  <button onClick={() => declineLinkRequest(req.id)} style={styles.declineBtn}>✕ Decline</button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

function EmptyState({ icon, title, sub }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f8fafc', borderRadius: 12, margin: '16px 0' }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4, fontSize: 15 }}>{title}</div>
      <div style={{ fontSize: 13, color: '#64748b' }}>{sub}</div>
    </div>
  )
}

function HighlightsCard({ title, items, license, isOwn }) {
  return (
    <div style={styles.card}>
      <div style={{ padding: 24 }}>
        <h2 style={styles.h2}>{title}</h2>
        {license && <div style={{ marginBottom: 14, fontSize: 12, color: '#64748b' }}>License #: <strong>{license}</strong></div>}
        <div style={styles.highlightsGrid}>
          {items.map(item => (
            <div key={item.label} style={styles.highlight}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <div>
                <div style={styles.highlightLabel}>{item.label}</div>
                <div style={{ ...styles.highlightValue, color: item.value ? '#0f172a' : '#94a3b8', fontStyle: item.value ? 'normal' : 'italic' }}>
                  {item.value || (isOwn ? 'Click Edit profile to add' : '—')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { maxWidth: 780, margin: '0 auto', padding: '24px 20px 60px' },
  back: { display: 'inline-block', fontSize: 13, color: '#64748b', marginBottom: 16, textDecoration: 'none', fontWeight: 600 },
  card: { background: '#fff', borderRadius: 16, border: '1.5px solid #e2e8f0', overflow: 'hidden', marginBottom: 16 },
  banner: { height: 80, background: 'linear-gradient(135deg, #1a6cf5, #7c3aed)' },
  headerRow: { display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginTop: -36, marginBottom: 16 },
  avatarWrap: { flexShrink: 0, borderRadius: '50%', border: '4px solid #fff' },
  avatarImg: { width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', display: 'block' },
  avatarInitial: { width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #1a6cf5, #f97316)', color: '#fff', fontSize: 32, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 700, color: '#0f172a' },
  adminBadge: { fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 4, background: '#0f172a', color: '#fff', letterSpacing: 0.5 },
  typeBadge: { fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 100 },
  metaText: { fontSize: 12, color: '#64748b' },
  editBtn: { padding: '8px 14px', background: '#f1f5f9', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#475569', cursor: 'pointer', marginTop: 36 },
  actionBtn: { padding: '8px 14px', background: '#1a6cf5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', marginTop: 36 },
  bio: { fontSize: 14, color: '#334155', lineHeight: 1.65, whiteSpace: 'pre-wrap' },
  bioPlaceholder: { fontSize: 13, color: '#94a3b8', fontStyle: 'italic' },
  statsRow: { display: 'flex', gap: 24, marginTop: 16, paddingTop: 16, borderTop: '1px solid #f1f5f9' },
  stat: { textAlign: 'center' },
  statNum: { fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 700, color: '#0f172a' },
  statLabel: { fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 },
  h2: { fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 14 },
  lookingFor: { fontSize: 14, color: '#334155', lineHeight: 1.6, padding: 12, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' },
  highlightsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 },
  highlight: { display: 'flex', alignItems: 'center', gap: 10, padding: 10, background: '#f8fafc', borderRadius: 10, border: '1px solid #f1f5f9' },
  highlightLabel: { fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3 },
  highlightValue: { fontSize: 13, fontWeight: 600, marginTop: 2 },
  tabRow: { display: 'flex', gap: 0, borderBottom: '1.5px solid #e2e8f0', padding: '0 24px', overflowX: 'auto' },
  tab: { padding: '14px 14px', background: 'none', border: 'none', fontSize: 13, fontWeight: 600, color: '#64748b', cursor: 'pointer', borderBottom: '2px solid transparent', marginBottom: -2, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 },
  tabActive: { color: '#1a6cf5', borderBottomColor: '#1a6cf5' },
  requestBadge: { background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 100, marginLeft: 2 },
  composerInner: { display: 'flex', gap: 12, alignItems: 'flex-start', padding: '16px 0 12px', borderBottom: '1px solid #f1f5f9' },
  composerAvatar: { width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(135deg, #1a6cf5, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  composerAvatarInitial: { color: '#fff', fontSize: 16, fontWeight: 700 },
  composerInput: { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, color: '#0f172a', outline: 'none', resize: 'vertical', fontFamily: 'inherit', background: '#f8fafc', boxSizing: 'border-box' },
  postBtn: { padding: '8px 20px', background: '#1a6cf5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  postError: { fontSize: 12, color: '#dc2626', marginTop: 6 },
  postCard: { padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' },
  postHeader: { display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  postAvatar: { width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(135deg, #1a6cf5, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  postAvatarInitial: { color: '#fff', fontSize: 14, fontWeight: 700 },
  postName: { fontSize: 13, fontWeight: 700, color: '#0f172a' },
  postTime: { fontSize: 11, color: '#94a3b8' },
  postContent: { fontSize: 14, color: '#334155', lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap' },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, opacity: 0.5, padding: 4, marginLeft: 'auto' },
  loadingText: { textAlign: 'center', padding: 30, color: '#64748b', fontSize: 13 },
  friendCard: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', gap: 12, flexWrap: 'wrap' },
  friendLeft: { display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', flex: 1 },
  friendAvatar: { width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(135deg, #1a6cf5, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  friendAvatarInitial: { color: '#fff', fontSize: 18, fontWeight: 700 },
  friendName: { fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 2 },
  friendCity: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  friendActions: { display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 },
  messageBtn: { padding: '8px 16px', background: '#e8f0fe', color: '#1a6cf5', borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none', textAlign: 'center' },
  unfriendBtn: { padding: '8px 16px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', textAlign: 'center' },
  linksTab: { textAlign: 'center', padding: '32px 20px' },
  linksCount: { fontFamily: 'var(--serif)', fontSize: 64, fontWeight: 900, color: '#16a34a', lineHeight: 1, marginBottom: 8 },
  linksTitle: { fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8 },
  linksSub: { fontSize: 14, color: '#64748b', maxWidth: 360, margin: '0 auto 20px', lineHeight: 1.6 },
  linksStats: { display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 20 },
  linksStat: { textAlign: 'center' },
  linksStatNum: { fontSize: 20, fontWeight: 700, color: '#0f172a' },
  linksStatLabel: { fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 },
  linksPrivacyNote: { fontSize: 13, color: '#475569', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 16px', maxWidth: 420, margin: '0 auto', lineHeight: 1.6 },
  requestSectionTitle: { fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 4 },
  requestCard: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', gap: 12, flexWrap: 'wrap' },
  requestLeft: { display: 'flex', alignItems: 'flex-start', gap: 12, textDecoration: 'none', flex: 1 },
  requestAvatar: { width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(135deg, #1a6cf5, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  requestAvatarInitial: { color: '#fff', fontSize: 16, fontWeight: 700 },
  requestName: { fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 2 },
  requestMeta: { fontSize: 12, color: '#64748b', marginBottom: 2 },
  requestMessage: { fontSize: 12, color: '#475569', fontStyle: 'italic', marginTop: 6, background: '#fff', padding: '6px 10px', borderRadius: 8, border: '1px solid #e2e8f0' },
  requestTime: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
  requestActions: { display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 },
  acceptBtn: { padding: '8px 16px', background: '#dcfce7', color: '#16a34a', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', textAlign: 'center' },
  declineBtn: { padding: '8px 16px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', textAlign: 'center' },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 80, color: '#64748b' },
  spinner: { width: 36, height: 36, borderRadius: '50%', border: '3px solid #e8f0fe', borderTop: '3px solid #1a6cf5', animation: 'spin 0.8s linear infinite' },
}
