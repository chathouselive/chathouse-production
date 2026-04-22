import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import TopNav from '../components/TopNav'
import Comment from '../components/Comment'
import CommentForm from '../components/CommentForm'
import VerifyTenantModal from '../components/VerifyTenantModal'
import Footer from '../components/Footer'
import { useListing } from '../lib/useListings'
import { useComments } from '../lib/useComments'
import { useVerification } from '../lib/useVerification'
import { getListingImage } from '../lib/streetView'
import { useAuth } from '../lib/AuthContext'
import { toggleListingLike, getListingLikeStatus } from '../lib/useListings'

export default function ListingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const { listing, loading } = useListing(id)
  const { comments, loading: loadingComments, postComment, toggleLike } = useComments(id)
  const { status: verificationStatus, submitVerification } = useVerification(id)
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [claimSubmitted, setClaimSubmitted] = useState(false)

  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [liking, setLiking] = useState(false)

  useEffect(() => {
    if (listing) setLikeCount(listing.likes_count || 0)
  }, [listing])

  useEffect(() => {
    if (user && listing) {
      getListingLikeStatus(listing.id, user.id).then(setLiked)
    }
  }, [user, listing])

  async function handleLike() {
    if (!user) { navigate('/signin'); return }
    if (liking) return
    setLiking(true)
    const result = await toggleListingLike(listing.id, user.id, liked, likeCount)
    setLiked(result.liked)
    setLikeCount(result.count)
    setLiking(false)
  }

  async function handleClaim() {
    if (!user) { navigate('/signin'); return }
    if (!listing?.id) { alert('Listing not loaded yet'); return }
    setClaiming(true)
    try {
      const { error } = await supabase.from('listing_claims').insert({
        listing_id: Number(listing.id),
        user_id: user.id,
        status: 'pending',
      })
      if (error) {
        alert('Claim failed: ' + error.message)
      } else {
        setClaimSubmitted(true)
      }
    } catch (err) {
      alert('Unexpected error: ' + err.message)
    } finally {
      setClaiming(false)
    }
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

  if (!listing) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <TopNav />
      <div style={styles.center}>
        <div>Listing not found. <Link to="/listings">Go back</Link></div>
      </div>
    </div>
  )

  const img = getListingImage(listing)
  const priceStr = listing.price
    ? (listing.type === 'rent' ? `$${Number(listing.price).toLocaleString()}/mo` : `$${Number(listing.price).toLocaleString()}`)
    : 'Price not listed'
  const isCommunity = listing.source === 'community'
  const isIDX = listing.source === 'idx'

  const FAKE_COMMENTS = [
    { id: 'f1', role: 'Past Tenant', text: 'Lived here for 2 years. The building management is incredibly responsive and...' },
    { id: 'f2', role: 'Neighbor', text: 'Great block, very quiet at night. The only thing I would mention is that parking...' },
    { id: 'f3', role: 'Current Resident', text: 'Moved in 6 months ago. Honestly one of the best decisions I made. The super...' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <TopNav />

      <div style={styles.page}>
        <Link to="/listings" style={styles.back}>← Back to listings</Link>

        <div style={styles.imgWrap}>
          <img src={img} alt={listing.address} style={styles.img}
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600">
                  <rect width="1200" height="600" fill="#e8f0fe"/>
                  <text x="50%" y="50%" font-family="system-ui" font-size="120" fill="#1a6cf5" text-anchor="middle" dy=".3em">🏠</text>
                </svg>
              `)
            }}
          />
          <div style={{ ...styles.tag, background: listing.tag_color || '#1a6cf5' }}>
            {listing.tag || (listing.type === 'rent' ? 'For Rent' : 'For Sale')}
          </div>
          {isCommunity && <div style={styles.communityBadge}>🏘️ Community Listed</div>}
          {isIDX && <div style={styles.idxBadge}>IDX</div>}
        </div>

        <div style={styles.header}>
          <div style={styles.priceRow}>
            <div style={{ flex: 1 }}>
              <div style={styles.price}>{priceStr}</div>
              <div style={styles.address}>{listing.address}</div>
              <div style={styles.hood}>📍 {listing.hood || listing.city}{listing.state ? `, ${listing.state}` : ''}</div>
            </div>
            {/* Like button on detail page */}
            <button onClick={handleLike} style={{ ...styles.likeBtn, color: liked ? '#ef4444' : '#94a3b8' }}>
              <span style={{ fontSize: 24 }}>{liked ? '❤️' : '🤍'}</span>
              <span style={styles.likeBtnCount}>{likeCount}</span>
            </button>
          </div>

          <div style={styles.specs}>
            {listing.beds != null && <div style={styles.spec}><strong>{listing.beds}</strong> beds</div>}
            {listing.baths != null && <div style={styles.spec}><strong>{listing.baths}</strong> baths</div>}
            {listing.sqft != null && <div style={styles.spec}><strong>{Number(listing.sqft).toLocaleString()}</strong> sqft</div>}
          </div>

          {listing.description && (
            <p style={styles.desc}>{listing.description}</p>
          )}

          {/* Claim listing button — for landlords and property managers */}
          {user && ['landlord', 'management'].includes(profile?.account_type) && !listing.claimed_by && (
            <div style={{ marginTop: 12 }}>
              {claimSubmitted ? (
                <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, fontSize: 13, color: '#16a34a', fontWeight: 600 }}>
                  ✅ Claim submitted — we'll review and verify your ownership within 24–48 hours.
                </div>
              ) : (
                <button onClick={handleClaim} disabled={claiming} style={{ padding: '10px 18px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: claiming ? 'default' : 'pointer', opacity: claiming ? 0.6 : 1 }}>
                  {claiming ? 'Submitting...' : '🏠 Claim this listing'}
                </button>
              )}
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>Is this your property? Claim it to respond to comments and upload photos.</div>
            </div>
          )}
          {listing.claimed_by && (
            <div style={{ marginTop: 12, padding: '8px 12px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, fontSize: 12, color: '#16a34a', fontWeight: 600, display: 'inline-block' }}>
              ✅ Claimed by owner
            </div>
          )}

          {isIDX && (
            <div style={styles.idxCompliance}>
              <div style={styles.idxComplianceTop}>
                <div style={styles.idxLogoBox}>
                  <span style={styles.idxLogoText}>IDX</span>
                </div>
                <div style={styles.fairHousingBox}>
                  <span style={styles.fairHousingIcon}>⚖️</span>
                  <span style={styles.fairHousingText}>Equal Housing Opportunity</span>
                </div>
              </div>
              {listing.listing_office && (
                <div style={styles.listingOffice}>
                  <span style={styles.listingOfficeLabel}>Listing provided by: </span>
                  <span style={styles.listingOfficeName}>{listing.listing_office}</span>
                  {listing.listing_agent && (
                    <span style={styles.listingAgentName}> · {listing.listing_agent}</span>
                  )}
                </div>
              )}
              <p style={styles.idxDisclaimer}>
                The data relating to real estate for sale on this website comes in part from the Internet Data Exchange (IDX) program of the New Jersey Multiple Listing Service (NJMLS). Real estate listings held by brokerage firms other than Chathouse are marked with the IDX logo and detailed information about them includes the name of the listing broker. Information is deemed reliable but is not guaranteed accurate by NJMLS or Chathouse. All information should be independently verified. © {new Date().getFullYear()} New Jersey Multiple Listing Service. All rights reserved.
              </p>
              <p style={styles.idxUpdated}>
                Last updated: {listing.updated_at ? new Date(listing.updated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Recently'}
              </p>
            </div>
          )}
        </div>

        {/* Fair Housing strip */}
        <div style={styles.fairHousingStrip}>
          <span style={styles.fairHousingStripIcon}>⚖️</span>
          <span style={styles.fairHousingStripText}>
            We are committed to the Fair Housing Act. <Link to="/fair-housing" style={styles.fairHousingStripLink}>Learn more</Link>
          </span>
        </div>

        {/* Community section */}
        <div style={styles.commentsSection}>
          <div style={styles.commentsHead}>
            <h2 style={styles.h2}>Community</h2>
            <p style={styles.sub}>Honest comments from people who know this building.</p>
          </div>

          {!user ? (
            <div style={styles.gateWrap}>
              <div style={styles.blurredComments}>
                {FAKE_COMMENTS.map(c => (
                  <div key={c.id} style={styles.fakeComment}>
                    <div style={styles.fakeCommentHeader}>
                      <span style={styles.fakeRoleBadge}>{c.role}</span>
                    </div>
                    <p style={styles.fakeCommentText}>{c.text}</p>
                  </div>
                ))}
              </div>
              <div style={styles.gateOverlay}>
                <div style={styles.gateCard}>
                  <div style={styles.gateIcon}>💬</div>
                  <h3 style={styles.gateTitle}>Join the conversation</h3>
                  <p style={styles.gateSub}>
                    Read what verified tenants, neighbors, and past buyers are saying about this address — before you sign anything.
                  </p>
                  <div style={styles.gateButtons}>
                    <Link to="/signup" style={styles.gateSignUp}>Sign up free →</Link>
                    <Link to="/signin" style={styles.gateSignIn}>Sign in</Link>
                  </div>
                  <p style={styles.gateFine}>Free for buyers, renters, and neighbors · Always will be</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <CommentForm
                onSubmit={postComment}
                verificationStatus={verificationStatus}
                onOpenVerify={() => setShowVerifyModal(true)}
              />
              {loadingComments ? (
                <div style={{ textAlign: 'center', padding: 30, color: '#64748b', fontSize: 13 }}>Loading comments...</div>
              ) : comments.length === 0 ? (
                <div style={styles.empty}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>💬</div>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Be the first to comment</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>Share what you know about this building — past tenant, current resident, or neighbor.</div>
                </div>
              ) : (
                <div>
                  {comments.map(c => <Comment key={c.id} comment={c} onLike={toggleLike} />)}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />

      {showVerifyModal && (
        <VerifyTenantModal
          listing={listing}
          onClose={() => setShowVerifyModal(false)}
          onSubmit={submitVerification}
        />
      )}
    </div>
  )
}

const styles = {
  page: { maxWidth: 860, margin: '0 auto', padding: '24px 20px 60px' },
  back: { display: 'inline-block', fontSize: 13, color: '#64748b', marginBottom: 16, textDecoration: 'none', fontWeight: 600 },
  imgWrap: { position: 'relative', borderRadius: 16, overflow: 'hidden', marginBottom: 20, background: '#f1f5f9' },
  img: { width: '100%', height: 'auto', maxHeight: 480, objectFit: 'cover', display: 'block' },
  tag: { position: 'absolute', top: 16, right: 16, padding: '5px 14px', borderRadius: 100, color: '#fff', fontSize: 12, fontWeight: 700 },
  communityBadge: { position: 'absolute', top: 16, left: 16, padding: '5px 12px', background: 'rgba(124,58,237,0.9)', borderRadius: 100, color: '#fff', fontSize: 11, fontWeight: 700 },
  idxBadge: { position: 'absolute', top: 16, left: 16, padding: '5px 12px', background: 'rgba(26,108,245,0.9)', borderRadius: 100, color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: 1 },
  header: { padding: 24, background: '#fff', borderRadius: 16, border: '1.5px solid #e2e8f0', marginBottom: 12 },
  priceRow: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, gap: 12 },
  price: { fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 700, color: '#0f172a', marginBottom: 4 },
  address: { fontSize: 16, color: '#334155', marginBottom: 4 },
  hood: { fontSize: 13, color: '#64748b' },
  likeBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: 'none', border: 'none', cursor: 'pointer', padding: '8px 12px', borderRadius: 12, flexShrink: 0 },
  likeBtnCount: { fontSize: 12, fontWeight: 600, color: '#64748b' },
  specs: { display: 'flex', gap: 20, padding: '14px 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', marginBottom: 14 },
  spec: { fontSize: 13, color: '#64748b' },
  desc: { fontSize: 14, color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap' },
  idxCompliance: { marginTop: 16, padding: '16px', background: '#f8fafc', borderRadius: 12, border: '1.5px solid #e2e8f0' },
  idxComplianceTop: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' },
  idxLogoBox: { background: '#1a6cf5', borderRadius: 6, padding: '3px 10px' },
  idxLogoText: { color: '#fff', fontSize: 11, fontWeight: 800, letterSpacing: 1 },
  fairHousingBox: { display: 'flex', alignItems: 'center', gap: 5 },
  fairHousingIcon: { fontSize: 14 },
  fairHousingText: { fontSize: 11, fontWeight: 700, color: '#475569' },
  listingOffice: { fontSize: 12, color: '#475569', marginBottom: 8 },
  listingOfficeLabel: { color: '#94a3b8' },
  listingOfficeName: { fontWeight: 700, color: '#334155' },
  listingAgentName: { color: '#334155' },
  idxDisclaimer: { fontSize: 11, color: '#94a3b8', lineHeight: 1.65, margin: '8px 0 4px' },
  idxUpdated: { fontSize: 11, color: '#94a3b8', margin: 0 },
  fairHousingStrip: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'rgba(26,108,245,0.06)', border: '1.5px solid rgba(26,108,245,0.15)', borderRadius: 10, marginBottom: 12 },
  fairHousingStripIcon: { fontSize: 14 },
  fairHousingStripText: { fontSize: 12, color: '#475569' },
  fairHousingStripLink: { color: '#1a6cf5', fontWeight: 700, textDecoration: 'none' },
  commentsSection: { padding: 24, background: '#fff', borderRadius: 16, border: '1.5px solid #e2e8f0' },
  commentsHead: { marginBottom: 16 },
  h2: { fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 4 },
  sub: { fontSize: 13, color: '#64748b' },
  empty: { textAlign: 'center', padding: 40, background: '#f8fafc', borderRadius: 12 },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 80 },
  spinner: { width: 36, height: 36, borderRadius: '50%', border: '3px solid #e8f0fe', borderTop: '3px solid #1a6cf5', animation: 'spin 0.8s linear infinite' },
  gateWrap: { position: 'relative', borderRadius: 12, overflow: 'hidden', minHeight: 320 },
  blurredComments: { display: 'flex', flexDirection: 'column', gap: 12, filter: 'blur(4px)', userSelect: 'none', pointerEvents: 'none', opacity: 0.7 },
  fakeComment: { padding: '14px 16px', background: '#f8fafc', borderRadius: 10, borderLeft: '3px solid #1a6cf5' },
  fakeCommentHeader: { marginBottom: 6 },
  fakeRoleBadge: { fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: '#e8f0fe', color: '#1a6cf5' },
  fakeCommentText: { fontSize: 13, color: '#334155', lineHeight: 1.55, fontStyle: 'italic', margin: 0 },
  gateOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.97) 40%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
  gateCard: { textAlign: 'center', maxWidth: 400, padding: '32px 28px', background: '#fff', borderRadius: 20, border: '1.5px solid #e2e8f0', boxShadow: '0 8px 32px rgba(26,108,245,0.1)' },
  gateIcon: { fontSize: 40, marginBottom: 12 },
  gateTitle: { fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 8 },
  gateSub: { fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 24 },
  gateButtons: { display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12 },
  gateSignUp: { padding: '12px 24px', background: '#1a6cf5', color: '#fff', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 12px rgba(26,108,245,0.3)' },
  gateSignIn: { padding: '12px 24px', background: '#f1f5f9', color: '#475569', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none' },
  gateFine: { fontSize: 11, color: '#94a3b8', margin: 0 },
}
