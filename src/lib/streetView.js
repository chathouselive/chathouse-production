// Google Street View Static API generates free exterior photos for any address.
// No API key required for basic usage (falls back to lower quality).
// When you get a Google Maps API key, add VITE_GOOGLE_MAPS_KEY to env vars.

export function streetViewUrl({ lat, lng, address, size = '700x400' }) {
  const key = import.meta.env.VITE_GOOGLE_MAPS_KEY
  const base = 'https://maps.googleapis.com/maps/api/streetview'
  const params = new URLSearchParams({ size })

  if (lat && lng) {
    params.set('location', `${lat},${lng}`)
  } else if (address) {
    params.set('location', address)
  } else {
    return null
  }

  if (key) params.set('key', key)
  return `${base}?${params.toString()}`
}

// Placeholder image for listings without photos or coordinates
export const PLACEHOLDER_IMG =
  'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 400">
      <rect width="700" height="400" fill="#e8f0fe"/>
      <text x="50%" y="50%" font-family="system-ui" font-size="56" fill="#1a6cf5" text-anchor="middle" dy=".3em">🏠</text>
    </svg>
  `)

export function getListingImage(listing) {
  if (listing.img_url) return listing.img_url
  if (listing.photos && Array.isArray(listing.photos) && listing.photos.length) return listing.photos[0]
  const sv = streetViewUrl({ lat: listing.lat, lng: listing.lng, address: listing.address })
  return sv || PLACEHOLDER_IMG
}
