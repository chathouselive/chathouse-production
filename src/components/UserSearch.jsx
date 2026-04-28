import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

/* ============================================================
   UserSearch — search for users by name
   - Signed-out: returns ONLY pro accounts (agent/broker/landlord/management)
   - Signed-in: returns all matching profiles
   - Debounced 300ms, click-outside + ESC to close
   ============================================================ */

const SearchIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

const XIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

/* Role pill — same colors as TopNav */
const ROLE_STYLES = {
  buyer:      { label: 'Buyer',    bg: '#f1f5f9', fg: '#475569' },
  renter:     { label: 'Renter',   bg: '#f1f5f9', fg: '#475569' },
  agent:      { label: 'Agent',    bg: '#dbeafe', fg: '#1d4ed8' },
  broker:     { label: 'Broker',   bg: '#ede9fe', fg: '#6d28d9' },
  landlord:   { label: 'Landlord', bg: '#dcfce7', fg: '#15803d' },
  management: { label: 'Manager',  bg: '#ffedd5', fg: '#c2410c' },
}

function RolePill({ accountType }) {
  const style = ROLE_STYLES[accountType] || ROLE_STYLES.buyer
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 7px',
      borderRadius: 100,
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: 0.3,
      textTransform: 'uppercase',
      background: style.bg,
      color: style.fg,
    }}>
      {style.label}
    </span>
  )
}

function ResultAvatar({ profile, size = 36 }) {
  if (profile?.photo_url) {
    return <img src={profile.photo_url} alt={profile.name} style={{
      width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0,
    }}/>
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, #1a6cf5, #f97316)',
      color: '#fff', fontSize: 14, fontWeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {profile?.name?.[0]?.toUpperCase() || '?'}
    </div>
  )
}

const PRO_ROLES = ['agent', 'broker', 'landlord', 'management']

