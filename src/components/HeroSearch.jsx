import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

/* ============================================================
   HeroSearch — landing-page hybrid search
   - Big hero-style input (not the icon-toggle pattern from TopNav)
   - Searches BOTH profiles (pros only — landing page is signed-out)
     AND listings in parallel
   - Results sectioned: "People" / "Listings"
   - Exposed via ref so the parent can call .focus() from the hero CTA
   ============================================================ */

const SearchIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

const XIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const PinIcon = ({ size = 11 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)

const HomeIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)

const UsersIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

/* Role pill — same colors as TopNav/UserSearch */
const ROLE_STYLES = {
  agent:      { label: 'Agent',    bg: '#dbeafe', fg: '#1d4ed8' },
  broker:     { label: 'Broker',   bg: '#ede9fe', fg: '#6d28d9' },
  landlord:   { label: 'Landlord', bg: '#dcfce7', fg: '#15803d' },
  management: { label: 'Manager',  bg: '#ffedd5', fg: '#c2410c' },
}

function RolePill({ accountType }) {
  const style = ROLE_STYLES[accountType]
  if (!style) return null
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 7px', borderRadius: 100,
      fontSize: 9, fontWeight: 700,
      letterSpacing: 0.3, textTransform: 'uppercase',
      background: style.bg, color: style.fg,
    }}>
      {style.label}
    </span>
  )
}

function PersonAvatar({ profile, size = 36 }) {
  if (profile?.photo_url) {
    return <img src={profile.photo_url} alt={profile.name} style={{
      width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0,
    }}/>
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, #1A6FE8, #f97316)',
      color: '#fff', fontSize: 14, fontWeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {profile?.name?.[0]?.toUpperCase() || '?'}
    </div>
  )
}

const PRO_ROLES = ['agent', 'broker', 'landlord', 'management']

