import { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import TopNav from '../components/TopNav'
import Comment from '../components/Comment'
import CommentForm from '../components/CommentForm'
import VerifyTenantModal from '../components/VerifyTenantModal'
import PhotoGalleryModal from '../components/PhotoGalleryModal'
import Footer from '../components/Footer'
import WalkabilityScores from '../components/WalkabilityScores'
import RiskReportSection from '../components/RiskReportSection'
import { useListing, useListingPhotos } from '../lib/useListings'
import { useComments } from '../lib/useComments'
import { useVerification } from '../lib/useVerification'
import { getListingImage } from '../lib/streetView'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import { toggleListingLike, getListingLikeStatus } from '../lib/useListings'

/* ============================================================
   Type helpers — handle all listing types properly
   Types: 'sale', 'rent' (legacy), 'rental', 'land', 'commercial', 'multifamily'
   ============================================================ */
function isRentalPricing(type) {
  return type === 'rent' || type === 'rental'
}

function getTypeBadge(type) {
  if (type === 'rent' || type === 'rental') return 'For Rent'
  if (type === 'land') return 'Land'
  if (type === 'commercial') return 'Commercial'
  if (type === 'multifamily') return 'Multi-Family'
  return 'For Sale'
}

/* ============================================================
   Inline SVG icons — matching the rest of the app
   ============================================================ */
const Icon = {
  ArrowLeft: ({ size = 13 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
    </svg>
  ),
  Pin: ({ size = 13 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Heart: ({ size = 24, filled = false }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  Building: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 6h.01"/><path d="M15 6h.01"/><path d="M9 10h.01"/><path d="M15 10h.01"/><path d="M9 14h.01"/><path d="M15 14h.01"/><path d="M10 22v-4h4v4"/>
    </svg>
  ),
  Home: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Message: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  Paperclip: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
    </svg>
  ),
  Check: ({ size = 13 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  /* Scales of justice — clean line art for Fair Housing */
  Scales: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="3" x2="12" y2="21"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="5" y1="6" x2="19" y2="6"/>
      <path d="M5 6 L2 13 a3 3 0 0 0 6 0 Z"/>
      <path d="M19 6 L16 13 a3 3 0 0 0 6 0 Z"/>
    </svg>
  ),
  /* Lock — for comments-disabled disclaimer */
  Lock: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  /* Camera — for gallery button */
  Camera: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  ),
}

export default function ListingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const { listing, loading } = useListing(id)
  const { photos: allPhotos } = useListingPhotos(listing?.id)
  const { comments, loading: loadingComments, postComment, toggleLike } = useComments(id)
  const { status: verificationStatus, submitVerification } = useVerification(id)
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [showGallery, setShowGallery] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [claimSubmitted, setClaimSubmitted] = useState(false)
  const [showClaimForm, setShowClaimForm] = useState(false)
  const [claimDoc, setClaimDoc] = useState(null)
  const [claimDocName, setClaimDocName] = useState('')

  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [liking, setLiking] = useState(false)

  /* ============================================================
     Compliance filter for photos
     --------------------------------------------------------------
     NJMLS Section 13.1: sold listings may only display the FIRST
     photo. Our sync function already enforces this at sync time
     (skips Orders 1+ when idx_standard_status='Closed'), but as
     defense-in-depth, the UI also filters here at display time.
     If somehow a Closed listing has gallery rows, we hide them.
     ============================================================ */
  const photos = useMemo(() => {
    if (!allPhotos || allPhotos.length === 0) return []
    if (listing?.idx_standard_status === 'Closed') {
      return allPhotos.filter((p) => p.display_order === 0)
    }
    return allPhotos
  }, [allPhotos, listing?.idx_standard_status])

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
      let docUrl = null

      if (claimDoc) {
        const ext = claimDoc.name.split('.').pop()
        const path = `claims/${user.id}/${listing.id}-${Date.now()}.${ext}`
        const { error: uploadErr } = await supabase.storage
          .from('photo-submissions')
          .upload(path, claimDoc)
        if (!uploadErr) {
          const { data } = supabase.storage.from('photo-submissions').getPublicUrl(path)
          docUrl = data.publicUrl
        }
      }

      const { error } = await supabase.from('listing_claims').insert({
        listing_id: Number(listing.id),
        user_id: user.id,
        status: 'pending',
        ...(docUrl && { notes: docUrl }),
      })
      if (error) {
        alert('Claim failed: ' + error.message)
      } else {
        setClaimSubmitted(true)
        setShowClaimForm(false)
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
        <div>Listing not found. <Link to="/listings" style={{ color: '#1a6cf5' }}>Go back</Link></div>
      </div>
    </div>
  )

  const img = getListingImage(listing)
  const priceStr = listing.price
    ? (isRentalPricing(listing.type) ? `$${Number(listing.price).toLocaleString()}/mo` : `$${Number(listing.price).toLocaleString()}`)
    : 'Price not listed'
  const isCommunity = listing.source === 'community'
  const isIDX = listing.source === 'idx'
  const hasGallery = photos.length >= 2

  /* ============================================================
     IDX Compliance gate: idx_consumer_comments
     --------------------------------------------------------------
     NJMLS Section 13.1: when the seller has opted out of internet
     consumer comments, we MUST NOT display the comment section.
     Community listings are never gated (the flag is null/default).
     Only when source='idx' AND flag is explicitly true do we show
     the comments. Null defaults to restrictive (hide comments).
     ============================================================ */
  const commentsAllowed = !isIDX || listing.idx_consumer_comments === true

  const FAKE_COMMENTS = [
    { id: 'f1', role: 'Past Tenant', text: 'Lived here for 2 years. The building management is incredibly responsive and...' },
    { id: 'f2', role: 'Neighbor', text: 'Great block, very quiet at night. The only thing I would mention is that parking...' },
    { id: 'f3', role: 'Current Resident', text: 'Moved in 6 months ago. Honestly one of the best decisions I made. The super...' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <TopNav />

      <div style={styles.page}>
        <Link to="/listings" style={styles.back}>
          <Icon.ArrowLeft size={13}/> Back to listings
        </Link>

        <div style={styles.imgWrap}>
          <img src={img} alt={listing.address} style={styles.img}
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600">
                  <rect width="1200" height="600" fill="#f1f5f9"/>
                  <g transform="translate(560, 240)" fill="none" stroke="#94a3b8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="10" y="10" width="80" height="100" rx="4" ry="4"/>
                    <line x1="28" y1="28" x2="28" y2="28"/><line x1="72" y1="28" x2="72" y2="28"/>
                    <line x1="28" y1="50" x2="28" y2="50"/><line x1="72" y1="50" x2="72" y2="50"/>
                    <line x1="28" y1="72" x2="28" y2="72"/><line x1="72" y1="72" x2="72" y2="72"/>
                    <path d="M40 110v-20h20v20"/>
                  </g>
                </svg>
              `)
            }}
          />
          <div style={{ ...styles.tag, background: listing.tag_color || '#1a6cf5' }}>
            {listing.tag || getTypeBadge(listing.type)}
          </div>
          {isCommunity && (
            <div style={styles.communityBadge}>
              <Icon.Building size={11}/> Community Listed
            </div>
          )}
          {isIDX && <div style={styles.idxBadge}>IDX</div>}

          {/* Gallery button — bottom-right of hero, only when 2+ photos */}
          {hasGallery && (
            <button
              onClick={() => setShowGallery(true)}
              style={styles.galleryBtn}
              aria-label={`View all ${photos.length} photos`}
            >
              <Icon.Camera size={14}/>
              <span>View all {photos.length} photos</span>
            </button>
          )}
        </div>

        <div style={styles.header}>
          <div style={styles.priceRow}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={styles.price}>{priceStr}</div>
              <div style={styles.address}>{listing.address}</div>
              <div style={styles.hood}>
                <Icon.Pin size={13}/> {listing.hood || listing.city}{listing.state ? `, ${listing.state}` : ''}
              </div>
            </div>
            <button
              onClick={handleLike}
              style={{ ...styles.likeBtn, color: liked ? '#ef4444' : '#94a3b8' }}
              aria-label={liked ? 'Unlike' : 'Save listing'}
              title={liked ? 'Saved' : 'Save listing'}
            >
              <Icon.Heart size={24} filled={liked}/>
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

          {/* Claim listing — for landlords and property managers */}
          {user && ['landlord', 'management'].includes(profile?.account_type) && !listing.claimed_by && (
            <div style={{ marginTop: 14 }}>
              {claimSubmitted ? (
                <div style={styles.claimSuccess}>
                  <Icon.Check size={13}/> Claim submitted — we'll review and verify your ownership within 24–48 hours.
                </div>
              ) : !showClaimForm ? (
                <div>
                  <button onClick={() => setShowClaimForm(true)} style={styles.claimBtn}>
                    <Icon.Home size={13}/> Claim this listing
                  </button>
                  <div style={styles.claimHint}>Is this your property? Claim it to respond to comments and upload photos.</div>
                </div>
              ) : (
                <div style={styles.claimForm}>
                  <div style={styles.claimFormTitle}>
                    <Icon.Home size={14}/> Claim this listing
                  </div>
                  <div style={styles.claimFormBody}>
                    Upload proof of ownership to speed up verification — lease agreement, deed, or utility bill. This is optional but recommended.
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <input
                      type="file"
                      id="claimDoc"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={e => { setClaimDoc(e.target.files[0]); setClaimDocName(e.target.files[0]?.name || '') }}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="claimDoc" style={styles.claimFileLabel}>
                      <Icon.Paperclip size={13}/> {claimDocName || 'Upload verification document (optional)'}
                    </label>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={handleClaim} disabled={claiming}
                      style={{ ...styles.claimSubmitBtn, opacity: claiming ? 0.6 : 1 }}>
                      {claiming ? 'Submitting...' : 'Submit Claim'}
                    </button>
                    <button onClick={() => { setShowClaimForm(false); setClaimDoc(null); setClaimDocName('') }}
                      style={styles.claimCancelBtn}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          {listing.claimed_by && (
            <div style={styles.claimedTag}>
              <Icon.Check size={11}/> Claimed by owner
            </div>
          )}

          {isIDX && (
            <div style={styles.idxCompliance}>
              <div style={styles.idxComplianceTop}>
                <div style={styles.idxLogoBox}>
                  <span style={styles.idxLogoText}>IDX</span>
                </div>
                <div style={styles.fairHousingBox}>
                  <Icon.Scales size={13}/>
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

        {/* Walk Score / Bike Score / Transit Score */}
        <WalkabilityScores listing={listing} />

        {/* AI Risk Report */}
        <RiskReportSection listing={listing} />

        {/* Fair Housing strip */}
        <div style={styles.fairHousingStrip}>
          <span style={styles.fairHousingStripIcon}><Icon.Scales size={14}/></span>
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

          {/* IDX compliance gate: comments disabled by seller */}
          {!commentsAllowed ? (
            <div style={styles.commentsDisabled}>
              <div style={styles.commentsDisabledIconWrap}><Icon.Lock size={28}/></div>
              <div style={styles.commentsDisabledTitle}>Comments are disabled for this listing</div>
              <div style={styles.commentsDisabledSub}>
                Comments have been disabled at the request of the seller.
              </div>
            </div>
          ) : !user ? (
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
                  <div style={styles.gateIconWrap}><Icon.Message size={28}/></div>
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
                  <div style={styles.emptyIconWrap}><Icon.Message size={28}/></div>
                  <div style={styles.emptyTitle}>Be the first to comment</div>
                  <div style={styles.emptySub}>Share what you know about this building — past tenant, current resident, or neighbor.</div>
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

      {showGallery && (
        <PhotoGalleryModal
          photos={photos}
          onClose={() => setShowGallery(false)}
        />
      )}
    </div>
  )
}

const styles = {
  page: { maxWidth: 860, margin: '0 auto', padding: '24px 20px 60px' },
  back: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    fontSize: 13, color: '#64748b', marginBottom: 16,
    textDecoration: 'none', fontWeight: 600,
  },

  imgWrap: { position: 'relative', borderRadius: 16, overflow: 'hidden', marginBottom: 20, background: '#f1f5f9' },
  img: { width: '100%', height: 'auto', maxHeight: 480, objectFit: 'cover', display: 'block' },
  tag: {
    position: 'absolute', top: 16, right: 16,
    padding: '5px 14px', borderRadius: 100,
    color: '#fff', fontSize: 12, fontWeight: 700,
    letterSpacing: 0.3,
  },
  communityBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    position: 'absolute', top: 16, left: 16,
    padding: '5px 12px',
    background: 'rgba(255,255,255,0.95)',
    color: '#475569',
    borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0',
    borderRadius: 100, fontSize: 11, fontWeight: 700,
    letterSpacing: 0.3, textTransform: 'uppercase',
  },
  idxBadge: {
    position: 'absolute', top: 16, left: 16,
    padding: '5px 12px',
    background: 'rgba(26,108,245,0.9)',
    borderRadius: 100, color: '#fff',
    fontSize: 11, fontWeight: 700, letterSpacing: 1,
  },

  /* Gallery button — bottom-right of hero */
  galleryBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    position: 'absolute', bottom: 16, right: 16,
    padding: '8px 14px',
    background: 'rgba(15, 23, 42, 0.82)',
    color: '#fff',
    border: 'none', borderRadius: 100,
    fontSize: 12, fontWeight: 700,
    cursor: 'pointer',
    backdropFilter: 'blur(8px)',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    transition: 'background 120ms ease, transform 120ms ease',
  },

  header: {
    padding: 24, background: '#fff',
    borderRadius: 16,
    borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0',
    marginBottom: 12,
    boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
  },
  priceRow: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, gap: 12 },
  price: { fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 700, color: '#0f172a', marginBottom: 4 },
  address: { fontSize: 16, color: '#334155', marginBottom: 4 },
  hood: { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#64748b' },

  likeBtn: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
    background: 'none', border: 'none', cursor: 'pointer',
    padding: '8px 12px', borderRadius: 12, flexShrink: 0,
    transition: 'color 120ms ease, background 120ms ease',
  },
  likeBtnCount: { fontSize: 12, fontWeight: 600, color: '#64748b' },

  specs: {
    display: 'flex', gap: 20, padding: '14px 0',
    borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: '#e2e8f0',
    borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: '#e2e8f0',
    marginBottom: 14,
  },
  spec: { fontSize: 13, color: '#64748b' },
  desc: { fontSize: 14, color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap' },

  claimBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '10px 18px',
    background: '#1a6cf5', color: '#fff',
    border: 'none', borderRadius: 8,
    fontSize: 13, fontWeight: 700, cursor: 'pointer',
    transition: 'background 120ms ease',
  },
  claimHint: { fontSize: 11, color: '#94a3b8', marginTop: 6 },
  claimForm: {
    padding: 16, background: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1.5, borderStyle: 'solid', borderColor: '#e2e8f0',
    borderLeftWidth: 3, borderLeftColor: '#1a6cf5',
  },
  claimFormTitle: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 4,
  },
  claimFormBody: { fontSize: 12, color: '#475569', marginBottom: 12, lineHeight: 1.5 },
  claimFileLabel: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '8px 14px', background: '#fff',
    borderWidth: 1.5, borderStyle: 'solid', borderColor: '#e2e8f0',
    borderRadius: 8, fontSize: 12, fontWeight: 600,
    color: '#475569', cursor: 'pointer',
    transition: 'background 120ms ease, border-color 120ms ease',
  },
  claimSubmitBtn: {
    padding: '9px 18px',
    background: '#1a6cf5', color: '#fff',
    border: 'none', borderRadius: 8,
    fontSize: 13, fontWeight: 700, cursor: 'pointer',
    transition: 'background 120ms ease',
  },
  claimCancelBtn: {
    padding: '9px 14px', background: '#f1f5f9',
    border: 'none', borderRadius: 8,
    fontSize: 13, fontWeight: 600, color: '#64748b',
    cursor: 'pointer',
    transition: 'background 120ms ease',
  },
  claimSuccess: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '10px 14px',
    background: '#f0fdf4',
    borderWidth: 1, borderStyle: 'solid', borderColor: '#86efac',
    borderRadius: 10, fontSize: 13, color: '#16a34a', fontWeight: 600,
  },
  claimedTag: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    marginTop: 12, padding: '6px 12px',
    background: '#f0fdf4',
    borderWidth: 1, borderStyle: 'solid', borderColor: '#86efac',
    borderRadius: 100, fontSize: 11, color: '#16a34a',
    fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase',
  },

  idxCompliance: {
    marginTop: 16, padding: 16,
    background: '#f8fafc', borderRadius: 12,
    borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0',
  },
  idxComplianceTop: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' },
  idxLogoBox: { background: '#1a6cf5', borderRadius: 6, padding: '3px 10px' },
  idxLogoText: { color: '#fff', fontSize: 11, fontWeight: 800, letterSpacing: 1 },
  fairHousingBox: { display: 'flex', alignItems: 'center', gap: 5, color: '#475569' },
  fairHousingText: { fontSize: 11, fontWeight: 700, color: '#475569' },
  listingOffice: { fontSize: 12, color: '#475569', marginBottom: 8 },
  listingOfficeLabel: { color: '#94a3b8' },
  listingOfficeName: { fontWeight: 700, color: '#334155' },
  listingAgentName: { color: '#334155' },
  idxDisclaimer: { fontSize: 11, color: '#94a3b8', lineHeight: 1.65, margin: '8px 0 4px' },
  idxUpdated: { fontSize: 11, color: '#94a3b8', margin: 0 },

  fairHousingStrip: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 16px',
    background: 'rgba(26,108,245,0.06)',
    borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(26,108,245,0.15)',
    borderRadius: 10, marginBottom: 12,
  },
  fairHousingStripIcon: { color: '#1a6cf5', display: 'flex', alignItems: 'center' },
  fairHousingStripText: { fontSize: 12, color: '#475569' },
  fairHousingStripLink: { color: '#1a6cf5', fontWeight: 700, textDecoration: 'none' },

  commentsSection: {
    padding: 24, background: '#fff',
    borderRadius: 16,
    borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0',
    boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
  },
  commentsHead: { marginBottom: 16 },
  h2: { fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 4 },
  sub: { fontSize: 13, color: '#64748b' },

  /* Comments disabled state (IDX flag false) — matches `empty` style */
  commentsDisabled: { textAlign: 'center', padding: 40, background: '#f8fafc', borderRadius: 12 },
  commentsDisabledIconWrap: { display: 'flex', justifyContent: 'center', marginBottom: 10, color: '#94a3b8' },
  commentsDisabledTitle: { fontWeight: 700, color: '#0f172a', marginBottom: 4, fontSize: 14 },
  commentsDisabledSub: { fontSize: 13, color: '#64748b', lineHeight: 1.5 },

  empty: { textAlign: 'center', padding: 40, background: '#f8fafc', borderRadius: 12 },
  emptyIconWrap: { display: 'flex', justifyContent: 'center', marginBottom: 10, color: '#94a3b8' },
  emptyTitle: { fontWeight: 700, color: '#0f172a', marginBottom: 4, fontSize: 14 },
  emptySub: { fontSize: 13, color: '#64748b', lineHeight: 1.5 },

  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 80 },
  spinner: {
    width: 36, height: 36, borderRadius: '50%',
    borderWidth: 3, borderStyle: 'solid', borderColor: '#e8f0fe',
    borderTopColor: '#1a6cf5',
    animation: 'spin 0.8s linear infinite',
  },

  /* Sign-up gate (preserved as-is, just emoji swapped to icon) */
  gateWrap: { position: 'relative', borderRadius: 12, overflow: 'hidden', minHeight: 320 },
  blurredComments: {
    display: 'flex', flexDirection: 'column', gap: 12,
    filter: 'blur(4px)', userSelect: 'none', pointerEvents: 'none', opacity: 0.7,
  },
  fakeComment: {
    padding: '14px 16px', background: '#f8fafc',
    borderRadius: 10,
    borderLeftWidth: 3, borderLeftStyle: 'solid', borderLeftColor: '#1a6cf5',
  },
  fakeCommentHeader: { marginBottom: 6 },
  fakeRoleBadge: { fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: '#e8f0fe', color: '#1a6cf5' },
  fakeCommentText: { fontSize: 13, color: '#334155', lineHeight: 1.55, fontStyle: 'italic', margin: 0 },
  gateOverlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.97) 40%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  gateCard: {
    textAlign: 'center', maxWidth: 400, padding: '32px 28px',
    background: '#fff', borderRadius: 20,
    borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0',
    boxShadow: '0 8px 32px rgba(26,108,245,0.1)',
  },
  gateIconWrap: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 56, height: 56, borderRadius: 14,
    background: '#e8f0fe', color: '#1a6cf5',
    marginBottom: 14,
  },
  gateTitle: { fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 8 },
  gateSub: { fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 24 },
  gateButtons: { display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12 },
  gateSignUp: {
    padding: '12px 24px', background: '#1a6cf5', color: '#fff',
    borderRadius: 10, fontSize: 14, fontWeight: 700,
    textDecoration: 'none', boxShadow: '0 4px 12px rgba(26,108,245,0.3)',
  },
  gateSignIn: {
    padding: '12px 24px', background: '#f1f5f9', color: '#475569',
    borderRadius: 10, fontSize: 14, fontWeight: 600,
    textDecoration: 'none',
  },
  gateFine: { fontSize: 11, color: '#94a3b8', margin: 0 },
}