export default function UserSearch() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const wrapRef = useRef(null)
  const inputRef = useRef(null)

  /* ----- Click outside + ESC to close ----- */
  useEffect(() => {
    if (!open) return
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  /* ----- Focus input when opened ----- */
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      // Reset query on close so it's fresh next time
      setQuery('')
      setResults([])
    }
  }, [open])

  /* ----- Debounced search ----- */
  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    const timer = setTimeout(() => {
      runSearch(trimmed)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, user])

  async function runSearch(searchTerm) {
    let q = supabase
      .from('profiles')
      .select('id, name, photo_url, account_type, city, license_number')
      .ilike('name', `%${searchTerm}%`)
      .order('name', { ascending: true })
      .limit(8)

    // Signed-out viewers can only find pro profiles
    if (!user) {
      q = q.in('account_type', PRO_ROLES)
    }

    const { data, error } = await q

    if (error) {
      console.error('[UserSearch] query failed:', error)
      setResults([])
    } else {
      setResults(data || [])
    }
    setLoading(false)
  }

  function handleResultClick() {
    setOpen(false)
  }

  return (
    <div style={styles.wrap} ref={wrapRef}>
      {/* ===== Toggle button ===== */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{ ...styles.toggleBtn, ...(open ? styles.toggleBtnActive : {}) }}
        aria-label="Search users"
        title="Search users"
      >
        <SearchIcon />
      </button>

      {/* ===== Expanded search panel ===== */}
      {open && (
        <div style={styles.panel}>
          <div style={styles.inputRow}>
            <span style={styles.inputIcon}><SearchIcon size={14}/></span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={user ? 'Search agents, brokers, neighbors...' : 'Search agents, brokers, landlords...'}
              style={styles.input}
            />
            {query && (
              <button onClick={() => setQuery('')} style={styles.clearBtn} aria-label="Clear search">
                <XIcon />
              </button>
            )}
          </div>

          <div style={styles.resultsArea}>
            {query.trim().length < 2 ? (
              <div style={styles.hintEmpty}>
                {user
                  ? 'Type a name to find agents, brokers, landlords, neighbors, and more.'
                  : 'Type a name to find agents, brokers, landlords, and property managers.'}
              </div>
            ) : loading ? (
              <div style={styles.loadingRow}>
                <div style={styles.spinner}/>
                <style>{`@keyframes uschspin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : results.length === 0 ? (
              <div style={styles.noResults}>
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4, fontSize: 13 }}>
                  No matches for "{query}"
                </div>
                <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                  {user
                    ? 'Try a different name or partial spelling.'
                    : 'Search shows agents, brokers, landlords, and property managers. Sign up to find anyone.'}
                </div>
                {!user && (
                  <Link to="/signup" style={styles.signUpCta} onClick={handleResultClick}>
                    Sign up free →
                  </Link>
                )}
              </div>
            ) : (
              <div style={styles.resultsList}>
                {results.map(p => (
                  <Link
                    key={p.id}
                    to={`/profile/${p.id}`}
                    style={styles.resultRow}
                    onClick={handleResultClick}
                  >
                    <ResultAvatar profile={p} size={36}/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={styles.resultName}>{p.name}</div>
                      <div style={styles.resultMeta}>
                        <RolePill accountType={p.account_type}/>
                        {p.city && <span style={styles.resultCity}>· {p.city}</span>}
                      </div>
                    </div>
                  </Link>
                ))}
                {!user && results.length > 0 && (
                  <Link to="/signup" style={styles.signUpFooter} onClick={handleResultClick}>
                    Sign up free to find anyone on Chathouse →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  wrap: { position: 'relative' },

  toggleBtn: {
    width: 36, height: 36,
    borderRadius: 8,
    background: '#f1f5f9',
    border: 'none',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#475569',
    transition: 'background 120ms ease, color 120ms ease',
  },
  toggleBtnActive: { background: '#e8f0fe', color: '#1a6cf5' },

  panel: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    width: 380,
    maxWidth: 'calc(100vw - 32px)',
    background: '#fff',
    borderRadius: 12,
    borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0',
    boxShadow: '0 10px 40px rgba(15, 23, 42, 0.12), 0 2px 8px rgba(15, 23, 42, 0.06)',
    zIndex: 100,
    overflow: 'hidden',
    animation: 'chathouseDropdownIn 150ms ease-out',
  },

  inputRow: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 12px',
    borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: '#f1f5f9',
  },
  inputIcon: {
    color: '#94a3b8', display: 'flex', alignItems: 'center', flexShrink: 0,
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: 14,
    color: '#0f172a',
    background: 'transparent',
    fontFamily: 'inherit',
  },
  clearBtn: {
    width: 24, height: 24,
    borderRadius: 6,
    background: '#f1f5f9',
    border: 'none',
    cursor: 'pointer',
    color: '#94a3b8',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
    transition: 'background 120ms ease, color 120ms ease',
  },

  resultsArea: { maxHeight: 400, overflowY: 'auto' },

  hintEmpty: {
    padding: '20px 16px',
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 1.5,
    textAlign: 'center',
  },

  loadingRow: { display: 'flex', justifyContent: 'center', padding: 24 },
  spinner: {
    width: 24, height: 24, borderRadius: '50%',
    borderWidth: 2.5, borderStyle: 'solid', borderColor: '#e8f0fe',
    borderTopColor: '#1a6cf5',
    animation: 'uschspin 0.8s linear infinite',
  },

  noResults: {
    padding: '20px 16px',
    textAlign: 'center',
  },
  signUpCta: {
    display: 'inline-block',
    marginTop: 12,
    padding: '8px 16px',
    background: '#1a6cf5',
    color: '#fff',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 700,
    textDecoration: 'none',
  },

  resultsList: { padding: '4px 0' },
  resultRow: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 14px',
    textDecoration: 'none',
    transition: 'background 100ms ease',
    cursor: 'pointer',
  },
  resultName: {
    fontSize: 13, fontWeight: 700, color: '#0f172a',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
    marginBottom: 2,
  },
  resultMeta: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 11, color: '#64748b',
  },
  resultCity: { color: '#94a3b8' },

  signUpFooter: {
    display: 'block',
    padding: '12px 14px',
    fontSize: 12,
    fontWeight: 700,
    color: '#1a6cf5',
    background: '#f8fafc',
    textDecoration: 'none',
    borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: '#f1f5f9',
    textAlign: 'center',
  },
}