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

function getAchievements(accountType, stats) {
  const { clientLinks, commentLikes, avgRating, firstComment, commentedListings, friendCount, claimedProperties } = stats
  const all = []
  if (['agent', 'broker'].includes(accountType)) {
    all.push({ id: 'first_link', icon: '🏆', title: 'First Link', desc: 'Got your first client link', earned: clientLinks >= 1, bg: '#fefce8', border: '#fde68a', earnedColor: '#92400e' })
    all.push({ id: '5_links', icon: '🥇', title: '5 Client Links', desc: '5 buyers linked your profile', earned: clientLinks >= 5, progress: Math.min(clientLinks, 5), total: 5, bg: '#f0fdf4', border: '#bbf7d0', earnedColor: '#166534' })
    all.push({ id: '10_links', icon: '🔟', title: '10 Client Links', desc: '10 buyers linked your profile', earned: clientLinks >= 10, progress: Math.min(clientLinks, 10), total: 10, bg: '#eff6ff', border: '#bfdbfe', earnedColor: '#1e40af' })
    all.push({ id: '25_links', icon: '⭐', title: '25 Client Links', desc: '25 buyers linked your profile', earned: clientLinks >= 25, progress: Math.min(clientLinks, 25), total: 25, bg: '#fdf4ff', border: '#e9d5ff', earnedColor: '#6b21a8' })
    all.push({ id: 'top_rated', icon: '⭐', title: 'Top Rated', desc: 'Achieved a 4.5+ star rating', earned: avgRating >= 4.5, bg: '#fefce8', border: '#fde68a', earnedColor: '#92400e' })
  }
  if (accountType === 'management') {
    all.push({ id: 'first_claim', icon: '🏢', title: 'First Claim', desc: 'Claimed your first building', earned: claimedProperties >= 1, bg: '#fefce8', border: '#fde68a', earnedColor: '#92400e' })
    all.push({ id: '5_buildings', icon: '🏘️', title: '5 Buildings', desc: 'Claimed 5 properties', earned: claimedProperties >= 5, progress: Math.min(claimedProperties, 5), total: 5, bg: '#f0fdf4', border: '#bbf7d0', earnedColor: '#166534' })
    all.push({ id: 'top_rated_mgmt', icon: '⭐', title: 'Top Rated', desc: 'Achieved a 4.5+ star rating', earned: avgRating >= 4.5, bg: '#fefce8', border: '#fde68a', earnedColor: '#92400e' })
  }
  all.push({ id: 'first_comment', icon: '💬', title: 'First Comment', desc: 'Left your first comment on a listing', earned: firstComment, bg: '#eff6ff', border: '#bfdbfe', earnedColor: '#1e40af' })
  all.push({ id: 'explorer', icon: '🔍', title: 'Explorer', desc: 'Commented on 5+ different listings', earned: commentedListings >= 5, progress: Math.min(commentedListings, 5), total: 5, bg: '#f0fdf4', border: '#bbf7d0', earnedColor: '#166534' })
  all.push({ id: 'community_voice', icon: '🗣️', title: 'Community Voice', desc: 'Received 50+ comment likes', earned: commentLikes >= 50, progress: Math.min(commentLikes, 50), total: 50, bg: '#fdf4ff', border: '#e9d5ff', earnedColor: '#6b21a8' })
  all.push({ id: 'connected', icon: '👥', title: 'Connected', desc: 'Made your first friend connection', earned: friendCount >= 1, bg: '#fff3e8', border: '#fed7aa', earnedColor: '#c2410c' })
  return all
}

