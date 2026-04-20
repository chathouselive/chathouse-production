import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import TopNav from '../components/TopNav'
import Comment from '../components/Comment'
import CommentForm from '../components/CommentForm'
import VerifyTenantModal from '../components/VerifyTenantModal'
import Footer from '../components/Footer'
import { useListing } from '../lib/useListings'
import { useComments } from '../lib/useComments'
import { useVerification } from '../lib/useVerification'
import { getListingImage } from '../lib/streetView'

export default function ListingDetail() {
  const { id } = useParams()
  const { listing, loading } = useListing(id)
  const { comments, loading: loadingComments, postComment, toggleLike } = useComments(id)
  const { status: verificationStatus, submitVerification } = useVerification(id)
  const [showVerifyModal, setShowVerifyModal] = useState(false)

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
        <div>Listing not found. <Link to="/">Go back</Link></div>
      </div>
    </div>
  )

  const img = getListingImage(listing)
  const priceStr = listing.price
    ? (listing.type === 'rent' ? `$${Number(listing.price).toLocaleString()}/mo` : `$${Number(listing.price).toLocaleString()}`)
    : 'Price not listed'
  const isCommunity = listing.source === 'community'
  const isIDX = listing.source === 'idx'

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <TopNav />

      <div style={styles.page}>
        <Link to="/" style={styles.back}>← Back to listings</Link>

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
            <div>
              <div style={styles.price}>{priceStr}</div>
              <div style={styles.address}>{listing.address}</div>
              <div style={styles.hood}>📍 {listing.hood || listing.city}{listing.state ? `, ${listing.state}` : ''}</div>
            </div>
          </div>

          <div style={styles.specs}>
            {listing.beds != null && <div style={styles.spec}><strong>{listing.beds}</strong> beds</div>}
            {listing.baths != null && <div style={styles.spec}><strong>{listing.baths}</strong> baths</div>}
            {listing.sqft != null && <div style={styles.spec}><strong>{Number(listing.sqft).toLocaleString()}</strong> sqft</div>}
          </div>

          {listing.description && (
            <p style={styles.desc}>{listing.description}</p>
          )}

          {/* IDX Compliance Block — required for all IDX listings */}
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

        {/* Fair Housing notice on all listings */}
        <div style={styles.fairHousingStrip}>
          <span style={styles.fairHousingStripIcon}>⚖️</span>
          <span style={styles.fairHousingStripText}>
            We are committed to the Fair Housing Act. <Link to="/fair-housing" style={styles.fairHousingStripLink}>Learn more</Link>
          </span>
        </div>

        <div style={styles.commentsSection}>
          <div style={styles.commentsHead}>
            <h2 style={styles.h2}>Community</h2>
            <p style={styles.sub}>Honest comments from people who know this building.</p>
          </div>

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
  priceRow: { marginBottom: 16 },
  price: { fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 700, color: '#0f172a', marginBottom: 4 },
  address: { fontSize: 16, color: '#334155', marginBottom: 4 },
  hood: { fontSize: 13, color: '#64748b' },
  specs: { display: 'flex', gap: 20, padding: '14px 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', marginBottom: 14 },
  spec: { fontSize: 13, color: '#64748b' },
  desc: { fontSize: 14, color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap' },

  // IDX compliance
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

  // Fair Housing strip — shows on all listings
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
}
