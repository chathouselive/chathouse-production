import { Link } from 'react-router-dom'
import { useState } from 'react'
import TopNav from '../components/TopNav'
import ListingCard from '../components/ListingCard'
import Footer from '../components/Footer'
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

  const showAddBuildingCTA = search.length > 3 && !loading && listings.length === 0

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
              placeholder="Search any address, city, or neighborhood..."
              style={styles.searchInput}
            />
          </div>
          <div style={styles.chipGroup}>
            {TYPES.map(t => (
              <button key={t.value} onClick={() => setType(t.value)} style={{ ...styles.chip, ...(type === t.value ? styles.chipActive : {}) }}>
                {t.label}
              </button>
            ))}
          </div>
          <div style={styles.chipGroup}>
            {CITIES.map(c => (
              <button key={c} onClick={() => setCity(c)} style={{ ...styles.chip, ...(city === c ? styles.chipActive : {}) }}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.heading}>
              {loading ? 'Loading...' : `${listings.length} listing${listings.length === 1 ? '' : 's'}`}
            </h1>
            <p style={styles.sub}>
              {city === 'All' ? 'All areas' : city}
              {type !== 'All' && ` · ${type === 'rent' ? 'Rentals' : 'For Sale'}`}
            </p>
          </div>
          <Link to="/add-listing" style={styles.addBtn}>+ Add building</Link>
        </div>

        {loading && (
          <div style={styles.center}>
            <div style={styles.spinner}/>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {showAddBuildingCTA && (
          <div style={styles.ctaBanner}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🏘️</div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22, marginBottom: 6, color: '#0f172a' }}>
              Don't see "{search}"?
            </h2>
            <p style={{ color: '#64748b', maxWidth: 420, margin: '0 auto 16px', lineHeight: 1.55, fontSize: 14 }}>
              Chathouse is built by the community. Add this building so you and others can leave honest comments about it.
            </p>
            <Link to="/add-listing" style={styles.ctaBtn}>Add this building to Chathouse →</Link>
          </div>
        )}

        {!loading && !showAddBuildingCTA && listings.length === 0 && (
          <div style={styles.empty}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏘️</div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 24, marginBottom: 8, color: '#0f172a' }}>No listings match</h2>
            <p style={{ color: '#64748b', maxWidth: 400, margin: '0 auto', lineHeight: 1.6, fontSize: 14 }}>
              Try adjusting your filters or search for an address directly.
            </p>
          </div>
        )}

        {!loading && listings.length > 0 && (
          <div style={styles.grid}>
            {listings.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

const styles = {
  filters: { background: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 57, zIndex: 40 },
  filtersInner: { maxWidth: 1160, margin: '0 auto', padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 10 },
  searchWrap: { position: 'relative' },
  searchIcon: { position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#94a3b8' },
  searchInput: { width: '100%', padding: '10px 14px 10px 40px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, outline: 'none', background: '#f8fafc', color: '#0f172a' },
  chipGroup: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  chip: { padding: '6px 14px', border: '1.5px solid #e2e8f0', borderRadius: 100, background: '#fff', fontSize: 12, fontWeight: 600, color: '#64748b', cursor: 'pointer', whiteSpace: 'nowrap' },
  chipActive: { background: '#1a6cf5', color: '#fff', borderColor: '#1a6cf5' },
  main: { maxWidth: 1160, margin: '0 auto', padding: '28px 20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20, flexWrap: 'wrap', gap: 12 },
  heading: { fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 700, color: '#0f172a' },
  sub: { fontSize: 14, color: '#64748b', marginTop: 2 },
  addBtn: { padding: '10px 16px', background: '#7c3aed', color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 },
  center: { display: 'flex', justifyContent: 'center', padding: 60 },
  spinner: { width: 36, height: 36, borderRadius: '50%', border: '3px solid #e8f0fe', borderTop: '3px solid #1a6cf5', animation: 'spin 0.8s linear infinite' },
  empty: { textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 16, border: '1.5px solid #e2e8f0' },
  ctaBanner: { textAlign: 'center', padding: '40px 20px', background: 'linear-gradient(135deg, #f3e8ff, #fff)', borderRadius: 16, border: '1.5px solid rgba(124,58,237,0.2)' },
  ctaBtn: { display: 'inline-block', padding: '12px 22px', background: '#7c3aed', color: '#fff', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none' },
}
