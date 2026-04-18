import { useState } from 'react'
import TopNav from '../components/TopNav'
import ListingCard from '../components/ListingCard'
import { useListings } from '../lib/useListings'

const CITIES = ['All', 'Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Jersey City', 'Hoboken', 'Newark', 'Weehawken', 'Hackensack']
const TYPES = [
  { value: 'All', label: 'All' },
  { value: 'rent', label: 'For Rent' },
  { value: 'sale', label: 'For Sale' },
]

export default function Home() {
  const [city, setCity] = useState('All')
  const [type, setType] = useState('All')
  const [search, setSearch] = useState('')
  const { listings, loading } = useListings({ city, type, search })

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <TopNav />

      <div style={styles.filters}>
        <div style={styles.filtersInner}>
          <div style={styles.searchWrap}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search address, city, or neighborhood..."
              style={styles.searchInput}
            />
          </div>

          <div style={styles.chipGroup}>
            {TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                style={{ ...styles.chip, ...(type === t.value ? styles.chipActive : {}) }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div style={styles.chipGroup}>
            {CITIES.map(c => (
              <button
                key={c}
                onClick={() => setCity(c)}
                style={{ ...styles.chip, ...(city === c ? styles.chipActive : {}) }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.heading}>
            {loading ? 'Loading...' : `${listings.length} listing${listings.length === 1 ? '' : 's'}`}
          </h1>
          <p style={styles.sub}>
            {city === 'All' ? 'All areas' : city}
            {type !== 'All' && ` · ${type === 'rent' ? 'Rentals' : 'For Sale'}`}
          </p>
        </div>

        {loading && (
          <div style={styles.center}>
            <div style={styles.spinner}/>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {!loading && listings.length === 0 && (
          <div style={styles.empty}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏘️</div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 24, marginBottom: 8, color: '#0f172a' }}>No listings yet</h2>
            <p style={{ color: '#64748b', maxWidth: 400, margin: '0 auto', lineHeight: 1.6 }}>
              We couldn't find any listings matching your filters. Try adjusting the filters above, or help grow Chathouse by adding a building you know about.
            </p>
          </div>
        )}

        {!loading && listings.length > 0 && (
          <div style={styles.grid}>
            {listings.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}
      </main>
    </div>
  )
}

const styles = {
  filters: { background: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 57, zIndex: 40 },
  filtersInner: {
    maxWidth: 1160,
    margin: '0 auto',
    padding: '14px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  searchWrap: { position: 'relative' },
  searchIcon: { position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#94a3b8' },
  searchInput: {
    width: '100%',
    padding: '10px 14px 10px 40px',
    border: '1.5px solid #e2e8f0',
    borderRadius: 10,
    fontSize: 14,
    outline: 'none',
    background: '#f8fafc',
    color: '#0f172a',
  },
  chipGroup: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  chip: {
    padding: '6px 14px',
    border: '1.5px solid #e2e8f0',
    borderRadius: 100,
    background: '#fff',
    fontSize: 12,
    fontWeight: 600,
    color: '#64748b',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  chipActive: { background: '#1a6cf5', color: '#fff', borderColor: '#1a6cf5' },
  main: { maxWidth: 1160, margin: '0 auto', padding: '28px 20px' },
  header: { marginBottom: 20 },
  heading: { fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 700, color: '#0f172a' },
  sub: { fontSize: 14, color: '#64748b', marginTop: 2 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 16,
  },
  center: { display: 'flex', justifyContent: 'center', padding: 60 },
  spinner: {
    width: 36, height: 36, borderRadius: '50%',
    border: '3px solid #e8f0fe', borderTop: '3px solid #1a6cf5',
    animation: 'spin 0.8s linear infinite',
  },
  empty: {
    textAlign: 'center',
    padding: '60px 20px',
    background: '#fff',
    borderRadius: 16,
    border: '1.5px solid #e2e8f0',
  },
}
