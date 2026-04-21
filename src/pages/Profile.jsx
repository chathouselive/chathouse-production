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
  buyer: 'Share what you\'re looking for or your experience so far...',
}

export default function Profile() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { profile, loading } = useProfile(userId)
  const isOwn = user?.id === userId

  const [activeTab, setActiveTab] = useState('updates')
  const [posts, setPosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [postContent, setPostContent] = useState('')
  const [posting, setPosting] = useState(false)
  const [postError, setPostError] = useState('')

  useEffect(() => {
    if (!userId) return
    fetchPosts()
  }, [userId])

  async function fetchPosts() {
    setPostsLoading(true)
    const { data, error } = await supabase
      .from('profile_posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (!error) setPosts(data || [])
    setPostsLoading(false)
  }

  async function handlePost() {
    if (!postContent.trim()) return
    setPostError('')
    setPosting(true)
    const { error } = await supabase
      .from('profile_posts')
      .insert({ user_id: user.id, content: postContent.trim() })
    setPosting(false)
    if (error) {
      setPostError('Failed to post. Please try again.')
    } else {
      setPostContent('')
      fetchPosts()
    }
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
              {isOwn && (
                <button onClick={() => navigate('/profile/edit')} style={styles.editBtn}>
                  ✏️ Edit profile
                </button>
              )}
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
              {profile.account_type === 'agent' && h.deals_closed && (
                <div style={styles.stat}>
                  <div style={styles.statNum}>{h.deals_closed}</div>
                  <div style={styles.statLabel}>Deals</div>
                </div>
              )}
              {profile.account_type === 'agent' && h.avg_rating && (
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
          <HighlightsCard
            title="Agent Highlights"
            items={[
              { icon: '🏙️', label: 'Market', value: h.market },
              { icon: '📅', label: 'Experience', value: h.experience },
              { icon: '🏠', label: 'Deals Closed', value: h.deals_closed },
              { icon: '⭐', label: 'Avg Rating', value: h.avg_rating },
              { icon: '🏢', label: 'Brokerage', value: profile.company || h.brokerage },
              { icon: '🎓', label: 'Specialty', value: h.specialty },
            ]}
            license={profile.license_number}
            isOwn={isOwn}
          />
        )}

        {profile.account_type === 'broker' && (
          <HighlightsCard
            title="Broker Highlights"
            items={[
              { icon: '🏦', label: 'Lender', value: profile.company || h.lender },
              { icon: '📅', label: 'Experience', value: h.experience },
              { icon: '📋', label: 'Loans Closed', value: h.loans_closed },
              { icon: '⭐', label: 'Avg Rating', value: h.avg_rating },
              { icon: '💰', label: 'Loan Types', value: h.loan_types },
              { icon: '⚡', label: 'Avg Close Time', value: h.avg_close_time },
            ]}
            license={profile.license_number}
            isOwn={isOwn}
          />
        )}

        {profile.account_type === 'landlord' && (
          <HighlightsCard
            title="Landlord"
            items={[
              { icon: '🏢', label: 'Company', value: profile.company },
              { icon: '🏡', label: 'Properties', value: Array.isArray(profile.verified_properties) ? profile.verified_properties.length || 'Claim buildings to show here' : 0 },
              { icon: '📅', label: 'On Chathouse since', value: new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) },
            ]}
            isOwn={isOwn}
          />
        )}

        {profile.account_type === 'management' && (
          <HighlightsCard
            title="Property Management"
            items={[
              { icon: '🏢', label: 'Company', value: profile.company },
              { icon: '🏘️', label: 'Portfolio Size', value: Array.isArray(profile.verified_properties) ? profile.verified_properties.length || 'Claim buildings to show here' : 0 },
              { icon: '📅', label: 'On Chathouse since', value: new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) },
            ]}
            isOwn={isOwn}
          />
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
            <button
              onClick={() => setActiveTab('updates')}
              style={{ ...styles.tab, ...(activeTab === 'updates' ? styles.tabActive : {}) }}
            >
              📝 Updates {posts.length > 0 && `(${posts.length})`}
            </button>
          </div>

          <div style={{ padding: '0 24px 24px' }}>
            {activeTab === 'updates' && (
              <>
                {/* Composer — only show on own profile */}
                {isOwn && (
                  <div style={styles.composer}>
                    <div style={styles.composerInner}>
                      <div style={styles.composerAvatar}>
                        {profile.photo_url ? (
                          <img src={profile.photo_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}/>
                        ) : (
                          <div style={styles.composerAvatarInitial}>{profile.name?.[0]?.toUpperCase()}</div>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <textarea
                          value={postContent}
                          onChange={e => setPostContent(e.target.value)}
                          placeholder={placeholder}
                          style={styles.composerInput}
                          rows={3}
                        />
                        {postError && <div style={styles.postError}>{postError}</div>}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                          <button
                            onClick={handlePost}
                            disabled={posting || !postContent.trim()}
                            style={{
                              ...styles.postBtn,
                              opacity: posting || !postContent.trim() ? 0.5 : 1,
                            }}
                          >
                            {posting ? 'Posting...' : 'Post'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Posts feed */}
                {postsLoading ? (
                  <div style={{ textAlign: 'center', padding: 30, color: '#64748b', fontSize: 13 }}>Loading...</div>
                ) : posts.length === 0 ? (
                  <div style={styles.emptyPosts}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📝</div>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4, fontSize: 15 }}>No updates yet</div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>
                      {isOwn ? 'Share your first update above.' : 'This user hasn\'t posted any updates yet.'}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: isOwn ? 16 : 0 }}>
                    {posts.map(post => (
                      <div key={post.id} style={styles.postCard}>
                        <div style={styles.postHeader}>
                          <div style={styles.postAvatar}>
                            {profile.photo_url ? (
                              <img src={profile.photo_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}/>
                            ) : (
                              <div style={styles.postAvatarInitial}>{profile.name?.[0]?.toUpperCase()}</div>
                            )}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <span style={styles.postName}>{profile.name}</span>
                              <span style={{ ...styles.typeBadge, ...styles.postBadge, background: typeMeta.bg, color: typeMeta.color }}>
                                {typeMeta.icon} {typeMeta.label}
                              </span>
                              <span style={styles.postTime}>{timeAgo(post.created_at)}</span>
                            </div>
                          </div>
                          {isOwn && (
                            <button onClick={() => handleDeletePost(post.id)} style={styles.deleteBtn} title="Delete post">
                              🗑️
                            </button>
                          )}
                        </div>
                        <p style={styles.postContent}>{post.content}</p>
                      </div>
                    ))}
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

function HighlightsCard({ title, items, license, isOwn }) {
  return (
    <div style={styles.card}>
      <div style={{ padding: 24 }}>
        <h2 style={styles.h2}>{title}</h2>
        {license && (
          <div style={{ marginBottom: 14, fontSize: 12, color: '#64748b' }}>
            License #: <strong>{license}</strong>
          </div>
        )}
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
  editBtn: { marginTop: 36, padding: '8px 14px', background: '#f1f5f9', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#475569', cursor: 'pointer' },
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

  // Tabs
  tabRow: { display: 'flex', gap: 0, borderBottom: '1.5px solid #e2e8f0', padding: '0 24px' },
  tab: { padding: '14px 16px', background: 'none', border: 'none', fontSize: 13, fontWeight: 600, color: '#64748b', cursor: 'pointer', borderBottom: '2px solid transparent', marginBottom: -2 },
  tabActive: { color: '#1a6cf5', borderBottomColor: '#1a6cf5' },

  // Composer
  composer: { marginBottom: 4 },
  composerInner: { display: 'flex', gap: 12, alignItems: 'flex-start', padding: '16px 0 12px', borderBottom: '1px solid #f1f5f9' },
  composerAvatar: { width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(135deg, #1a6cf5, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  composerAvatarInitial: { color: '#fff', fontSize: 16, fontWeight: 700 },
  composerInput: { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, color: '#0f172a', outline: 'none', resize: 'vertical', fontFamily: 'inherit', background: '#f8fafc', boxSizing: 'border-box' },
  postBtn: { padding: '8px 20px', background: '#1a6cf5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  postError: { fontSize: 12, color: '#dc2626', marginTop: 6 },

  // Posts
  postCard: { padding: '16px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' },
  postHeader: { display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  postAvatar: { width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(135deg, #1a6cf5, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  postAvatarInitial: { color: '#fff', fontSize: 14, fontWeight: 700 },
  postName: { fontSize: 13, fontWeight: 700, color: '#0f172a' },
  postBadge: { fontSize: 10, padding: '2px 8px' },
  postTime: { fontSize: 11, color: '#94a3b8' },
  postContent: { fontSize: 14, color: '#334155', lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap' },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, opacity: 0.5, padding: 4, marginLeft: 'auto' },

  emptyPosts: { textAlign: 'center', padding: '40px 20px', background: '#f8fafc', borderRadius: 12, margin: '8px 0' },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 80, color: '#64748b' },
  spinner: { width: 36, height: 36, borderRadius: '50%', border: '3px solid #e8f0fe', borderTop: '3px solid #1a6cf5', animation: 'spin 0.8s linear infinite' },
}