const HeroSearch = forwardRef(function HeroSearch(_, ref) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [people, setPeople] = useState([])
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const wrapRef = useRef(null)
  const inputRef = useRef(null)

  /* Expose .focus() to the parent so the hero CTA can trigger it */
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus()
      // Smooth-scroll the input into view in case it's below the fold
      inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    },
  }))

  /* ----- Click outside closes the results panel ----- */
  useEffect(() => {
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setFocused(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  /* ----- Debounced parallel search ----- */
  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setPeople([])
      setListings([])
      setLoading(false)
      return
    }

    setLoading(true)
    const timer = setTimeout(() => {
      runSearch(trimmed)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  async function runSearch(searchTerm) {
    /* Parallel queries — profiles (pros only) + listings */
    const [profileResult, listingResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, name, photo_url, account_type, city, license_number')
        .ilike('name', `%${searchTerm}%`)
        .in('account_type', PRO_ROLES)
        .order('name', { ascending: true })
        .limit(4),
      supabase
        .from('listings')
        .select('id, address, city, state, hood, type, price, beds, baths, sqft')
        .or(`address.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,hood.ilike.%${searchTerm}%`)
        .limit(4),
    ])

    if (profileResult.error) {
      console.error('[HeroSearch] profiles query failed:', profileResult.error)
      setPeople([])
    } else {
      setPeople(profileResult.data || [])
    }

    if (listingResult.error) {
      console.error('[HeroSearch] listings query failed:', listingResult.error)
      setListings([])
    } else {
      setListings(listingResult.data || [])
    }

    setLoading(false)
  }

  function handleResultClick() {
    setFocused(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      setFocused(false)
      inputRef.current?.blur()
    }
    if (e.key === 'Enter' && query.trim().length >= 2) {
      // If they hit enter, navigate to the listings page with their search baked in
      // (signed-out users get redirected to signin, which is fine — that's the funnel)
      navigate(`/listings?search=${encodeURIComponent(query.trim())}`)
    }
  }

  function formatPrice(listing) {
    if (!listing.price) return ''
    const n = Number(listing.price).toLocaleString()
    return listing.type === 'rent' ? `$${n}/mo` : `$${n}`
  }

  const showResults = focused && query.trim().length >= 2
  const hasAnyResults = people.length > 0 || listings.length > 0

  return (
    <div style={styles.wrap} ref={wrapRef}>
      <div style={{ ...styles.inputWrap, ...(focused ? styles.inputWrapFocused : {}) }}>
        <span style={styles.inputIcon}><SearchIcon size={20}/></span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search any address, neighborhood, or agent name..."
          style={styles.input}
          aria-label="Search Chathouse"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); inputRef.current?.focus() }}
            style={styles.clearBtn}
            aria-label="Clear search"
          >
            <XIcon />
          </button>
        )}
      </div>

      {showResults && (
        <div style={styles.panel}>
          {loading ? (
            <div style={styles.loadingRow}>
              <div style={styles.spinner}/>
              <style>{`@keyframes hsspin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : !hasAnyResults ? (
            <div style={styles.noResults}>
              <div style={{ fontWeight: 700, color: '#0F1F3D', marginBottom: 4, fontSize: 13 }}>
                No matches for "{query}"
              </div>
              <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                Try a different address, city name, or agent name.
              </div>
            </div>
          ) : (
            <>
              {/* People section */}
              {people.length > 0 && (
                <div style={styles.section}>
                  <div style={styles.sectionLabel}>
                    <UsersIcon size={12}/> People
                  </div>
                  {people.map(p => (
                    <button
                      key={`p-${p.id}`}
                      onClick={() => { handleResultClick(); navigate(`/profile/${p.id}`) }}
                      style={styles.resultRow}
                    >
                      <PersonAvatar profile={p} size={36}/>
                      <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                        <div style={styles.resultName}>{p.name}</div>
                        <div style={styles.resultMeta}>
                          <RolePill accountType={p.account_type}/>
                          {p.city && <span style={styles.resultCity}>· {p.city}</span>}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Listings section */}
              {listings.length > 0 && (
                <div style={styles.section}>
                  <div style={styles.sectionLabel}>
                    <HomeIcon size={12}/> Listings
                  </div>
                  {listings.map(l => (
                    <button
                      key={`l-${l.id}`}
                      onClick={() => { handleResultClick(); navigate(`/listing/${l.id}`) }}
                      style={styles.resultRow}
                    >
                      <div style={styles.listingThumb}>
                        <HomeIcon size={16}/>
                      </div>
                      <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                        <div style={styles.resultName}>{formatPrice(l)} · {l.address}</div>
                        <div style={styles.resultMeta}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#64748b' }}>
                            <PinIcon size={10}/>
                            {l.hood || l.city}{l.state ? `, ${l.state}` : ''}
                          </span>
                          {l.beds != null && (
                            <span style={styles.resultCity}>
                              · {l.beds} bd{l.baths != null ? ` · ${l.baths} ba` : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Footer CTA */}
              <button
                onClick={() => { handleResultClick(); navigate('/signup') }}
                style={styles.footerCta}
              >
                Sign up free to message anyone and post comments →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
})

export default HeroSearch

const styles = {
  wrap: {
    position: 'relative',
    width: '100%',
    maxWidth: 580,
    margin: '0 auto',
  },

  inputWrap: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '14px 18px',
    background: '#fff',
    borderRadius: 14,
    borderWidth: 1.5, borderStyle: 'solid', borderColor: '#e2e8f0',
    boxShadow: '0 4px 16px rgba(15, 23, 42, 0.06)',
    transition: 'border-color 120ms ease, box-shadow 120ms ease',
  },
  inputWrapFocused: {
    borderColor: '#1A6FE8',
    boxShadow: '0 8px 28px rgba(26, 111, 232, 0.15)',
  },
  inputIcon: {
    color: '#94a3b8',
    display: 'flex', alignItems: 'center',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: 16,
    color: '#0F1F3D',
    background: 'transparent',
    fontFamily: 'inherit',
    minWidth: 0,
  },
  clearBtn: {
    width: 28, height: 28,
    borderRadius: 8,
    background: '#f1f5f9',
    border: 'none',
    cursor: 'pointer',
    color: '#94a3b8',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
    transition: 'background 120ms ease, color 120ms ease',
  },

  panel: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: 0, right: 0,
    background: '#fff',
    borderRadius: 14,
    borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0',
    boxShadow: '0 12px 40px rgba(15, 23, 42, 0.12), 0 4px 12px rgba(15, 23, 42, 0.06)',
    zIndex: 100,
    overflow: 'hidden',
    maxHeight: 480,
    overflowY: 'auto',
    animation: 'chathouseHeroIn 150ms ease-out',
  },

  loadingRow: { display: 'flex', justifyContent: 'center', padding: 28 },
  spinner: {
    width: 24, height: 24, borderRadius: '50%',
    borderWidth: 2.5, borderStyle: 'solid', borderColor: '#e8f0fe',
    borderTopColor: '#1A6FE8',
    animation: 'hsspin 0.8s linear infinite',
  },

  noResults: {
    padding: '24px 18px',
    textAlign: 'center',
  },

  section: {
    paddingTop: 6, paddingBottom: 6,
  },
  sectionLabel: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 16px 6px',
    fontSize: 10,
    fontWeight: 800,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  resultRow: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 16px',
    width: '100%',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'background 100ms ease',
    fontFamily: 'inherit',
  },
  resultName: {
    fontSize: 13, fontWeight: 700, color: '#0F1F3D',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
    marginBottom: 2,
  },
  resultMeta: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 11, color: '#64748b',
    flexWrap: 'wrap',
  },
  resultCity: { color: '#94a3b8' },

  listingThumb: {
    width: 36, height: 36, borderRadius: 8,
    background: '#eef4fd', color: '#1A6FE8',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },

  footerCta: {
    display: 'block',
    width: '100%',
    padding: '14px 16px',
    fontSize: 12,
    fontWeight: 700,
    color: '#1A6FE8',
    background: '#f8fafc',
    border: 'none',
    borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: '#f1f5f9',
    cursor: 'pointer',
    textAlign: 'center',
    fontFamily: 'inherit',
  },
}

/* Inject keyframes once */
if (typeof document !== 'undefined' && !document.getElementById('chathouse-hero-anim')) {
  const styleEl = document.createElement('style')
  styleEl.id = 'chathouse-hero-anim'
  styleEl.textContent = `
    @keyframes chathouseHeroIn {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `
  document.head.appendChild(styleEl)
}