export default function Profile() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user, profile: viewerProfile } = useAuth()
  const { profile, loading } = useProfile(userId)
  const isOwn = user?.id === userId
  const isPro = ['agent', 'broker'].includes(profile?.account_type)
  const isManagement = profile?.account_type === 'management'
  const hasReviews = isPro || isManagement

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

  // Link request
  const [linkStatus, setLinkStatus] = useState(null) // null | 'sent' | 'accepted'
  const [showLinkForm, setShowLinkForm] = useState(false)
  const [linkMessage, setLinkMessage] = useState('')
  const [sendingLink, setSendingLink] = useState(false)

  // Client links
  const [clientLinksCount, setClientLinksCount] = useState(0)

  // Requests
  const [friendRequests, setFriendRequests] = useState([])
  const [linkRequests, setLinkRequests] = useState([])
  const [requestsLoading, setRequestsLoading] = useState(true)

  // Reviews
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [avgRating, setAvgRating] = useState(0)
  const [myReview, setMyReview] = useState(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewContent, setReviewContent] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [showReviewForm, setShowReviewForm] = useState(false)

  // Achievements
  const [achievementStats, setAchievementStats] = useState({ clientLinks: 0, commentLikes: 0, avgRating: 0, firstComment: false, commentedListings: 0, friendCount: 0, claimedProperties: 0 })

  useEffect(() => {
    if (!userId) return
    fetchPosts()
    fetchFriends()
    if (user && !isOwn) {
      checkConnectionStatus()
    }
    if (user && isOwn) fetchRequests()
  }, [userId, user])

  useEffect(() => {
    if (profile) {
      if (isPro) fetchClientLinksCount()
      if (hasReviews) fetchReviews()
      fetchAchievementStats()
      if (user && !isOwn && isPro) checkLinkStatus()
    }
  }, [profile])

  async function fetchClientLinksCount() {
    const { count } = await supabase.from('agent_clients').select('*', { count: 'exact', head: true }).eq('agent_id', userId).eq('status', 'active')
    setClientLinksCount(count || 0)
  }

  async function checkLinkStatus() {
    if (!user) return
    const { data } = await supabase
      .from('representation_requests')
      .select('id, status')
      .eq('agent_id', userId)
      .eq('lead_user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    if (data) {
      setLinkStatus(data.status === 'accepted' ? 'accepted' : 'sent')
    }
  }

  async function sendLinkRequest() {
    if (!user) return
    setSendingLink(true)
    const { error } = await supabase.from('representation_requests').insert({
      agent_id: userId,
      lead_user_id: user.id,
      message: linkMessage.trim() || null,
      status: 'pending',
    })
    setSendingLink(false)
    if (!error) {
      setLinkStatus('sent')
      setShowLinkForm(false)
      setLinkMessage('')
    }
  }

  async function fetchReviews() {
    setReviewsLoading(true)
    const { data } = await supabase
      .from('reviews')
      .select('*, reviewer:reviewer_id(id, name, photo_url, account_type)')
      .eq('reviewee_id', userId)
      .order('created_at', { ascending: false })
    setReviews(data || [])
    if (data && data.length > 0) {
      const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length
      setAvgRating(Math.round(avg * 10) / 10)
    }
    if (user) {
      const mine = data?.find(r => r.reviewer_id === user.id)
      if (mine) { setMyReview(mine); setReviewRating(mine.rating); setReviewContent(mine.content || '') }
    }
    setReviewsLoading(false)
  }

  async function fetchAchievementStats() {
    const [
      { data: userComments },
      { count: friendCount },
      { count: claimedProps }
    ] = await Promise.all([
      supabase.from('comments').select('id, listing_id').eq('user_id', userId),
      supabase.from('connections').select('*', { count: 'exact', head: true }).or(`requester_id.eq.${userId},recipient_id.eq.${userId}`).eq('status', 'accepted'),
      supabase.from('listings').select('*', { count: 'exact', head: true }).eq('claimed_by', userId),
    ])
    let commentLikes = 0
    if (userComments && userComments.length > 0) {
      const commentIds = userComments.map(c => c.id)
      const { count } = await supabase.from('comment_likes').select('*', { count: 'exact', head: true }).in('comment_id', commentIds)
      commentLikes = count || 0
    }
    const uniqueListings = new Set(userComments?.map(c => c.listing_id) || []).size
    setAchievementStats({
      clientLinks: clientLinksCount,
      commentLikes,
      avgRating,
      firstComment: (userComments?.length || 0) > 0,
      commentedListings: uniqueListings,
      friendCount: friendCount || 0,
      claimedProperties: claimedProps || 0,
    })
  }

  async function submitReview() {
    if (!user || !reviewContent.trim()) return
    setSubmittingReview(true)
    setReviewError('')
    if (myReview) {
      const { error } = await supabase.from('reviews').update({ rating: reviewRating, content: reviewContent.trim(), updated_at: new Date().toISOString() }).eq('id', myReview.id)
      if (error) setReviewError('Failed to update review.')
      else { setShowReviewForm(false); fetchReviews() }
    } else {
      const { error } = await supabase.from('reviews').insert({ reviewer_id: user.id, reviewee_id: userId, rating: reviewRating, content: reviewContent.trim() })
      if (error) setReviewError('Failed to submit review.')
      else { setShowReviewForm(false); fetchReviews() }
    }
    setSubmittingReview(false)
  }

  async function deleteReview() {
    if (!myReview) return
    await supabase.from('reviews').delete().eq('id', myReview.id)
    setMyReview(null); setReviewRating(5); setReviewContent(''); setShowReviewForm(false)
    fetchReviews()
  }

  async function fetchPosts() {
    setPostsLoading(true)
    const { data } = await supabase.from('profile_posts').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    setPosts(data || [])
    setPostsLoading(false)
  }

  async function fetchFriends() {
    setFriendsLoading(true)
    const { data } = await supabase.from('connections').select('id, requester_id, recipient_id, status').or(`requester_id.eq.${userId},recipient_id.eq.${userId}`).eq('status', 'accepted')
    if (data && data.length > 0) {
      const friendIds = data.map(c => c.requester_id === userId ? c.recipient_id : c.requester_id)
      const connectionMap = {}
      data.forEach(c => { const fId = c.requester_id === userId ? c.recipient_id : c.requester_id; connectionMap[fId] = c.id })
      const { data: profiles } = await supabase.from('profiles').select('id, name, photo_url, account_type, city').in('id', friendIds)
      setFriends((profiles || []).map(p => ({ ...p, connectionId: connectionMap[p.id] })))
    } else setFriends([])
    setFriendsLoading(false)
  }

  async function fetchRequests() {
    setRequestsLoading(true)
    const { data: connData } = await supabase.from('connections').select('id, requester_id, created_at').eq('recipient_id', user.id).eq('status', 'pending')
    if (connData && connData.length > 0) {
      const { data: rProfiles } = await supabase.from('profiles').select('id, name, photo_url, account_type, city').in('id', connData.map(c => c.requester_id))
      const pm = {}; rProfiles?.forEach(p => { pm[p.id] = p })
      setFriendRequests(connData.map(c => ({ ...c, requester: pm[c.requester_id] })))
    } else setFriendRequests([])
    if (isPro) {
      const { data: linkData } = await supabase.from('representation_requests').select('id, lead_user_id, message, created_at, status').eq('agent_id', user.id).eq('status', 'pending')
      if (linkData && linkData.length > 0) {
        const { data: uProfiles } = await supabase.from('profiles').select('id, name, photo_url, account_type, city').in('id', linkData.map(r => r.lead_user_id).filter(Boolean))
        const pm = {}; uProfiles?.forEach(p => { pm[p.id] = p })
        setLinkRequests(linkData.map(r => ({ ...r, requester: pm[r.lead_user_id] })))
      } else setLinkRequests([])
    }
    setRequestsLoading(false)
  }

  async function checkConnectionStatus() {
    if (!user) return
    const { data } = await supabase.from('connections').select('id, status, requester_id').or(`and(requester_id.eq.${user.id},recipient_id.eq.${userId}),and(requester_id.eq.${userId},recipient_id.eq.${user.id})`).single()
    if (data) { setConnectionId(data.id); if (data.status === 'accepted') setConnectionStatus('accepted'); else if (data.requester_id === user.id) setConnectionStatus('sent'); else setConnectionStatus('pending') }
  }

  async function sendFriendRequest() {
    if (!user) return
    const { data, error } = await supabase.from('connections').insert({ requester_id: user.id, recipient_id: userId, status: 'pending', connection_type: 'friend' }).select().single()
    if (!error && data) { setConnectionStatus('sent'); setConnectionId(data.id) }
  }

  async function acceptFriendRequest() { if (!connectionId) return; await supabase.from('connections').update({ status: 'accepted' }).eq('id', connectionId); setConnectionStatus('accepted'); fetchFriends() }
  async function acceptFriendRequestFromList(connId) { await supabase.from('connections').update({ status: 'accepted' }).eq('id', connId); setFriendRequests(prev => prev.filter(r => r.id !== connId)); fetchFriends() }
  async function declineFriendRequest(connId) { await supabase.from('connections').delete().eq('id', connId); setFriendRequests(prev => prev.filter(r => r.id !== connId)) }
  async function acceptLinkRequest(reqId) { await supabase.from('representation_requests').update({ status: 'accepted', responded_at: new Date().toISOString() }).eq('id', reqId); setLinkRequests(prev => prev.filter(r => r.id !== reqId)); fetchClientLinksCount() }
  async function declineLinkRequest(reqId) { await supabase.from('representation_requests').update({ status: 'declined', responded_at: new Date().toISOString() }).eq('id', reqId); setLinkRequests(prev => prev.filter(r => r.id !== reqId)) }
  async function unfriend(connId) { await supabase.from('connections').delete().eq('id', connId); setFriends(prev => prev.filter(f => f.connectionId !== connId)); if (connId === connectionId) setConnectionStatus(null) }
  async function handlePost() { if (!postContent.trim()) return; setPostError(''); setPosting(true); const { error } = await supabase.from('profile_posts').insert({ user_id: user.id, content: postContent.trim() }); setPosting(false); if (error) setPostError('Failed to post.'); else { setPostContent(''); fetchPosts() } }
  async function handleDeletePost(postId) { await supabase.from('profile_posts').delete().eq('id', postId); setPosts(prev => prev.filter(p => p.id !== postId)) }

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000), hours = Math.floor(diff / 3600000), days = Math.floor(diff / 86400000)
    if (mins < 1) return 'just now'; if (mins < 60) return `${mins}m ago`; if (hours < 24) return `${hours}h ago`; if (days < 7) return `${days}d ago`
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (loading) return (<div style={{ minHeight: '100vh', background: '#f8fafc' }}><TopNav /><div style={styles.center}><div style={styles.spinner}/><style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style></div></div>)
  if (!profile) return (<div style={{ minHeight: '100vh', background: '#f8fafc' }}><TopNav /><div style={styles.center}>Profile not found. <Link to="/listings">Go home</Link></div></div>)

  const typeMeta = ACCOUNT_TYPE_LABELS[profile.account_type] || ACCOUNT_TYPE_LABELS.buyer
  const h = profile.highlights || {}
  const placeholder = POST_PLACEHOLDERS[profile.account_type] || POST_PLACEHOLDERS.buyer
  const totalRequests = friendRequests.length + linkRequests.length
  const achievements = getAchievements(profile.account_type, { ...achievementStats, clientLinks: clientLinksCount, avgRating, friendCount: friends.length })
  const earnedCount = achievements.filter(a => a.earned).length

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <TopNav />
      <div style={styles.page}>
        <Link to="/listings" style={styles.back}>← Back</Link>

        <div style={styles.card}>
          <div style={styles.banner}/>
          <div style={{ padding: '0 24px 24px' }}>
            <div style={styles.headerRow}>
              <div style={styles.avatarWrap}>
                {profile.photo_url ? <img src={profile.photo_url} alt={profile.name} style={styles.avatarImg}/> : <div style={styles.avatarInitial}>{profile.name?.[0]?.toUpperCase()}</div>}
              </div>
              <div style={{ flex: 1, minWidth: 0, paddingTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <h1 style={styles.name}>{profile.name}</h1>
                  {profile.is_admin && <span style={styles.adminBadge}>ADMIN</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                  <span style={{ ...styles.typeBadge, background: typeMeta.bg, color: typeMeta.color }}>{typeMeta.icon} {typeMeta.label}</span>
                  {profile.city && <span style={styles.metaText}>📍 {profile.city}</span>}
                  {profile.move_timeline && <span style={styles.metaText}>· Moving in {profile.move_timeline}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                {isOwn && <button onClick={() => navigate('/profile/edit')} style={styles.editBtn}>✏️ Edit profile</button>}
                {!isOwn && user && (
                  <>
                    {/* Friend request button */}
                    {connectionStatus === null && <button onClick={sendFriendRequest} style={styles.actionBtn}>👥 Add Friend</button>}
                    {connectionStatus === 'sent' && <button disabled style={{ ...styles.actionBtn, opacity: 0.6, cursor: 'default' }}>⏳ Request Sent</button>}
                    {connectionStatus === 'pending' && <button onClick={acceptFriendRequest} style={{ ...styles.actionBtn, background: '#16a34a' }}>✅ Accept Request</button>}
                    {connectionStatus === 'accepted' && <button onClick={() => unfriend(connectionId)} style={{ ...styles.actionBtn, background: '#f1f5f9', color: '#64748b' }}>👥 Friends</button>}

                    {/* Link request button:
                        Agents/brokers can request anyone except property managers.
                        Everyone else can only request agents/brokers. */}
                    {(() => {
                      const viewerIsPro = ['agent','broker'].includes(viewerProfile?.account_type)
                      const targetIsManagement = profile.account_type === 'management'
                      const showLink = viewerIsPro ? !targetIsManagement : isPro
                      if (!showLink) return null
                      return (
                        <>
                          {linkStatus === null && (
                            <button onClick={() => setShowLinkForm(f => !f)} style={{ ...styles.actionBtn, background: '#f97316' }}>
                              🔗 Request Link
                            </button>
                          )}
                          {linkStatus === 'sent' && (
                            <button disabled style={{ ...styles.actionBtn, background: '#f1f5f9', color: '#64748b', cursor: 'default' }}>
                              ⏳ Link Requested
                            </button>
                          )}
                          {linkStatus === 'accepted' && (
                            <button disabled style={{ ...styles.actionBtn, background: '#f0fdf4', color: '#16a34a', cursor: 'default' }}>
                              🔗 Linked
                            </button>
                          )}
                        </>
                      )
                    })()}
                  </>
                )}
              </div>
            </div>

            {/* Link request form — inline below header */}
            {showLinkForm && !isOwn && (
              <div style={styles.linkForm}>
                <div style={styles.linkFormTitle}>
                  Request {profile.name?.split(' ')[0]} as your {profile.account_type === 'agent' ? 'agent' : 'mortgage broker'}
                </div>
                <textarea
                  value={linkMessage}
                  onChange={e => setLinkMessage(e.target.value)}
                  placeholder={`Optional: introduce yourself or explain what you're looking for...`}
                  style={{ ...styles.composerInput, marginBottom: 10 }}
                  rows={3}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={sendLinkRequest}
                    disabled={sendingLink}
                    style={{ ...styles.postBtn, background: '#f97316', opacity: sendingLink ? 0.6 : 1 }}
                  >
                    {sendingLink ? 'Sending...' : 'Send Request'}
                  </button>
                  <button onClick={() => { setShowLinkForm(false); setLinkMessage('') }} style={styles.unfriendBtn}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {profile.bio ? <p style={styles.bio}>{profile.bio}</p> : isOwn ? <p style={styles.bioPlaceholder}>Add a bio so others know who you are.</p> : null}

            <div style={styles.statsRow}>
              <div style={styles.stat}><div style={styles.statNum}>{posts.length}</div><div style={styles.statLabel}>Updates</div></div>
              <div style={styles.stat}><div style={styles.statNum}>{friends.length}</div><div style={styles.statLabel}>Friends</div></div>
              {isPro && <div style={styles.stat}><div style={styles.statNum}>{clientLinksCount}</div><div style={styles.statLabel}>Clients</div></div>}
              {hasReviews && avgRating > 0 && <div style={styles.stat}><div style={styles.statNum}>{avgRating} ⭐</div><div style={styles.statLabel}>Rating</div></div>}
              {hasReviews && <div style={styles.stat}><div style={styles.statNum}>{reviews.length}</div><div style={styles.statLabel}>Reviews</div></div>}
              <div style={styles.stat}><div style={styles.statNum}>{earnedCount}</div><div style={styles.statLabel}>Badges</div></div>
            </div>
          </div>
        </div>

        {profile.account_type === 'agent' && <HighlightsCard title="Agent Highlights" items={[{ icon: '🏙️', label: 'Market', value: h.market },{ icon: '📅', label: 'Experience', value: h.experience },{ icon: '🏠', label: 'Deals Closed', value: h.deals_closed },{ icon: '⭐', label: 'Avg Rating', value: h.avg_rating },{ icon: '🏢', label: 'Brokerage', value: profile.company || h.brokerage },{ icon: '🎓', label: 'Specialty', value: h.specialty }]} license={profile.license_number} isOwn={isOwn}/>}
        {profile.account_type === 'broker' && <HighlightsCard title="Broker Highlights" items={[{ icon: '🏦', label: 'Lender', value: profile.company || h.lender },{ icon: '📅', label: 'Experience', value: h.experience },{ icon: '📋', label: 'Loans Closed', value: h.loans_closed },{ icon: '⭐', label: 'Avg Rating', value: h.avg_rating },{ icon: '💰', label: 'Loan Types', value: h.loan_types },{ icon: '⚡', label: 'Avg Close Time', value: h.avg_close_time }]} license={profile.license_number} isOwn={isOwn}/>}
        {profile.account_type === 'landlord' && <HighlightsCard title="Landlord" items={[{ icon: '🏢', label: 'Company', value: profile.company },{ icon: '🏡', label: 'Properties', value: Array.isArray(profile.verified_properties) ? profile.verified_properties.length || 'Claim buildings to show here' : 0 },{ icon: '📅', label: 'On Chathouse since', value: new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) }]} isOwn={isOwn}/>}
        {profile.account_type === 'management' && <HighlightsCard title="Property Management" items={[{ icon: '🏢', label: 'Company', value: profile.company },{ icon: '🏘️', label: 'Portfolio Size', value: Array.isArray(profile.verified_properties) ? profile.verified_properties.length || 'Claim buildings to show here' : 0 },{ icon: '📅', label: 'On Chathouse since', value: new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) }]} isOwn={isOwn}/>}
        {profile.account_type === 'buyer' && profile.looking_for && <div style={styles.card}><div style={{ padding: 24 }}><h2 style={styles.h2}>What I'm looking for</h2><p style={styles.lookingFor}>{profile.looking_for}</p></div></div>}

        <div style={styles.card}>
          <div style={styles.tabRow}>
            <button onClick={() => setActiveTab('updates')} style={{ ...styles.tab, ...(activeTab === 'updates' ? styles.tabActive : {}) }}>📝 Updates {posts.length > 0 && `(${posts.length})`}</button>
            <button onClick={() => setActiveTab('friends')} style={{ ...styles.tab, ...(activeTab === 'friends' ? styles.tabActive : {}) }}>👥 Friends {friends.length > 0 && `(${friends.length})`}</button>
            {isPro && <button onClick={() => setActiveTab('links')} style={{ ...styles.tab, ...(activeTab === 'links' ? styles.tabActive : {}) }}>🔗 Client Links {clientLinksCount > 0 && `(${clientLinksCount})`}</button>}
            {hasReviews && <button onClick={() => setActiveTab('reviews')} style={{ ...styles.tab, ...(activeTab === 'reviews' ? styles.tabActive : {}) }}>⭐ Reviews {reviews.length > 0 && `(${reviews.length})`}</button>}
            <button onClick={() => setActiveTab('achievements')} style={{ ...styles.tab, ...(activeTab === 'achievements' ? styles.tabActive : {}) }}>🏆 Achievements {earnedCount > 0 && `(${earnedCount})`}</button>
            {isOwn && <button onClick={() => setActiveTab('requests')} style={{ ...styles.tab, ...(activeTab === 'requests' ? styles.tabActive : {}) }}>📬 Requests {totalRequests > 0 && <span style={styles.requestBadge}>{totalRequests}</span>}</button>}
          </div>

          <div style={{ padding: '0 24px 24px' }}>

            {/* Updates */}
            {activeTab === 'updates' && (
              <>
                {isOwn && (
                  <div style={styles.composerInner}>
                    <div style={styles.composerAvatar}>{profile.photo_url ? <img src={profile.photo_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}/> : <div style={styles.composerAvatarInitial}>{profile.name?.[0]?.toUpperCase()}</div>}</div>
                    <div style={{ flex: 1 }}>
                      <textarea value={postContent} onChange={e => setPostContent(e.target.value)} placeholder={placeholder} style={styles.composerInput} rows={3}/>
                      {postError && <div style={styles.postError}>{postError}</div>}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                        <button onClick={handlePost} disabled={posting || !postContent.trim()} style={{ ...styles.postBtn, opacity: posting || !postContent.trim() ? 0.5 : 1 }}>{posting ? 'Posting...' : 'Post'}</button>
                      </div>
                    </div>
                  </div>
                )}
                {postsLoading ? <div style={styles.loadingText}>Loading...</div> : posts.length === 0 ? <EmptyState icon="📝" title="No updates yet" sub={isOwn ? 'Share your first update above.' : 'No updates posted yet.'}/> : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                    {posts.map(post => (
                      <div key={post.id} style={styles.postCard}>
                        <div style={styles.postHeader}>
                          <div style={styles.postAvatar}>{profile.photo_url ? <img src={profile.photo_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}/> : <div style={styles.postAvatarInitial}>{profile.name?.[0]?.toUpperCase()}</div>}</div>
                          <div style={{ flex: 1 }}><div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}><span style={styles.postName}>{profile.name}</span><span style={{ ...styles.typeBadge, fontSize: 10, padding: '2px 8px', background: typeMeta.bg, color: typeMeta.color }}>{typeMeta.icon} {typeMeta.label}</span><span style={styles.postTime}>{timeAgo(post.created_at)}</span></div></div>
                          {isOwn && <button onClick={() => handleDeletePost(post.id)} style={styles.deleteBtn}>🗑️</button>}
                        </div>
                        <p style={styles.postContent}>{post.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Friends */}
            {activeTab === 'friends' && (
              <>
                {friendsLoading ? <div style={styles.loadingText}>Loading...</div> : friends.length === 0 ? <EmptyState icon="👥" title="No friends yet" sub={isOwn ? 'Connect with people you meet in listing conversations.' : 'No connections yet.'}/> : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                    {friends.map(friend => {
                      const fm = ACCOUNT_TYPE_LABELS[friend.account_type] || ACCOUNT_TYPE_LABELS.buyer
                      return (
                        <div key={friend.id} style={styles.friendCard}>
                          <Link to={`/profile/${friend.id}`} style={styles.friendLeft}>
                            <div style={styles.friendAvatar}>{friend.photo_url ? <img src={friend.photo_url} alt={friend.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}/> : <div style={styles.friendAvatarInitial}>{friend.name?.[0]?.toUpperCase()}</div>}</div>
                            <div><div style={styles.friendName}>{friend.name}</div>{friend.city && <div style={styles.friendCity}>📍 {friend.city}</div>}<span style={{ ...styles.typeBadge, fontSize: 10, padding: '2px 8px', marginTop: 4, display: 'inline-block', background: fm.bg, color: fm.color }}>{fm.icon} {fm.label}</span></div>
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

            {/* Client Links */}
            {activeTab === 'links' && isPro && (
              <div style={styles.linksTab}>
                <div style={styles.linksCount}>{clientLinksCount}</div>
                <div style={styles.linksTitle}>Active Client Links</div>
                <div style={styles.linksSub}>{profile.account_type === 'agent' ? 'Buyers who have linked this agent to their Chathouse profile' : 'Borrowers who have linked this broker to their Chathouse profile'}</div>
                {(avgRating > 0 || reviews.length > 0) && (
                  <div style={styles.linksStats}>
                    {avgRating > 0 && <div style={styles.linksStat}><div style={styles.linksStatNum}>{avgRating} ⭐</div><div style={styles.linksStatLabel}>Avg rating</div></div>}
                    <div style={styles.linksStat}><div style={styles.linksStatNum}>{reviews.length}</div><div style={styles.linksStatLabel}>Reviews</div></div>
                  </div>
                )}
                <div style={styles.linksPrivacyNote}>🔒 Client details are private. Only you can view who your linked clients are via your dashboard.</div>
              </div>
            )}

            {/* Reviews */}
            {activeTab === 'reviews' && hasReviews && (
              <>
                {reviews.length > 0 && (
                  <div style={styles.reviewSummary}>
                    <div style={styles.reviewAvgNum}>{avgRating}</div>
                    <div>
                      <div style={{ display: 'flex', gap: 2, marginBottom: 4 }}>
                        {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: 16 }}>{s <= Math.round(avgRating) ? '⭐' : '☆'}</span>)}
                      </div>
                      <div style={{ fontSize: 13, color: '#64748b' }}>{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</div>
                    </div>
                  </div>
                )}
                {user && !isOwn && (
                  <div style={{ marginBottom: 16 }}>
                    {!showReviewForm ? (
                      <button onClick={() => setShowReviewForm(true)} style={styles.writeReviewBtn}>
                        {myReview ? '✏️ Edit your review' : '⭐ Write a review'}
                      </button>
                    ) : (
                      <div style={styles.reviewForm}>
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Your rating</div>
                          <div style={{ display: 'flex', gap: 4 }}>
                            {[1,2,3,4,5].map(s => (
                              <button key={s} onClick={() => setReviewRating(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, padding: 2 }}>
                                {s <= reviewRating ? '⭐' : '☆'}
                              </button>
                            ))}
                          </div>
                        </div>
                        <textarea value={reviewContent} onChange={e => setReviewContent(e.target.value)} placeholder={`Share your experience with ${profile.name?.split(' ')[0]}...`} style={{ ...styles.composerInput, marginBottom: 10 }} rows={3}/>
                        {reviewError && <div style={styles.postError}>{reviewError}</div>}
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={submitReview} disabled={submittingReview || !reviewContent.trim()} style={{ ...styles.postBtn, opacity: submittingReview || !reviewContent.trim() ? 0.5 : 1 }}>{submittingReview ? 'Submitting...' : myReview ? 'Update review' : 'Submit review'}</button>
                          <button onClick={() => setShowReviewForm(false)} style={styles.unfriendBtn}>Cancel</button>
                          {myReview && <button onClick={deleteReview} style={{ ...styles.unfriendBtn, color: '#dc2626' }}>Delete</button>}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {reviewsLoading ? <div style={styles.loadingText}>Loading...</div> : reviews.length === 0 ? <EmptyState icon="⭐" title="No reviews yet" sub={isOwn ? 'Reviews from clients and community members will appear here.' : `Be the first to review ${profile.name?.split(' ')[0]}.`}/> : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {reviews.map(review => (
                      <div key={review.id} style={styles.reviewCard}>
                        <div style={styles.postHeader}>
                          <div style={styles.postAvatar}>{review.reviewer?.photo_url ? <img src={review.reviewer.photo_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}/> : <div style={styles.postAvatarInitial}>{review.reviewer?.name?.[0]?.toUpperCase()}</div>}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <Link to={`/profile/${review.reviewer_id}`} style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', textDecoration: 'none' }}>{review.reviewer?.name || 'User'}</Link>
                              <span style={styles.postTime}>{timeAgo(review.created_at)}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 2, marginTop: 3 }}>
                              {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: 12 }}>{s <= review.rating ? '⭐' : '☆'}</span>)}
                            </div>
                          </div>
                        </div>
                        {review.content && <p style={styles.postContent}>{review.content}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Achievements */}
            {activeTab === 'achievements' && (
              <>
                <div style={styles.achievementsIntro}>
                  🏆 <strong>Achievements</strong> — earned by hitting milestones on Chathouse. Displayed publicly on your profile so others can see your track record.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                  {achievements.map(a => (
                    <div key={a.id} style={{ ...styles.achievementCard, background: a.earned ? a.bg : '#f8fafc', border: `1.5px solid ${a.earned ? a.border : '#e2e8f0'}`, opacity: a.earned ? 1 : 0.7 }}>
                      <div style={{ ...styles.achievementIcon, background: a.earned ? a.border : '#e2e8f0' }}>{a.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: a.earned ? '#0f172a' : '#94a3b8' }}>{a.title}</span>
                          {a.earned && <span style={{ fontSize: 11, fontWeight: 700, color: a.earnedColor }}>✓ Earned</span>}
                        </div>
                        <div style={{ fontSize: 12, color: a.earned ? '#475569' : '#94a3b8' }}>{a.desc}</div>
                        {!a.earned && a.progress !== undefined && (
                          <div style={{ marginTop: 6 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginBottom: 3 }}>
                              <span>Progress</span><span>{a.progress}/{a.total}</span>
                            </div>
                            <div style={{ height: 4, background: '#e2e8f0', borderRadius: 2 }}>
                              <div style={{ height: '100%', width: `${(a.progress / a.total) * 100}%`, background: '#1a6cf5', borderRadius: 2 }}/>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Requests */}
            {activeTab === 'requests' && isOwn && (
              <>
                {requestsLoading ? <div style={styles.loadingText}>Loading...</div> : (friendRequests.length === 0 && linkRequests.length === 0) ? <EmptyState icon="📬" title="No pending requests" sub="Friend and link requests will appear here."/> : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 16 }}>
                    {friendRequests.length > 0 && (
                      <div>
                        <div style={styles.requestSectionTitle}>👥 Friend Requests ({friendRequests.length})</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                          {friendRequests.map(req => {
                            const fm = ACCOUNT_TYPE_LABELS[req.requester?.account_type] || ACCOUNT_TYPE_LABELS.buyer
                            return (
                              <div key={req.id} style={styles.requestCard}>
                                <Link to={`/profile/${req.requester_id}`} style={styles.requestLeft}>
                                  <div style={styles.requestAvatar}>{req.requester?.photo_url ? <img src={req.requester.photo_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}/> : <div style={styles.requestAvatarInitial}>{req.requester?.name?.[0]?.toUpperCase()}</div>}</div>
                                  <div><div style={styles.requestName}>{req.requester?.name || 'Unknown'}</div>{req.requester?.city && <div style={styles.requestMeta}>📍 {req.requester.city}</div>}<span style={{ ...styles.typeBadge, fontSize: 10, padding: '2px 8px', marginTop: 4, display: 'inline-block', background: fm.bg, color: fm.color }}>{fm.icon} {fm.label}</span><div style={styles.requestTime}>{timeAgo(req.created_at)}</div></div>
                                </Link>
                                <div style={styles.requestActions}>
                                  <button onClick={() => acceptFriendRequestFromList(req.id)} style={styles.acceptBtn}>✅ Accept</button>
                                  <button onClick={() => declineFriendRequest(req.id)} style={styles.declineBtn}>✕ Decline</button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                    {isPro && linkRequests.length > 0 && (
                      <div>
                        <div style={styles.requestSectionTitle}>🔗 Link Requests ({linkRequests.length})</div>
                        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>These users are requesting you as their {profile.account_type === 'agent' ? 'agent' : 'mortgage broker'}.</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {linkRequests.map(req => {
                            const fm = ACCOUNT_TYPE_LABELS[req.requester?.account_type] || ACCOUNT_TYPE_LABELS.buyer
                            return (
                              <div key={req.id} style={{ ...styles.requestCard, borderLeft: '3px solid #f97316' }}>
                                <Link to={`/profile/${req.lead_user_id}`} style={styles.requestLeft}>
                                  <div style={styles.requestAvatar}>{req.requester?.photo_url ? <img src={req.requester.photo_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}/> : <div style={{ ...styles.requestAvatarInitial, background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>{req.requester?.name?.[0]?.toUpperCase()}</div>}</div>
                                  <div><div style={styles.requestName}>{req.requester?.name || 'Unknown'}</div>{req.requester?.city && <div style={styles.requestMeta}>📍 {req.requester.city}</div>}<span style={{ ...styles.typeBadge, fontSize: 10, padding: '2px 8px', marginTop: 4, display: 'inline-block', background: fm.bg, color: fm.color }}>{fm.icon} {fm.label}</span>{req.message && <div style={styles.requestMessage}>"{req.message}"</div>}<div style={styles.requestTime}>{timeAgo(req.created_at)}</div></div>
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
                <div style={{ ...styles.highlightValue, color: item.value ? '#0f172a' : '#94a3b8', fontStyle: item.value ? 'normal' : 'italic' }}>{item.value || (isOwn ? 'Click Edit profile to add' : '—')}</div>
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
  actionBtn: { padding: '8px 14px', background: '#1a6cf5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', marginTop: 8 },
  bio: { fontSize: 14, color: '#334155', lineHeight: 1.65, whiteSpace: 'pre-wrap' },
  bioPlaceholder: { fontSize: 13, color: '#94a3b8', fontStyle: 'italic' },
  linkForm: { background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: 12, padding: 16, marginBottom: 16, marginTop: 4 },
  linkFormTitle: { fontSize: 13, fontWeight: 700, color: '#c2410c', marginBottom: 10 },
  statsRow: { display: 'flex', gap: 20, marginTop: 16, paddingTop: 16, borderTop: '1px solid #f1f5f9', flexWrap: 'wrap' },
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
  tab: { padding: '14px 12px', background: 'none', border: 'none', fontSize: 12, fontWeight: 600, color: '#64748b', cursor: 'pointer', borderBottom: '2px solid transparent', marginBottom: -2, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 },
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
  linksStatNum: { fontSize: 22, fontWeight: 700, color: '#0f172a' },
  linksStatLabel: { fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 },
  linksPrivacyNote: { fontSize: 13, color: '#475569', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 16px', maxWidth: 420, margin: '0 auto', lineHeight: 1.6 },
  reviewSummary: { display: 'flex', alignItems: 'center', gap: 16, padding: '16px', background: '#fefce8', borderRadius: 12, border: '1px solid #fde68a', marginBottom: 16, marginTop: 16 },
  reviewAvgNum: { fontFamily: 'var(--serif)', fontSize: 48, fontWeight: 900, color: '#92400e', lineHeight: 1 },
  writeReviewBtn: { width: '100%', padding: '12px', background: '#e8f0fe', color: '#1a6cf5', border: '1.5px solid #bfdbfe', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', textAlign: 'center' },
  reviewForm: { background: '#f8fafc', borderRadius: 12, border: '1.5px solid #e2e8f0', padding: 16, marginBottom: 16 },
  reviewCard: { padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' },
  achievementsIntro: { fontSize: 13, color: '#92400e', background: '#fefce8', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 16px', marginTop: 16, lineHeight: 1.6 },
  achievementCard: { display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px', borderRadius: 12 },
  achievementIcon: { width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 },
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
