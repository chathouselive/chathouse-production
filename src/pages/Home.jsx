import { Link } from 'react-router-dom'
import { useState } from 'react'
import TopNav from '../components/TopNav'
import ListingCard from '../components/ListingCard'
import Footer from '../components/Footer'
import { useListings } from '../lib/useListings'
import { useAISearch } from '../lib/useAISearch'

const CITIES = ['All', 'Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Jersey City', 'Hoboken', 'Newark', 'Weehawken', 'Hackensack']
const TYPES = [
  { value: 'All', label: 'All' },
  { value: 'rent', label: 'For Rent' },
  { value: 'sale', label: 'For Sale' },
]

/* ============================================================
   Type bucket display helper
   Used for the subheading "X · Rentals" / "X · For Sale".
   ============================================================ */
function getTypeLabel(typeBucket) {
  if (typeBucket === 'rent' || typeBucket === 'rental') return 'Rentals'
  if (typeBucket === 'sale') return 'For Sale'
  return ''
}

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
  Sparkle: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/>
      <path d="M19 15l.7 2.1L22 18l-2.3.9L19 21l-.7-2.1L16 18l2.3-.9z"/>
    </svg>
  ),
  X: ({ size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
}

export default function Home() {
  const [city, setCity] = useState('All')
  const [type, setType] = useState('All')
  const [search, setSearch] = useState('')

  // AI search hook — debounces, calls Edge Function, returns parsed filters.
  // Returns null filters when the query is short/simple, so the existing
  // text-search behavior in useListings runs unchanged in that case.
  const { aiFilters, aiRecap, aiLoading, aiError, clearAISearch } = useAISearch(search)

  // When AI returned filters, suppress the simple text search so we don't
  // double-filter. AI filters fully replace text search for that query.
  // If AI is loading or failed, fall back to text search using raw input.
  const effectiveSearch = aiFilters ? '' : search

  const { listings, loading, loadingMore, hasMore, loadMore } = useListings({
    city,
    type,
    search: effectiveSearch,
    aiFilters,
  })

  const showAddBuildingCTA = search.length > 3 && !loading && listings.length === 0 && !aiLoading

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <TopNav />

      <div style={styles.filters}>
        <div style={styles.filtersInner}>
          <div style={styles.searchWrap}>
            <span style={styles.searchIcon}>
              {aiLoading ? <span style={styles.searchSpinner}/> : <Icon.Search size={14}/>}
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search address, neighborhood, or describe your dream home..."
              style={styles.searchInput}
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); clearAISearch() }}
                style={styles.searchClearBtn}
                aria-label="Clear search"
              >
                <Icon.X size={12}/>
              </button>
            )}
          </div>

          {/* AI recap chip — shows the user what we understood from their query */}
          {aiFilters && aiRecap && (
            <div style={styles.aiRecap}>
              <span style={styles.aiRecapIcon}><Icon.Sparkle size={13}/></span>
              <span style={styles.aiRecapLabel}>AI search:</span>
              <span style={styles.aiRecapText}>{aiRecap}</span>
            </div>
          )}

          {/* AI error — soft fallback, doesn't break the page */}
          {aiError && (
            <div style={styles.aiError}>
              AI search hit an issue — falling back to text search.
            </div>
          )}

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
              {type !== 'All' && ` · ${getTypeLabel(type)}`}
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
          <>
            <div style={styles.grid}>
              {listings.map(l => <ListingCard key={l.id} listing={l} />)}
            </div>

            {hasMore && (
              <div style={styles.loadMoreWrap}>
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  style={{
                    ...styles.loadMoreBtn,
                    ...(loadingMore ? styles.loadMoreBtnDisabled : {}),
                  }}
                >
                  {loadingMore ? 'Loading...' : 'Load more listings'}
                </button>
              </div>
            )}
          </>
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
  searchSpinner: {
    width: 14, height: 14, borderRadius: '50%',
    borderWidth: 2, borderStyle: 'solid', borderColor: '#e2e8f0',
    borderTopColor: '#1a6cf5',
    animation: 'spin 0.8s linear infinite',
    display: 'inline-block',
  },
  searchInput: {
    width: '100%',
    padding: '10px 36px 10px 40px',
    borderWidth: 1.5, borderStyle: 'solid', borderColor: '#e2e8f0',
    borderRadius: 10, fontSize: 14, outline: 'none',
    background: '#f8fafc', color: '#0f172a',
    boxSizing: 'border-box',
  },
  searchClearBtn: {
    position: 'absolute', right: 10, top: '50%',
    transform: 'translateY(-50%)',
    width: 22, height: 22, borderRadius: '50%',
    borderWidth: 0, background: '#e2e8f0',
    color: '#64748b',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 0,
  },

  aiRecap: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 12px',
    background: '#eef2ff',
    borderRadius: 8,
    fontSize: 13, color: '#3730a3',
    flexWrap: 'wrap',
  },
  aiRecapIcon: {
    display: 'flex', alignItems: 'center',
    color: '#6366f1',
  },
  aiRecapLabel: { fontWeight: 700, color: '#4338ca' },
  aiRecapText: { color: '#3730a3' },

  aiError: {
    padding: '8px 12px',
    background: '#fef3c7',
    borderRadius: 8,
    fontSize: 12, color: '#92400e',
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

  loadMoreWrap: {
    display: 'flex', justifyContent: 'center',
    marginTop: 28,
  },
  loadMoreBtn: {
    padding: '12px 28px',
    background: '#fff',
    color: '#1a6cf5',
    borderWidth: 1.5, borderStyle: 'solid', borderColor: '#1a6cf5',
    borderRadius: 10,
    fontSize: 14, fontWeight: 700,
    cursor: 'pointer',
    transition: 'background 120ms ease, color 120ms ease',
  },
  loadMoreBtnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
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