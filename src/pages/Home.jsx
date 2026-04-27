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

/* ============================================================
   Inline SVG icons
   ============================================================ */
const Icon = {
  Search: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Plus: ({ size = 13 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Building: ({ size = 36 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 6h.01"/><path d="M15 6h.01"/><path d="M9 10h.01"/><path d="M15 10h.01"/><path d="M9 14h.01"/><path d="M15 14h.01"/><path d="M10 22v-4h4v4"/>
    </svg>
  ),
  ArrowRight: ({ size = 13 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
}

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
            <span style={styles.searchIcon}><Icon.Search size={14}/></span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search any address, city, or neighborhood..."
              style={styles.searchInput}
            />
          </div>

          <div style={styles.filterRow}>
            <span style={styles.filterLabel}>Type</span>
            <div style={styles.chipGroup}>
              {TYPES.map(t => (
                <button key={t.value} onClick={() => setType(t.value)}
                  style={{ ...styles.chip, ...(type === t.value ? styles.chipActive : {}) }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.filterRow}>
            <span style={styles.filterLabel}>Area</span>
            <div style={styles.chipGroup}>
              {CITIES.map(c => (
                <button key={c} onClick={() => setCity(c)}
                  style={{ ...styles.chip, ...(city === c ? styles.chipActive : {}) }}>
                  {c}
                </button>
              ))}
            </div>
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
          <Link to="/add-listing" style={styles.addBtn}>
            <Icon.Plus size={13}/> Add building
          </Link>
        </div>

        {loading && (
          <div style={styles.center}>
            <div style={styles.spinner}/>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {showAddBuildingCTA && (
          <div style={styles.ctaBanner}>
            <div style={styles.ctaIconWrap}><Icon.Building size={28}/></div>
            <h2 style={styles.ctaTitle}>Don't see "{search}"?</h2>
            <p style={styles.ctaBody}>
              Chathouse is built by the community. Add this building so you and others can leave honest comments about it.
            </p>
            <Link to="/add-listing" style={styles.ctaBtn}>
              Add this building to Chathouse <Icon.ArrowRight size={13}/>
            </Link>
          </div>
        )}

        {!loading && !showAddBuildingCTA && listings.length === 0 && (
          <div style={styles.empty}>
            <div style={styles.emptyIconWrap}><Icon.Building size={32}/></div>
            <h2 style={styles.emptyTitle}>No listings match</h2>
            <p style={styles.emptyBody}>Try adjusting your filters or search for an address directly.</p>
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
  filters: {
    background: '#fff',
    borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: '#e2e8f0',
    position: 'sticky', top: 57, zIndex: 40,
  },
  filtersInner: {
    maxWidth: 1160, margin: '0 auto',
    padding: '14px 20px',
    display: 'flex', flexDirection: 'column', gap: 10,
  },
  searchWrap: { position: 'relative' },
  searchIcon: {
    position: 'absolute', left: 14, top: '50%',
    transform: 'translateY(-50%)',
    color: '#94a3b8',
    display: 'flex', alignItems: 'center',
  },
  searchInput: {
    width: '100%',
    padding: '10px 14px 10px 40px',
    borderWidth: 1.5, borderStyle: 'solid', borderColor: '#e2e8f0',
    borderRadius: 10, fontSize: 14, outline: 'none',
    background: '#f8fafc', color: '#0f172a',
    boxSizing: 'border-box',
  },
  filterRow: {
    display: 'flex', alignItems: 'center', gap: 10,
    flexWrap: 'wrap',
  },
  filterLabel: {
    fontSize: 11, fontWeight: 700, color: '#94a3b8',
    textTransform: 'uppercase', letterSpacing: 0.5,
    minWidth: 38,
  },
  chipGroup: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  chip: {
    padding: '6px 14px',
    borderWidth: 1.5, borderStyle: 'solid', borderColor: '#e2e8f0',
    borderRadius: 100, background: '#fff',
    fontSize: 12, fontWeight: 600, color: '#64748b',
    cursor: 'pointer', whiteSpace: 'nowrap',
    transition: 'background 120ms ease, color 120ms ease, border-color 120ms ease',
  },
  chipActive: { background: '#1a6cf5', color: '#fff', borderColor: '#1a6cf5' },

  main: { maxWidth: 1160, margin: '0 auto', padding: '28px 20px' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
    marginBottom: 20, flexWrap: 'wrap', gap: 12,
  },
  heading: { fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 700, color: '#0f172a', margin: 0 },
  sub: { fontSize: 14, color: '#64748b', marginTop: 2 },
  addBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '10px 16px',
    background: '#1a6cf5', color: '#fff',
    borderRadius: 10, fontSize: 13, fontWeight: 700,
    textDecoration: 'none', whiteSpace: 'nowrap',
    transition: 'background 120ms ease',
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 },
  center: { display: 'flex', justifyContent: 'center', padding: 60 },
  spinner: {
    width: 36, height: 36, borderRadius: '50%',
    borderWidth: 3, borderStyle: 'solid', borderColor: '#e8f0fe',
    borderTopColor: '#1a6cf5',
    animation: 'spin 0.8s linear infinite',
  },

  empty: {
    textAlign: 'center', padding: '60px 20px',
    background: '#fff', borderRadius: 16,
    borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0',
  },
  emptyIconWrap: { display: 'flex', justifyContent: 'center', marginBottom: 12, color: '#94a3b8' },
  emptyTitle: { fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 6 },
  emptyBody: { color: '#64748b', maxWidth: 400, margin: '0 auto', lineHeight: 1.6, fontSize: 14 },

  ctaBanner: {
    textAlign: 'center', padding: '40px 20px',
    background: '#fff',
    borderRadius: 16,
    borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0',
    borderLeftWidth: 3, borderLeftColor: '#1a6cf5',
    boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
  },
  ctaIconWrap: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 56, height: 56, borderRadius: 14,
    background: '#e8f0fe', color: '#1a6cf5',
    marginBottom: 14,
  },
  ctaTitle: {
    fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 700,
    color: '#0f172a', marginBottom: 6,
  },
  ctaBody: {
    color: '#64748b', maxWidth: 420, margin: '0 auto 16px',
    lineHeight: 1.55, fontSize: 14,
  },
  ctaBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '12px 22px',
    background: '#1a6cf5', color: '#fff',
    borderRadius: 10, fontSize: 14, fontWeight: 700,
    textDecoration: 'none',
    transition: 'background 120ms ease',
  },
}