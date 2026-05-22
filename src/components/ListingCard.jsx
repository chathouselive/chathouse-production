import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getListingImage } from '../lib/streetView'
import { useAuth } from '../lib/AuthContext'
import { toggleListingLike, getListingLikeStatus } from '../lib/useListings'

/* ============================================================
   Inline SVG icons — matching the rest of the app
   ============================================================ */
const Icon = {
  Pin: ({ size = 11 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Message: ({ size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  Heart: ({ size = 13, filled = false }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  Building: ({ size = 11 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 6h.01"/><path d="M15 6h.01"/><path d="M9 10h.01"/><path d="M15 10h.01"/><path d="M9 14h.01"/><path d="M15 14h.01"/><path d="M10 22v-4h4v4"/>
    </svg>
  ),
}

/* ============================================================
   Type helpers — handle all listing types properly
   Types: 'sale', 'rent' (legacy), 'rental', 'land', 'commercial', 'multifamily'
   ============================================================ */
function isRentalPricing(type) {
  // Rentals show /mo on the price
  return type === 'rent' || type === 'rental'
}

function getTypeBadge(type) {
  if (type === 'rent' || type === 'rental') return 'For Rent'
  if (type === 'land') return 'Land'
  if (type === 'commercial') return 'Commercial'
  if (type === 'multifamily') return 'Multi-Family'
  return 'For Sale' // default: 'sale' or anything unknown
}

export default function ListingCard({ listing }) {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const isCommunity = listing.source === 'community'
  const isIDX = listing.source === 'idx'
  const isArchived = listing.archived_at != null
  const isAdmin = profile?.is_admin === true
  const img = getListingImage(listing)
  const priceStr = isRentalPricing(listing.type)
    ? `$${Number(listing.price).toLocaleString()}/mo`
    : `$${Number(listing.price).toLocaleString()}`

  /* IDX Compliance: comments may be disabled per idx_consumer_comments flag.
     When false, we hide the comment count entirely on the card. Showing
     "0 comments" or "Comments disabled" on every IDX card is bad UX — the
     repetition trains users to stop reading. Empty space keeps cards calm
     and lets the price/address remain the visual anchor. The disabled
     disclaimer (with reason) lives on the listing detail page instead. */
  const commentsAllowed = !isIDX || listing.idx_consumer_comments === true

  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(listing.likes_count || 0)
  const [liking, setLiking] = useState(false)

  useEffect(() => {
    if (user) {
      getListingLikeStatus(listing.id, user.id).then(setLiked)
    }
  }, [listing.id, user])

  async function handleLike(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { navigate('/signin'); return }
    if (liking) return
    setLiking(true)
    const result = await toggleListingLike(listing.id, user.id, liked, likeCount)
    setLiked(result.liked)
    setLikeCount(result.count)
    setLiking(false)
  }

  const commentCount = listing.comment_count || 0

  /* IDX disclosure data — Section 13.1(d). MLS# + listing firm appear in
     the footer alongside the comment count. The thumbnail exemption in
     13.1(d) allows compact identification on summary results when linked
     to a full-disclosure detail page (which our cards always are).
     Full agent + brokerage + agreement text live on the detail page. */
  const showMls = isIDX && listing.idx_listing_id
  const showBrokerage = isIDX && listing.idx_list_office_name

  return (
    <Link to={`/listing/${listing.id}`} style={styles.link}>
      <div style={styles.card}>
        <div style={styles.imgWrap}>
          <img
            src={img}
            alt={listing.address}
            style={styles.img}
            onError={(e) => {
              // Clean fallback — no emoji
              e.currentTarget.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 400">
                  <rect width="700" height="400" fill="#f1f5f9"/>
                  <g transform="translate(310, 160)" fill="none" stroke="#94a3b8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="10" y="10" width="60" height="80" rx="3" ry="3"/>
                    <line x1="22" y1="22" x2="22" y2="22"/><line x1="58" y1="22" x2="58" y2="22"/>
                    <line x1="22" y1="40" x2="22" y2="40"/><line x1="58" y1="40" x2="58" y2="40"/>
                    <line x1="22" y1="58" x2="22" y2="58"/><line x1="58" y1="58" x2="58" y2="58"/>
                    <path d="M30 90v-15h20v15"/>
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
              <Icon.Building/> Community Listed
            </div>
          )}
          {/* ARCHIVED badge — admins only. Renders for any archived listing
              (RLS allows admins to see archived rows alongside active ones).
              Visual cue prevents admin confusion about what's live vs not.
              Bottom-left avoids fighting with Community (top-left) and
              type tag (top-right). */}
          {isAdmin && isArchived && (
            <div style={styles.archivedBadge}>
              ARCHIVED
            </div>
          )}
          {/* NJMLS IDX logo overlay — bottom-right of image.
              Required per Section 13.1 Rule 1: "Listings belonging to brokers
              other than the Participant must appear with the NJMLS' Internet
              Data Exchange logo on each result page."
              Only renders for IDX-sourced listings. Community listings don't
              need this attribution. */}
          {isIDX && (
            <img
              src="/brokers/njmls-idx-logo.png"
              alt="NJMLS Internet Data Exchange"
              style={styles.idxLogoOverlay}
            />
          )}
        </div>
        <div style={styles.body}>
          <div style={styles.price}>{priceStr}</div>
          <div style={styles.address}>{listing.address}</div>
          <div style={styles.hood}>
            <Icon.Pin/> {listing.hood || listing.city}
          </div>
          <div style={styles.specs}>
            {listing.beds != null && <span>{listing.beds} bd</span>}
            {listing.baths != null && <span>· {listing.baths} ba</span>}
            {listing.sqft != null && <span>· {Number(listing.sqft).toLocaleString()} sqft</span>}
          </div>
          {/* Footer row — comment count + IDX disclosure on left, heart on right.
              All left-side items separated by · dots. Brokerage name truncates
              with ellipsis when too long to fit. */}
          <div style={styles.footer}>
            <div style={styles.footerLeft}>
              {commentsAllowed && (
                <span style={styles.footerStat}>
                  <Icon.Message/> {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
                </span>
              )}
              {showMls && (
                <>
                  {commentsAllowed && <span style={styles.footerDot}>·</span>}
                  <span style={styles.footerMeta}>MLS #{listing.idx_listing_id}</span>
                </>
              )}
              {showBrokerage && (
                <>
                  <span style={styles.footerDot}>·</span>
                  <span style={styles.footerBrokerage}>{listing.idx_list_office_name}</span>
                </>
              )}
            </div>
            <button
              onClick={handleLike}
              style={{ ...styles.likeBtn, color: liked ? '#ef4444' : '#94a3b8' }}
              aria-label={liked ? 'Unlike' : 'Like'}
            >
              <Icon.Heart filled={liked}/> {likeCount}
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}

const styles = {
  link: { textDecoration: 'none', color: 'inherit' },
  card: {
    background: '#fff',
    borderRadius: 16,
    borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0',
    overflow: 'hidden',
    cursor: 'pointer',
    boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
    transition: 'box-shadow 120ms ease, border-color 120ms ease',
  },
  imgWrap: { position: 'relative', height: 200, background: '#f1f5f9' },
  img: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  tag: {
    position: 'absolute', top: 12, right: 12,
    padding: '4px 12px', borderRadius: 100,
    color: '#fff', fontSize: 11, fontWeight: 700,
    letterSpacing: 0.3,
  },
  communityBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    position: 'absolute', top: 12, left: 12,
    padding: '4px 10px',
    background: 'rgba(255,255,255,0.95)',
    color: '#475569',
    borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0',
    borderRadius: 100, fontSize: 10, fontWeight: 700,
    letterSpacing: 0.3, textTransform: 'uppercase',
  },
  /* ARCHIVED badge — bottom-left of image, amber to match admin Archive
     theme. Only renders for admins on archived listings. */
  archivedBadge: {
    position: 'absolute', bottom: 12, left: 12,
    padding: '4px 10px',
    background: '#d97706',
    color: '#fff',
    borderRadius: 100,
    fontSize: 10, fontWeight: 800,
    letterSpacing: 1,
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
  },
  /* NJMLS IDX logo overlay — bottom-right of image. Sits directly on the
     photo with a subtle drop shadow tracing the logo letterforms so it
     stays readable against any photo background. No background pill —
     matches the Zillow IDX pattern for cleaner visual integration. */
  idxLogoOverlay: {
    position: 'absolute', bottom: 12, right: 12,
    height: 32,
    width: 'auto',
    filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))',
    display: 'block',
  },
  body: { padding: 16 },
  price: { fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 2 },
  address: { fontSize: 14, color: '#334155', marginBottom: 6 },
  hood: { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b', marginBottom: 10 },
  specs: { fontSize: 12, color: '#64748b', display: 'flex', gap: 6, marginBottom: 10 },
  footer: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: '#f1f5f9',
  },
  /* Footer left column — comment count, MLS#, brokerage, all on one line
     separated by · dots. flex:1 + minWidth:0 lets the brokerage span
     truncate properly instead of pushing the heart off the card. */
  footerLeft: {
    flex: 1, minWidth: 0,
    display: 'flex', alignItems: 'center', gap: 4,
    fontSize: 14, color: '#94a3b8', fontWeight: 600,
    overflow: 'hidden',
  },
  footerStat: { display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0 },
  footerDot: { flexShrink: 0, opacity: 0.7 },
  footerMeta: { flexShrink: 0, whiteSpace: 'nowrap' },
  /* Brokerage truncates with ellipsis on long names like
     "PROMINENT PROPERTIES SOTHEBY'S INTERNATIONAL REALTY-TENAFLY". */
  footerBrokerage: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  },
  likeBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 12, fontWeight: 600, padding: 0,
    display: 'inline-flex', alignItems: 'center', gap: 4,
    flexShrink: 0,
    transition: 'color 120ms ease',
  },
}