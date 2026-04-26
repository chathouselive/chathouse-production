import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import TopNav from '../components/TopNav'
import Footer from '../components/Footer'
import { useProfile } from '../lib/useProfile'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

/* ============================================================
   Inline SVG icons — matching TopNav style
   viewBox 0 0 24 24, stroke=currentColor, strokeWidth 2
   ============================================================ */
const Icon = {
  Pencil: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
  ),
  Trash: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
    </svg>
  ),
  Users: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Link: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  ),
  Star: ({ size = 14, filled = false }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  Trophy: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>
  ),
  Pin: ({ size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Document: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  Calendar: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Building: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="6" x2="9" y2="6"/><line x1="15" y1="6" x2="15" y2="6"/><line x1="9" y1="10" x2="9" y2="10"/><line x1="15" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="9" y2="14"/><line x1="15" y1="14" x2="15" y2="14"/><path d="M10 22v-4h4v4"/>
    </svg>
  ),
  Home: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Briefcase: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  ),
  GradCap: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  ),
  Dollar: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  Bolt: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Search: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  BellOn: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  BellOff: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/><path d="M18.63 13A17.89 17.89 0 0 1 18 8"/><path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"/><path d="M18 8a6 6 0 0 0-9.33-5"/><line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ),
  Check: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  X: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Message: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  Inbox: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
    </svg>
  ),
  Lock: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  Clock: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  ArrowLeft: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
    </svg>
  ),
  Medal: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="15" r="6"/><path d="M9 9.5L7 2h10l-2 7.5"/>
    </svg>
  ),
  /* POLISH: verified checkmark — solid blue with white check inside */
  Verified: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2.5c.6 0 1.18.18 1.66.52l1.34.95c.27.19.6.29.93.27l1.64-.07c1.18-.05 2.18.85 2.23 2.03l.07 1.64c.01.33.13.65.33.91l1 1.3a2.13 2.13 0 0 1 0 2.6l-1 1.3c-.2.26-.32.58-.33.91l-.07 1.64c-.05 1.18-1.05 2.08-2.23 2.03l-1.64-.07c-.33-.02-.66.08-.93.27l-1.34.95a2.13 2.13 0 0 1-2.32 0l-1.34-.95a1.59 1.59 0 0 0-.93-.27l-1.64.07c-1.18.05-2.18-.85-2.23-2.03l-.07-1.64a1.59 1.59 0 0 0-.33-.91l-1-1.3a2.13 2.13 0 0 1 0-2.6l1-1.3c.2-.26.32-.58.33-.91l.07-1.64c.05-1.18 1.05-2.08 2.23-2.03l1.64.07c.33.02.66-.08.93-.27l1.34-.95A2.13 2.13 0 0 1 12 2.5Z" fill="#1a6cf5"/>
      <path d="m8.5 12 2.5 2.5L15.5 9.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  ),
}

/* ============================================================
   Role pill — matches TopNav exactly
   ============================================================ */
const ROLE_STYLES = {
  buyer:      { label: 'Buyer / Renter',  bg: '#f1f5f9', fg: '#475569' },
  renter:     { label: 'Renter',          bg: '#f1f5f9', fg: '#475569' },
  agent:      { label: 'Agent',           bg: '#dbeafe', fg: '#1d4ed8' },
  broker:     { label: 'Mortgage Broker', bg: '#ede9fe', fg: '#6d28d9' },
  landlord:   { label: 'Landlord',        bg: '#dcfce7', fg: '#15803d' },
  management: { label: 'Property Manager',bg: '#ffedd5', fg: '#c2410c' },
}

function RolePill({ accountType, size = 'md' }) {
  const style = ROLE_STYLES[accountType] || ROLE_STYLES.buyer
  const dims = size === 'sm'
    ? { padding: '2px 8px', fontSize: 10 }
    : { padding: '4px 10px', fontSize: 11 }
  return (
    <span style={{
      display: 'inline-block',
      borderRadius: 100,
      fontWeight: 700,
      letterSpacing: 0.3,
      textTransform: 'uppercase',
      background: style.bg,
      color: style.fg,
      ...dims,
    }}>
      {style.label}
    </span>
  )
}

/* ============================================================
   Avatar — matches TopNav exactly
   ============================================================ */
function Avatar({ profile, size = 32 }) {
  if (profile?.photo_url) {
    return <img src={profile.photo_url} alt={profile.name} style={{
      width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, display: 'block',
    }}/>
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, #1a6cf5, #f97316)',
      color: '#fff',
      fontSize: size <= 32 ? 13 : size <= 48 ? 18 : 28,
      fontWeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {profile?.name?.[0]?.toUpperCase() || '?'}
    </div>
  )
}

/* ============================================================
   POLISH: format created_at as "Member since Mar 2025"
   ============================================================ */
