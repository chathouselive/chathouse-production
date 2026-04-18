import { Link } from 'react-router-dom'
import { getListingImage } from '../lib/streetView'

export default function ListingCard({ listing }) {
  const isCommunity = listing.source === 'community'
  const img = getListingImage(listing)
  const priceStr = listing.type === 'rent'
    ? `$${Number(listing.price).toLocaleString()}/mo`
    : `$${Number(listing.price).toLocaleString()}`

  return (
    <Link to={`/listing/${listing.id}`} style={styles.link}>
      <div style={styles.card}>
        <div style={styles.imgWrap}>
          <img
            src={img}
            alt={listing.address}
            style={styles.img}
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 400">
                  <rect width="700" height="400" fill="#e8f0fe"/>
                  <text x="50%" y="50%" font-family="system-ui" font-size="56" fill="#1a6cf5" text-anchor="middle" dy=".3em">🏠</text>
                </svg>
              `)
            }}
          />
          <div style={{ ...styles.tag, background: listing.tag_color || '#1a6cf5' }}>
            {listing.tag || (listing.type === 'rent' ? 'For Rent' : 'For Sale')}
          </div>
          {isCommunity && (
            <div style={styles.communityBadge}>🏘️ Community Listed</div>
          )}
        </div>
        <div style={styles.body}>
          <div style={styles.price}>{priceStr}</div>
          <div style={styles.address}>{listing.address}</div>
          <div style={styles.hood}>
            📍 {listing.hood || listing.city}
          </div>
          <div style={styles.specs}>
            {listing.beds != null && <span>{listing.beds} bd</span>}
            {listing.baths != null && <span>• {listing.baths} ba</span>}
            {listing.sqft != null && <span>• {Number(listing.sqft).toLocaleString()} sqft</span>}
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
    borderRadius: 14,
    border: '1.5px solid #e2e8f0',
    overflow: 'hidden',
    transition: 'all .2s',
    cursor: 'pointer',
  },
  imgWrap: { position: 'relative', height: 200, background: '#f1f5f9' },
  img: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  tag: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: '4px 12px',
    borderRadius: 100,
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
  },
  communityBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    padding: '4px 10px',
    background: 'rgba(124,58,237,0.9)',
    borderRadius: 100,
    color: '#fff',
    fontSize: 10,
    fontWeight: 700,
  },
  body: { padding: 16 },
  price: { fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 2 },
  address: { fontSize: 14, color: '#334155', marginBottom: 6 },
  hood: { fontSize: 12, color: '#64748b', marginBottom: 10 },
  specs: { fontSize: 12, color: '#64748b', display: 'flex', gap: 6 },
}