function formatJoinedDate(isoString) {
  if (!isoString) return null
  try {
    return new Date(isoString).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  } catch {
    return null
  }
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
    all.push({ id: 'first_link', icon: <Icon.Trophy size={20}/>, title: 'First Link', desc: 'Got your first client link', earned: clientLinks >= 1, bg: '#fefce8', border: '#fde68a', earnedColor: '#92400e' })
    all.push({ id: '5_links', icon: <Icon.Medal size={20}/>, title: '5 Client Links', desc: '5 buyers linked your profile', earned: clientLinks >= 5, progress: Math.min(clientLinks, 5), total: 5, bg: '#f0fdf4', border: '#bbf7d0', earnedColor: '#166534' })
    all.push({ id: '10_links', icon: <Icon.Medal size={20}/>, title: '10 Client Links', desc: '10 buyers linked your profile', earned: clientLinks >= 10, progress: Math.min(clientLinks, 10), total: 10, bg: '#eff6ff', border: '#bfdbfe', earnedColor: '#1e40af' })
    all.push({ id: '25_links', icon: <Icon.Star size={20}/>, title: '25 Client Links', desc: '25 buyers linked your profile', earned: clientLinks >= 25, progress: Math.min(clientLinks, 25), total: 25, bg: '#fdf4ff', border: '#e9d5ff', earnedColor: '#6b21a8' })
    all.push({ id: 'top_rated', icon: <Icon.Star size={20} filled/>, title: 'Top Rated', desc: 'Achieved a 4.5+ star rating', earned: avgRating >= 4.5, bg: '#fefce8', border: '#fde68a', earnedColor: '#92400e' })
  }
  if (accountType === 'management') {
    all.push({ id: 'first_claim', icon: <Icon.Building size={20}/>, title: 'First Claim', desc: 'Claimed your first building', earned: claimedProperties >= 1, bg: '#fefce8', border: '#fde68a', earnedColor: '#92400e' })
    all.push({ id: '5_buildings', icon: <Icon.Building size={20}/>, title: '5 Buildings', desc: 'Claimed 5 properties', earned: claimedProperties >= 5, progress: Math.min(claimedProperties, 5), total: 5, bg: '#f0fdf4', border: '#bbf7d0', earnedColor: '#166534' })
    all.push({ id: 'top_rated_mgmt', icon: <Icon.Star size={20} filled/>, title: 'Top Rated', desc: 'Achieved a 4.5+ star rating', earned: avgRating >= 4.5, bg: '#fefce8', border: '#fde68a', earnedColor: '#92400e' })
  }
  all.push({ id: 'first_comment', icon: <Icon.Message size={20}/>, title: 'First Comment', desc: 'Left your first comment on a listing', earned: firstComment, bg: '#eff6ff', border: '#bfdbfe', earnedColor: '#1e40af' })
  all.push({ id: 'explorer', icon: <Icon.Search size={20}/>, title: 'Explorer', desc: 'Commented on 5+ different listings', earned: commentedListings >= 5, progress: Math.min(commentedListings, 5), total: 5, bg: '#f0fdf4', border: '#bbf7d0', earnedColor: '#166534' })
  all.push({ id: 'community_voice', icon: <Icon.Message size={20}/>, title: 'Community Voice', desc: 'Received 50+ comment likes', earned: commentLikes >= 50, progress: Math.min(commentLikes, 50), total: 50, bg: '#fdf4ff', border: '#e9d5ff', earnedColor: '#6b21a8' })
  all.push({ id: 'connected', icon: <Icon.Users size={20}/>, title: 'Connected', desc: 'Made your first friend connection', earned: friendCount >= 1, bg: '#fff3e8', border: '#fed7aa', earnedColor: '#c2410c' })
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
  /* POLISH: verified = pro role with a license number on file */
  const isVerified = isPro && !!profile?.license_number

  const [activeTab, setActiveTab] = useState('updates')

  const [posts, setPosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [postContent, setPostContent] = useState('')
  const [posting, setPosting] = useState(false)
  const [postError, setPostError] = useState('')

  const [friends, setFriends] = useState([])
  const [friendsLoading, setFriendsLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState(null)
  const [connectionId, setConnectionId] = useState(null)

  const [followingFriends, setFollowingFriends] = useState({})

  const [linkStatus, setLinkStatus] = useState(null)
  const [showLinkForm, setShowLinkForm] = useState(false)
  const [linkMessage, setLinkMessage] = useState('')
  const [sendingLink, setSendingLink] = useState(false)

  const [clientLinksCount, setClientLinksCount] = useState(0)

  const [friendRequests, setFriendRequests] = useState([])
  const [linkRequests, setLinkRequests] = useState([])
  const [requestsLoading, setRequestsLoading] = useState(true)

  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [avgRating, setAvgRating] = useState(0)
  const [myReview, setMyReview] = useState(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewContent, setReviewContent] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [showReviewForm, setShowReviewForm] = useState(false)

  const [achievementStats, setAchievementStats] = useState({ clientLinks: 0, commentLikes: 0, avgRating: 0, firstComment: false, commentedListings: 0, friendCount: 0, claimedProperties: 0 })

  useEffect(() => {
    if (!userId) return
    fetchPosts()
    fetchFriends()
    if (user && !isOwn) checkConnectionStatus()
    if (user && isOwn) fetchFollowPreferences()
  }, [userId, user])

  useEffect(() => {
    if (profile) {
      if (isPro) fetchClientLinksCount()
      if (hasReviews) fetchReviews()
      fetchAchievementStats()
      if (user && !isOwn) checkLinkStatus()
      if (user && isOwn) fetchRequests()
    }
  }, [profile])

  async function fetchClientLinksCount() {
    const { count } = await supabase
      .from('representation_requests')
      .select('*', { count: 'exact', head: true })
      .eq('agent_id', userId)
      .eq('status', 'accepted')
    setClientLinksCount(count || 0)
  }

  async function checkLinkStatus() {
    if (!user) return
    const { data } = await supabase
      .from('representation_requests')
      .select('id, status, agent_id, lead_user_id')
      .or(`and(agent_id.eq.${userId},lead_user_id.eq.${user.id}),and(agent_id.eq.${user.id},lead_user_id.eq.${userId})`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
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
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'link_request',
        title: `${viewerProfile?.name?.split(' ')[0] || 'Someone'} wants to link with you`,
        body: linkMessage.trim() || null,
        related_user_id: user.id,
        related_url: `/profile/${user.id}`,
      })
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
      { count: claimedProps },
      { count: linksCount }
    ] = await Promise.all([
      supabase.from('comments').select('id, listing_id').eq('user_id', userId),
      supabase.from('connections').select('*', { count: 'exact', head: true }).or(`requester_id.eq.${userId},recipient_id.eq.${userId}`).eq('status', 'accepted'),
      supabase.from('listings').select('*', { count: 'exact', head: true }).eq('claimed_by', userId),
      supabase.from('representation_requests').select('*', { count: 'exact', head: true }).eq('agent_id', userId).eq('status', 'accepted'),
    ])
    let commentLikes = 0
    if (userComments && userComments.length > 0) {
      const commentIds = userComments.map(c => c.id)
      const { count } = await supabase.from('comment_likes').select('*', { count: 'exact', head: true }).in('comment_id', commentIds)
      commentLikes = count || 0
    }
    const uniqueListings = new Set(userComments?.map(c => c.listing_id) || []).size
    setAchievementStats({
      clientLinks: linksCount || 0,
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

  async function fetchFollowPreferences() {
    if (!user) return
    const { data } = await supabase
      .from('connections')
      .select('id, notify_on_post')
      .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .eq('status', 'accepted')
    if (data) {
      const map = {}
      data.forEach(c => { map[c.id] = c.notify_on_post || false })
      setFollowingFriends(map)
    }
  }

  async function toggleFollowFriend(connectionId, currentValue) {
    const newValue = !currentValue
    await supabase.from('connections').update({ notify_on_post: newValue }).eq('id', connectionId)
    setFollowingFriends(prev => ({ ...prev, [connectionId]: newValue }))
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
    const { data } = await supabase.from('connections').select('id, status, requester_id').or(`and(requester_id.eq.${user.id},recipient_id.eq.${userId}),and(requester_id.eq.${userId},recipient_id.eq.${user.id})`).maybeSingle()
    if (data) { setConnectionId(data.id); if (data.status === 'accepted') setConnectionStatus('accepted'); else if (data.requester_id === user.id) setConnectionStatus('sent'); else setConnectionStatus('pending') }
  }

  async function unlinkRequest() {
    const proName = profile.name?.split(' ')[0]
    const confirmed = window.confirm(`Are you sure you want to unlink from ${proName}? This will remove the client relationship on both sides.`)
    if (!confirmed) return

    const { error } = await supabase
      .from('representation_requests')
      .delete()
      .or(`and(agent_id.eq.${userId},lead_user_id.eq.${user.id}),and(agent_id.eq.${user.id},lead_user_id.eq.${userId})`)

    if (error) {
      console.error('[Profile] unlink failed:', error)
      return
    }

    setLinkStatus(null)
    if (isPro || ['agent','broker'].includes(viewerProfile?.account_type)) {
      fetchClientLinksCount()
    }
  }

  async function sendFriendRequest() {
    if (!user) return
    const { data, error } = await supabase.from('connections').insert({ requester_id: user.id, recipient_id: userId, status: 'pending', connection_type: 'friend' }).select().single()
    if (!error && data) {
      setConnectionStatus('sent')
      setConnectionId(data.id)
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'friend_request',
        title: `${viewerProfile?.name?.split(' ')[0] || 'Someone'} sent you a friend request`,
        related_user_id: user.id,
        related_url: `/profile/${user.id}`,
      })
    }
  }

  async function acceptFriendRequest() { if (!connectionId) return; await supabase.from('connections').update({ status: 'accepted' }).eq('id', connectionId); setConnectionStatus('accepted'); fetchFriends() }
  async function acceptFriendRequestFromList(connId) { await supabase.from('connections').update({ status: 'accepted' }).eq('id', connId); setFriendRequests(prev => prev.filter(r => r.id !== connId)); fetchFriends() }
  async function declineFriendRequest(connId) { await supabase.from('connections').delete().eq('id', connId); setFriendRequests(prev => prev.filter(r => r.id !== connId)) }
  async function acceptLinkRequest(reqId) { await supabase.from('representation_requests').update({ status: 'accepted', responded_at: new Date().toISOString() }).eq('id', reqId); setLinkRequests(prev => prev.filter(r => r.id !== reqId)); fetchClientLinksCount() }
  async function declineLinkRequest(reqId) { await supabase.from('representation_requests').update({ status: 'declined', responded_at: new Date().toISOString() }).eq('id', reqId); setLinkRequests(prev => prev.filter(r => r.id !== reqId)) }
  async function unfriend(connId) { await supabase.from('connections').delete().eq('id', connId); setFriends(prev => prev.filter(f => f.connectionId !== connId)); if (connId === connectionId) setConnectionStatus(null) }

  async function handlePost() {
    if (!postContent.trim()) return
    setPostError('')
    setPosting(true)
    const { error } = await supabase.from('profile_posts').insert({ user_id: user.id, content: postContent.trim() })
    setPosting(false)
    if (error) { setPostError('Failed to post.'); return }
    setPostContent('')
    fetchPosts()

    const { data: followers } = await supabase
      .from('connections')
      .select('requester_id, recipient_id')
      .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .eq('status', 'accepted')
      .eq('notify_on_post', true)

    if (followers && followers.length > 0) {
      const notifs = followers.map(f => ({
        user_id: f.requester_id === user.id ? f.recipient_id : f.requester_id,
        type: 'profile_update',
        title: `${profile?.name?.split(' ')[0] || 'Someone'} posted a new update`,
        body: postContent.trim().length > 60 ? postContent.trim().slice(0, 60) + '...' : postContent.trim(),
        related_user_id: user.id,
        related_url: `/profile/${user.id}`,
      }))
      await supabase.from('notifications').insert(notifs)
    }
  }

  async function handleDeletePost(postId) { await supabase.from('profile_posts').delete().eq('id', postId); setPosts(prev => prev.filter(p => p.id !== postId)) }

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000), hours = Math.floor(diff / 3600000), days = Math.floor(diff / 86400000)
    if (mins < 1) return 'just now'; if (mins < 60) return `${mins}m ago`; if (hours < 24) return `${hours}h ago`; if (days < 7) return `${days}d ago`
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (loading) return (<div style={{ minHeight: '100vh', background: '#f8fafc' }}><TopNav /><div style={styles.center}><div style={styles.spinner}/></div></div>)
  if (!profile) return (<div style={{ minHeight: '100vh', background: '#f8fafc' }}><TopNav /><div style={styles.center}>Profile not found. <Link to="/listings" style={{ color: '#1a6cf5', marginLeft: 6 }}>Go home</Link></div></div>)

  const h = profile.highlights || {}
  const placeholder = POST_PLACEHOLDERS[profile.account_type] || POST_PLACEHOLDERS.buyer
  const totalRequests = friendRequests.length + linkRequests.length
  const achievements = getAchievements(profile.account_type, { ...achievementStats, clientLinks: clientLinksCount, avgRating, friendCount: friends.length })
  const earnedCount = achievements.filter(a => a.earned).length
  /* POLISH: pre-compute the joined-date string once */
  const joinedDate = formatJoinedDate(profile.created_at)
  /* POLISH: buyer-only flag — used for "Moving in" relocation into looking-for card */
  const isBuyer = profile.account_type === 'buyer' || profile.account_type === 'renter'

  const TabButton = ({ id, icon, label, count, hasBadge }) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{ ...styles.tab, ...(activeTab === id ? styles.tabActive : {}) }}
    >
      <span style={{ display: 'flex', alignItems: 'center', color: activeTab === id ? '#1a6cf5' : '#64748b' }}>{icon}</span>
      {label}
      {count > 0 && !hasBadge && <span style={styles.tabCount}>({count})</span>}
      {hasBadge && count > 0 && <span style={styles.requestBadge}>{count}</span>}
    </button>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <TopNav />
      <div style={styles.page}>
        <Link to="/listings" style={styles.back}>
          <Icon.ArrowLeft size={13}/> Back
        </Link>

        {/* ========== Header card ========== */}
        <div style={styles.card}>
          <div style={styles.banner}/>

          <div style={styles.headerInner}>
            {/* Avatar — overlaps banner from below */}
            <div style={styles.avatarWrap}>
              <Avatar profile={profile} size={96}/>
            </div>

            {/* Name + metadata + actions row */}
            <div style={styles.identityRow}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={styles.nameLine}>
                  <h1 style={styles.name}>{profile.name}</h1>
                  {/* POLISH: verified checkmark — only for pros with a license number */}
                  {isVerified && (
                    <span
                      style={styles.verifiedWrap}
                      title="Verified — license number on file"
                      aria-label="Verified — license number on file"
                    >
                      <Icon.Verified size={18}/>
                    </span>
                  )}
                  {profile.is_admin && <span style={styles.adminBadge}>ADMIN</span>}
                </div>

                <div style={styles.metaLine}>
                  <RolePill accountType={profile.account_type}/>
                  {profile.city && (
                    <span style={styles.metaText}>
                      <Icon.Pin size={12}/> {profile.city}
                    </span>
                  )}
                </div>
                {joinedDate && (
                  <div style={styles.metaSecondary}>
                    Member since {joinedDate}
                  </div>
                )}
              </div>

              {/* Action buttons cluster */}
              <div style={styles.actionsCluster}>
                {isOwn && (
                  <button onClick={() => navigate('/profile/edit')} style={styles.editBtn}>
                    <Icon.Pencil size={13}/> Edit profile
                  </button>
                )}
                {!isOwn && user && (
                  <>
                    <Link to={`/messages?user=${userId}`} style={{ ...styles.actionBtn, ...styles.actionBtnSecondary }}>
                      <Icon.Message size={13}/> Message
                    </Link>

                    {connectionStatus === null && (
                      <button onClick={sendFriendRequest} style={styles.actionBtn}>
                        <Icon.Users size={13}/> Add Friend
                      </button>
                    )}
                    {connectionStatus === 'sent' && (
                      <button disabled style={{ ...styles.actionBtn, ...styles.actionBtnDisabled }}>
                        <Icon.Clock size={13}/> Request Sent
                      </button>
                    )}
                    {connectionStatus === 'pending' && (
                      <button onClick={acceptFriendRequest} style={{ ...styles.actionBtn, background: '#16a34a' }}>
                        <Icon.Check size={13}/> Accept Request
                      </button>
                    )}
                    {connectionStatus === 'accepted' && (
                      <button onClick={() => unfriend(connectionId)} style={{ ...styles.actionBtn, ...styles.actionBtnSecondary }}>
                        <Icon.Users size={13}/> Friends
                      </button>
                    )}

                    {(() => {
                      const viewerIsPro = ['agent','broker'].includes(viewerProfile?.account_type)
                      const targetIsManagement = profile.account_type === 'management'
                      const showLink = viewerIsPro ? !targetIsManagement : isPro
                      if (!showLink) return null
                      return (
                        <>
                          {linkStatus === null && (
                            <button onClick={() => setShowLinkForm(f => !f)} style={{ ...styles.actionBtn, background: '#f97316' }}>
                              <Icon.Link size={13}/> Request Link
                            </button>
                          )}
                          {linkStatus === 'sent' && (
                            <button disabled style={{ ...styles.actionBtn, ...styles.actionBtnDisabled }}>
                              <Icon.Clock size={13}/> Link Requested
                            </button>
                          )}
                          {linkStatus === 'accepted' && (
                            <button onClick={unlinkRequest} style={{ ...styles.actionBtn, background: '#f0fdf4', color: '#16a34a', borderWidth: 1, borderStyle: 'solid', borderColor: '#bbf7d0' }}>
                              <Icon.Link size={13}/> Linked
                            </button>
                          )}
                        </>
                      )
                    })()}
                  </>
                )}
              </div>
            </div>

            {/* Inline link request form */}
            {showLinkForm && !isOwn && (
              <div style={styles.linkForm}>
                <div style={styles.linkFormTitle}>
                  Request {profile.name?.split(' ')[0]} as your {profile.account_type === 'agent' ? 'agent' : 'mortgage broker'}
                </div>
                <textarea
                  value={linkMessage}
                  onChange={e => setLinkMessage(e.target.value)}
                  placeholder="Optional: introduce yourself or explain what you're looking for..."
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

            {/* Bio */}
            {profile.bio
              ? <p style={styles.bio}>{profile.bio}</p>
              : isOwn ? <p style={styles.bioPlaceholder}>Add a bio so others know who you are.</p> : null}

            {/* Stats row */}
            <div style={styles.statsRow}>
              <div style={styles.stat}><div style={styles.statNum}>{posts.length}</div><div style={styles.statLabel}>Updates</div></div>
              <div style={styles.stat}><div style={styles.statNum}>{friends.length}</div><div style={styles.statLabel}>Friends</div></div>
              {isPro && <div style={styles.stat}><div style={styles.statNum}>{clientLinksCount}</div><div style={styles.statLabel}>Clients</div></div>}
              {hasReviews && avgRating > 0 && (
                <div style={styles.stat}>
                  <div style={{ ...styles.statNum, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {avgRating}<Icon.Star size={14} filled/>
                  </div>
                  <div style={styles.statLabel}>Rating</div>
                </div>
              )}
              {hasReviews && <div style={styles.stat}><div style={styles.statNum}>{reviews.length}</div><div style={styles.statLabel}>Reviews</div></div>}
              <div style={styles.stat}><div style={styles.statNum}>{earnedCount}</div><div style={styles.statLabel}>Badges</div></div>
            </div>
          </div>
        </div>

        {/* ========== Highlights cards ========== */}
        {profile.account_type === 'agent' && <HighlightsCard title="Agent Highlights" items={[
          { icon: <Icon.Building/>, label: 'Market', value: h.market },
          { icon: <Icon.Calendar/>, label: 'Experience', value: h.experience },
          { icon: <Icon.Home/>, label: 'Deals Closed', value: h.deals_closed },
          { icon: <Icon.Star/>, label: 'Avg Rating', value: h.avg_rating },
          { icon: <Icon.Briefcase/>, label: 'Brokerage', value: profile.company || h.brokerage },
          { icon: <Icon.GradCap/>, label: 'Specialty', value: h.specialty }
        ]} license={profile.license_number} isOwn={isOwn}/>}

        {profile.account_type === 'broker' && <HighlightsCard title="Broker Highlights" items={[
          { icon: <Icon.Briefcase/>, label: 'Lender', value: profile.company || h.lender },
          { icon: <Icon.Calendar/>, label: 'Experience', value: h.experience },
          { icon: <Icon.Document/>, label: 'Loans Closed', value: h.loans_closed },
          { icon: <Icon.Star/>, label: 'Avg Rating', value: h.avg_rating },
          { icon: <Icon.Dollar/>, label: 'Loan Types', value: h.loan_types },
          { icon: <Icon.Bolt/>, label: 'Avg Close Time', value: h.avg_close_time }
        ]} license={profile.license_number} isOwn={isOwn}/>}

        {profile.account_type === 'landlord' && <HighlightsCard title="Landlord" items={[
          { icon: <Icon.Briefcase/>, label: 'Company', value: profile.company },
          { icon: <Icon.Home/>, label: 'Properties', value: Array.isArray(profile.verified_properties) ? profile.verified_properties.length || 'Claim buildings to show here' : 0 },
          { icon: <Icon.Calendar/>, label: 'On Chathouse since', value: new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) }
        ]} isOwn={isOwn}/>}

        {profile.account_type === 'management' && <HighlightsCard title="Property Management" items={[
          { icon: <Icon.Briefcase/>, label: 'Company', value: profile.company },
          { icon: <Icon.Building/>, label: 'Portfolio Size', value: Array.isArray(profile.verified_properties) ? profile.verified_properties.length || 'Claim buildings to show here' : 0 },
          { icon: <Icon.Calendar/>, label: 'On Chathouse since', value: new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) }
        ]} isOwn={isOwn}/>}

        {/* POLISH: buyer card now hosts the "Moving in" timeline */}
        {isBuyer && (profile.looking_for || profile.move_timeline) && (
          <div style={styles.card}>
            <div style={{ padding: 24 }}>
              <h2 style={styles.h2}>What I'm looking for</h2>
              {profile.move_timeline && (
                <div style={styles.timelineRow}>
                  <Icon.Clock size={13}/>
                  <span>Moving in {profile.move_timeline}</span>
                </div>
              )}
              {profile.looking_for && <p style={styles.lookingFor}>{profile.looking_for}</p>}
            </div>
          </div>
        )}

        {/* ========== Tabs card ========== */}
        <div style={styles.card}>
          <div style={styles.tabRow}>
            <TabButton id="updates" icon={<Icon.Document/>} label="Updates" count={posts.length}/>
            <TabButton id="friends" icon={<Icon.Users/>} label="Friends" count={friends.length}/>
            {isPro && <TabButton id="links" icon={<Icon.Link/>} label="Client Links" count={clientLinksCount}/>}
            {hasReviews && <TabButton id="reviews" icon={<Icon.Star/>} label="Reviews" count={reviews.length}/>}
            <TabButton id="achievements" icon={<Icon.Trophy/>} label="Achievements" count={earnedCount}/>
            {isOwn && <TabButton id="requests" icon={<Icon.Inbox/>} label="Requests" count={totalRequests} hasBadge/>}
          </div>

          <div style={{ padding: '0 24px 24px' }}>

            {/* Updates */}
            {activeTab === 'updates' && (
              <>
                {isOwn && (
                  <div style={styles.composerInner}>
                    <Avatar profile={profile} size={38}/>
                    <div style={{ flex: 1 }}>
                      <textarea value={postContent} onChange={e => setPostContent(e.target.value)} placeholder={placeholder} style={styles.composerInput} rows={3}/>
                      {postError && <div style={styles.postError}>{postError}</div>}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                        <button onClick={handlePost} disabled={posting || !postContent.trim()} style={{ ...styles.postBtn, opacity: posting || !postContent.trim() ? 0.5 : 1 }}>{posting ? 'Posting...' : 'Post'}</button>
                      </div>
                    </div>
                  </div>
                )}
                {postsLoading
                  ? <div style={styles.loadingText}>Loading...</div>
                  : posts.length === 0
                    ? <EmptyState icon={<Icon.Document size={28}/>} title="No updates yet" sub={isOwn ? 'Share your first update above.' : 'No updates posted yet.'}/>
                    : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                        {posts.map(post => (
                          <div key={post.id} style={styles.postCard}>
                            <div style={styles.postHeader}>
                              <Avatar profile={profile} size={36}/>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                  <span style={styles.postName}>{profile.name}</span>
                                  <RolePill accountType={profile.account_type} size="sm"/>
                                  <span style={styles.postTime}>{timeAgo(post.created_at)}</span>
                                </div>
                              </div>
                              {isOwn && (
                                <button onClick={() => handleDeletePost(post.id)} style={styles.deleteBtn} aria-label="Delete post">
                                  <Icon.Trash/>
                                </button>
                              )}
                            </div>
                            <p style={styles.postContent}>{post.content}</p>
                          </div>
                        ))}
                      </div>
                    )
                }
              </>
            )}

            {/* Friends */}
            {activeTab === 'friends' && (
              <>
                {friendsLoading
                  ? <div style={styles.loadingText}>Loading...</div>
                  : friends.length === 0
                    ? <EmptyState icon={<Icon.Users size={28}/>} title="No friends yet" sub={isOwn ? 'Connect with people you meet in listing conversations.' : 'No connections yet.'}/>
                    : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                        {friends.map(friend => (
                          <div key={friend.id} style={styles.friendCard}>
                            <Link to={`/profile/${friend.id}`} style={styles.friendLeft}>
                              <Avatar profile={friend} size={48}/>
                              <div>
                                <div style={styles.friendName}>{friend.name}</div>
                                {friend.city && (
                                  <div style={styles.friendCity}>
                                    <Icon.Pin size={11}/> {friend.city}
                                  </div>
                                )}
                                <div style={{ marginTop: 4 }}>
                                  <RolePill accountType={friend.account_type} size="sm"/>
                                </div>
                              </div>
                            </Link>
                            <div style={styles.friendActions}>
                              <Link to={`/messages?user=${friend.id}`} style={styles.messageBtn}>
                                <Icon.Message size={12}/> Message
                              </Link>
                              {isOwn && (
                                <button
                                  onClick={() => toggleFollowFriend(friend.connectionId, followingFriends[friend.connectionId])}
                                  style={{
                                    ...styles.unfriendBtn,
                                    color: followingFriends[friend.connectionId] ? '#1a6cf5' : '#94a3b8',
                                    background: followingFriends[friend.connectionId] ? '#e8f0fe' : '#f1f5f9',
                                  }}
                                  title={followingFriends[friend.connectionId] ? 'Turn off post notifications' : 'Get notified when they post'}
                                >
                                  {followingFriends[friend.connectionId] ? <Icon.BellOn size={12}/> : <Icon.BellOff size={12}/>}
                                  {followingFriends[friend.connectionId] ? 'Notifying' : 'Notify me'}
                                </button>
                              )}
                              {isOwn && <button onClick={() => unfriend(friend.connectionId)} style={styles.unfriendBtn}>Unfriend</button>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                }
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
                    {avgRating > 0 && (
                      <div style={styles.linksStat}>
                        <div style={{ ...styles.linksStatNum, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          {avgRating}<Icon.Star size={14} filled/>
                        </div>
                        <div style={styles.linksStatLabel}>Avg rating</div>
                      </div>
                    )}
                    <div style={styles.linksStat}>
                      <div style={styles.linksStatNum}>{reviews.length}</div>
                      <div style={styles.linksStatLabel}>Reviews</div>
                    </div>
                  </div>
                )}
                <div style={styles.linksPrivacyNote}>
                  <Icon.Lock size={13}/> Client details are private. Only you can view who your linked clients are via your dashboard.
                </div>
              </div>
            )}

            {/* Reviews */}
            {activeTab === 'reviews' && hasReviews && (
              <>
                {reviews.length > 0 && (
                  <div style={styles.reviewSummary}>
                    <div style={styles.reviewAvgNum}>{avgRating}</div>
                    <div>
                      <div style={{ display: 'flex', gap: 2, marginBottom: 4, color: '#f59e0b' }}>
                        {[1,2,3,4,5].map(s => <Icon.Star key={s} size={16} filled={s <= Math.round(avgRating)}/>)}
                      </div>
                      <div style={{ fontSize: 13, color: '#64748b' }}>{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</div>
                    </div>
                  </div>
                )}
                {user && !isOwn && (
                  <div style={{ marginBottom: 16, marginTop: reviews.length > 0 ? 0 : 16 }}>
                    {!showReviewForm ? (
                      <button onClick={() => setShowReviewForm(true)} style={styles.writeReviewBtn}>
                        {myReview ? <><Icon.Pencil size={13}/> Edit your review</> : <><Icon.Star size={13}/> Write a review</>}
                      </button>
                    ) : (
                      <div style={styles.reviewForm}>
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Your rating</div>
                          <div style={{ display: 'flex', gap: 4, color: '#f59e0b' }}>
                            {[1,2,3,4,5].map(s => (
                              <button key={s} onClick={() => setReviewRating(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'inherit', display: 'flex' }}>
                                <Icon.Star size={22} filled={s <= reviewRating}/>
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
                {reviewsLoading
                  ? <div style={styles.loadingText}>Loading...</div>
                  : reviews.length === 0
                    ? <EmptyState icon={<Icon.Star size={28}/>} title="No reviews yet" sub={isOwn ? 'Reviews from clients and community members will appear here.' : `Be the first to review ${profile.name?.split(' ')[0]}.`}/>
                    : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {reviews.map(review => (
                          <div key={review.id} style={styles.reviewCard}>
                            <div style={styles.postHeader}>
                              <Avatar profile={review.reviewer} size={36}/>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                  <Link to={`/profile/${review.reviewer_id}`} style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', textDecoration: 'none' }}>{review.reviewer?.name || 'User'}</Link>
                                  <span style={styles.postTime}>{timeAgo(review.created_at)}</span>
                                </div>
                                <div style={{ display: 'flex', gap: 2, marginTop: 4, color: '#f59e0b' }}>
                                  {[1,2,3,4,5].map(s => <Icon.Star key={s} size={12} filled={s <= review.rating}/>)}
                                </div>
                              </div>
                            </div>
                            {review.content && <p style={styles.postContent}>{review.content}</p>}
                          </div>
                        ))}
                      </div>
                    )
                }
              </>
            )}

            {/* Achievements */}
            {activeTab === 'achievements' && (
              <>
                <div style={styles.achievementsIntro}>
                  <Icon.Trophy size={14}/> <strong style={{ marginLeft: 4 }}>Achievements</strong> are earned by hitting milestones on Chathouse. Displayed publicly on your profile so others can see your track record.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                  {achievements.map(a => (
                    <div key={a.id} style={{
                      ...styles.achievementCard,
                      background: a.earned ? a.bg : '#f8fafc',
                      borderWidth: 1.5,
                      borderStyle: 'solid',
                      borderColor: a.earned ? a.border : '#e2e8f0',
                      opacity: a.earned ? 1 : 0.7,
                    }}>
                      <div style={{
                        ...styles.achievementIcon,
                        background: a.earned ? a.border : '#e2e8f0',
                        color: a.earned ? a.earnedColor : '#94a3b8',
                      }}>{a.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: a.earned ? '#0f172a' : '#94a3b8' }}>{a.title}</span>
                          {a.earned && (
                            <span style={{ fontSize: 11, fontWeight: 700, color: a.earnedColor, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                              <Icon.Check size={11}/> Earned
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: a.earned ? '#475569' : '#94a3b8' }}>{a.desc}</div>
                        {!a.earned && a.progress !== undefined && (
                          <div style={{ marginTop: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>
                              <span>Progress</span><span>{a.progress}/{a.total}</span>
                            </div>
                            <div style={{ height: 4, background: '#e2e8f0', borderRadius: 2 }}>
                              <div style={{ height: '100%', width: `${(a.progress / a.total) * 100}%`, background: '#1a6cf5', borderRadius: 2, transition: 'width 200ms ease' }}/>
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
                {requestsLoading
                  ? <div style={styles.loadingText}>Loading...</div>
                  : (friendRequests.length === 0 && linkRequests.length === 0)
                    ? <EmptyState icon={<Icon.Inbox size={28}/>} title="No pending requests" sub="Friend and link requests will appear here."/>
                    : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 16 }}>
                        {friendRequests.length > 0 && (
                          <div>
                            <div style={styles.requestSectionTitle}>
                              <Icon.Users size={14}/> Friend Requests ({friendRequests.length})
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                              {friendRequests.map(req => (
                                <div key={req.id} style={styles.requestCard}>
                                  <Link to={`/profile/${req.requester_id}`} style={styles.requestLeft}>
                                    <Avatar profile={req.requester} size={44}/>
                                    <div>
                                      <div style={styles.requestName}>{req.requester?.name || 'Unknown'}</div>
                                      {req.requester?.city && (
                                        <div style={styles.requestMeta}>
                                          <Icon.Pin size={11}/> {req.requester.city}
                                        </div>
                                      )}
                                      <div style={{ marginTop: 4 }}>
                                        <RolePill accountType={req.requester?.account_type} size="sm"/>
                                      </div>
                                      <div style={styles.requestTime}>{timeAgo(req.created_at)}</div>
                                    </div>
                                  </Link>
                                  <div style={styles.requestActions}>
                                    <button onClick={() => acceptFriendRequestFromList(req.id)} style={styles.acceptBtn}>
                                      <Icon.Check size={12}/> Accept
                                    </button>
                                    <button onClick={() => declineFriendRequest(req.id)} style={styles.declineBtn}>
                                      <Icon.X size={12}/> Decline
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {isPro && linkRequests.length > 0 && (
                          <div>
                            <div style={styles.requestSectionTitle}>
                              <Icon.Link size={14}/> Link Requests ({linkRequests.length})
                            </div>
                            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10, marginTop: 4 }}>
                              These users are requesting you as their {profile.account_type === 'agent' ? 'agent' : 'mortgage broker'}.
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                              {linkRequests.map(req => (
                                <div key={req.id} style={{ ...styles.requestCard, borderLeft: '3px solid #f97316' }}>
                                  <Link to={`/profile/${req.lead_user_id}`} style={styles.requestLeft}>
                                    <Avatar profile={req.requester} size={44}/>
                                    <div>
                                      <div style={styles.requestName}>{req.requester?.name || 'Unknown'}</div>
                                      {req.requester?.city && (
                                        <div style={styles.requestMeta}>
                                          <Icon.Pin size={11}/> {req.requester.city}
                                        </div>
                                      )}
                                      <div style={{ marginTop: 4 }}>
                                        <RolePill accountType={req.requester?.account_type} size="sm"/>
                                      </div>
                                      {req.message && <div style={styles.requestMessage}>"{req.message}"</div>}
                                      <div style={styles.requestTime}>{timeAgo(req.created_at)}</div>
                                    </div>
                                  </Link>
                                  <div style={styles.requestActions}>
                                    <button onClick={() => acceptLinkRequest(req.id)} style={styles.acceptBtn}>
                                      <Icon.Check size={12}/> Accept
                                    </button>
                                    <button onClick={() => declineLinkRequest(req.id)} style={styles.declineBtn}>
                                      <Icon.X size={12}/> Decline
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                }
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
    <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f8fafc', borderRadius: 12, margin: '16px 0', color: '#94a3b8' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>{icon}</div>
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
              <span style={{ display: 'flex', color: '#64748b', flexShrink: 0 }}>{item.icon}</span>
              <div style={{ minWidth: 0 }}>
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
  back: { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', marginBottom: 16, textDecoration: 'none', fontWeight: 600 },
  card: { background: '#fff', borderRadius: 16, borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0', overflow: 'hidden', marginBottom: 16, boxShadow: '0 1px 8px rgba(0,0,0,0.04)' },

  /* Header card pieces */
  banner: { height: 64, background: 'linear-gradient(135deg, #1a6cf5, #7c3aed)' },
  headerInner: { padding: '0 24px 24px' },
  avatarWrap: { flexShrink: 0, borderRadius: '50%', borderWidth: 4, borderStyle: 'solid', borderColor: '#fff', boxShadow: '0 2px 12px rgba(15,23,42,0.08)', marginTop: -48, width: 'fit-content', marginBottom: 16 },
  identityRow: { display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 16 },
  nameLine: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  name: { fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1.2, letterSpacing: '-0.01em' },
  /* POLISH: tight wrapper so the verified icon aligns optically with name */
  verifiedWrap: { display: 'inline-flex', alignItems: 'center', lineHeight: 0 },
  metaLine: { display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, flexWrap: 'wrap' },
  actionsCluster: { display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', flexShrink: 0 },

  adminBadge: { fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 4, background: '#0f172a', color: '#fff', letterSpacing: 0.5 },
  metaText: { fontSize: 12, color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: 4 },
  metaSecondary: { fontSize: 12, color: '#94a3b8', marginTop: 6 },
  timelineRow: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#475569', marginBottom: 12 },

  editBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#f1f5f9', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#475569', cursor: 'pointer', transition: 'background 120ms ease, color 120ms ease' },
  actionBtn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 14px', background: '#1a6cf5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', transition: 'background 120ms ease, color 120ms ease' },
  actionBtnSecondary: { background: '#f1f5f9', color: '#0f172a' },
  actionBtnDisabled: { background: '#f1f5f9', color: '#94a3b8', cursor: 'default' },

  bio: { fontSize: 14, color: '#334155', lineHeight: 1.65, whiteSpace: 'pre-wrap', margin: '0 0 4px' },
  bioPlaceholder: { fontSize: 13, color: '#94a3b8', fontStyle: 'italic', margin: '0 0 4px' },

  linkForm: { background: '#fff7ed', borderWidth: 1, borderStyle: 'solid', borderColor: '#fed7aa', borderRadius: 12, padding: 16, marginBottom: 16, marginTop: 4 },
  linkFormTitle: { fontSize: 13, fontWeight: 700, color: '#c2410c', marginBottom: 10 },

  statsRow: { display: 'flex', gap: 24, marginTop: 16, paddingTop: 16, borderTop: '1px solid #f1f5f9', flexWrap: 'wrap' },
  stat: { textAlign: 'center', minWidth: 56 },
  statNum: { fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 },
  statLabel: { fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },

  h2: { fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 700, color: '#0f172a', margin: '0 0 14px' },
  lookingFor: { fontSize: 14, color: '#334155', lineHeight: 1.6, padding: 12, background: '#f8fafc', borderRadius: 10, borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0', margin: 0 },

  highlightsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 },
  highlight: { display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: '#f8fafc', borderRadius: 10, borderWidth: 1, borderStyle: 'solid', borderColor: '#f1f5f9' },
  highlightLabel: { fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3 },
  highlightValue: { fontSize: 13, fontWeight: 600, marginTop: 2 },

  tabRow: { display: 'flex', gap: 0, borderBottom: '1.5px solid #e2e8f0', padding: '0 24px', overflowX: 'auto' },
  tab: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '14px 12px', background: 'none', border: 'none', fontSize: 12, fontWeight: 600, color: '#64748b', cursor: 'pointer', borderBottom: '2px solid transparent', marginBottom: -2, whiteSpace: 'nowrap', transition: 'color 120ms ease, border-color 120ms ease' },
  tabActive: { color: '#1a6cf5', borderBottomColor: '#1a6cf5' },
  tabCount: { color: '#94a3b8', fontWeight: 600 },
  requestBadge: { background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 100, marginLeft: 2 },

  composerInner: { display: 'flex', gap: 12, alignItems: 'flex-start', padding: '16px 0 12px', borderBottom: '1px solid #f1f5f9' },
  composerInput: { width: '100%', padding: '10px 14px', borderWidth: 1.5, borderStyle: 'solid', borderColor: '#e2e8f0', borderRadius: 10, fontSize: 14, color: '#0f172a', outline: 'none', resize: 'vertical', fontFamily: 'inherit', background: '#f8fafc', boxSizing: 'border-box' },
  postBtn: { padding: '8px 20px', background: '#1a6cf5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'background 120ms ease' },
  postError: { fontSize: 12, color: '#dc2626', marginTop: 6 },

  postCard: { padding: 16, background: '#f8fafc', borderRadius: 12, borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0' },
  postHeader: { display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  postName: { fontSize: 13, fontWeight: 700, color: '#0f172a' },
  postTime: { fontSize: 11, color: '#94a3b8' },
  postContent: { fontSize: 14, color: '#334155', lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap' },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: '#94a3b8', display: 'flex', alignItems: 'center', borderRadius: 6, transition: 'color 120ms ease, background 120ms ease' },

  loadingText: { textAlign: 'center', padding: 30, color: '#64748b', fontSize: 13 },

  friendCard: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, background: '#f8fafc', borderRadius: 12, borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0', gap: 12, flexWrap: 'wrap' },
  friendLeft: { display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', flex: 1, minWidth: 0 },
  friendName: { fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 2 },
  friendCity: { fontSize: 12, color: '#64748b', marginBottom: 2, display: 'inline-flex', alignItems: 'center', gap: 4 },
  friendActions: { display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 },
  messageBtn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '8px 14px', background: '#e8f0fe', color: '#1a6cf5', borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none' },
  unfriendBtn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '8px 14px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'background 120ms ease, color 120ms ease' },

  linksTab: { textAlign: 'center', padding: '32px 20px' },
  linksCount: { fontFamily: 'var(--serif)', fontSize: 64, fontWeight: 900, color: '#16a34a', lineHeight: 1, marginBottom: 8 },
  linksTitle: { fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8 },
  linksSub: { fontSize: 14, color: '#64748b', maxWidth: 360, margin: '0 auto 20px', lineHeight: 1.6 },
  linksStats: { display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 20 },
  linksStat: { textAlign: 'center' },
  linksStatNum: { fontSize: 22, fontWeight: 700, color: '#0f172a' },
  linksStatLabel: { fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 },
  linksPrivacyNote: { display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475569', background: '#f0fdf4', borderWidth: 1, borderStyle: 'solid', borderColor: '#bbf7d0', borderRadius: 10, padding: '12px 16px', maxWidth: 460, margin: '0 auto', lineHeight: 1.6, textAlign: 'left' },

  reviewSummary: { display: 'flex', alignItems: 'center', gap: 16, padding: '16px', background: '#fefce8', borderRadius: 12, borderWidth: 1, borderStyle: 'solid', borderColor: '#fde68a', marginBottom: 16, marginTop: 16 },
  reviewAvgNum: { fontFamily: 'var(--serif)', fontSize: 48, fontWeight: 900, color: '#92400e', lineHeight: 1 },
  writeReviewBtn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '12px', background: '#e8f0fe', color: '#1a6cf5', borderWidth: 1.5, borderStyle: 'solid', borderColor: '#bfdbfe', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  reviewForm: { background: '#f8fafc', borderRadius: 12, borderWidth: 1.5, borderStyle: 'solid', borderColor: '#e2e8f0', padding: 16, marginBottom: 16 },
  reviewCard: { padding: 16, background: '#f8fafc', borderRadius: 12, borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0' },

  achievementsIntro: { display: 'flex', alignItems: 'center', fontSize: 13, color: '#92400e', background: '#fefce8', borderWidth: 1, borderStyle: 'solid', borderColor: '#fde68a', borderRadius: 10, padding: '12px 16px', marginTop: 16, lineHeight: 1.6 },
  achievementCard: { display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px', borderRadius: 12 },
  achievementIcon: { width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },

  requestSectionTitle: { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 4 },
  requestCard: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: 16, background: '#f8fafc', borderRadius: 12, borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0', gap: 12, flexWrap: 'wrap' },
  requestLeft: { display: 'flex', alignItems: 'flex-start', gap: 12, textDecoration: 'none', flex: 1, minWidth: 0 },
  requestName: { fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 2 },
  requestMeta: { fontSize: 12, color: '#64748b', marginBottom: 2, display: 'inline-flex', alignItems: 'center', gap: 4 },
  requestMessage: { fontSize: 12, color: '#475569', fontStyle: 'italic', marginTop: 6, background: '#fff', padding: '6px 10px', borderRadius: 8, borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0' },
  requestTime: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
  requestActions: { display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 },
  acceptBtn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '8px 14px', background: '#dcfce7', color: '#16a34a', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' },
  declineBtn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '8px 14px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' },

  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 80, color: '#64748b' },
  spinner: { width: 36, height: 36, borderRadius: '50%', borderWidth: 3, borderStyle: 'solid', borderColor: '#e8f0fe', borderTopColor: '#1a6cf5', animation: 'chathouseSpin 0.8s linear infinite' },
}

/* Inject spinner keyframes once */
if (typeof document !== 'undefined' && !document.getElementById('chathouse-profile-anim')) {
  const styleEl = document.createElement('style')
  styleEl.id = 'chathouse-profile-anim'
  styleEl.textContent = `@keyframes chathouseSpin { to { transform: rotate(360deg); } }`
  document.head.appendChild(styleEl)
}