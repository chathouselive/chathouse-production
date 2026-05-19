import { useSchools } from '../lib/useSchools'

/* ============================================================
   Inline SVG icon — matches the Icon namespace style used in
   ListingDetail and the rest of the app (line-art, currentColor,
   round caps/joins).
   ============================================================ */
const GraduationCap = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6"/>
    <path d="M2 10l10-5 10 5-10 5z"/>
    <path d="M6 12v5c0 1 3 2 6 2s6-1 6-2v-5"/>
  </svg>
)

/* ============================================================
   Display helpers
   ============================================================ */

/* Convert NCES grade codes (PK/KG/01-12) to display string.
   Examples: PK,02 -> "Grades PK–2"  |  KG,05 -> "Grades K–5"
             09,12 -> "Grades 9–12"  |  null,null -> "" */
function formatGradeRange(low, high) {
  if (!low || !high) return ''
  const fmt = (g) => {
    if (g === 'PK') return 'PK'
    if (g === 'KG') return 'K'
    const n = parseInt(g, 10)
    return isNaN(n) ? g : String(n)
  }
  const lo = fmt(low)
  const hi = fmt(high)
  return `Grades ${lo}–${hi}`
}

/* Convert all-caps or mixed-case city names to Title Case.
   NCES source data is inconsistent (UNION CITY vs Union City);
   we normalize at display time so users see consistent formatting. */
function titleCase(str) {
  if (!str) return ''
  return str
    .toLowerCase()
    .split(' ')
    .map((w) => (w.length === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')
}

/* Map school_type enum to user-facing label.
   'other' intentionally maps to generic "School" — the grade range
   that displays alongside (e.g. "Grades 7–12") tells the real story. */
function schoolTypeLabel(type) {
  switch (type) {
    case 'elementary': return 'Elementary School'
    case 'middle':     return 'Middle School'
    case 'high':       return 'High School'
    default:           return 'School'
  }
}

/* ============================================================
   SchoolsSection
   --------------------------------------------------------------
   Renders nearby schools card on the listing detail page.
   v1: nearby-only (all rows have assignment_type='nearby').
   v2 will add 'assigned' schools when njmls-sync adds school
   name fields to its $select list.
   ============================================================ */
export default function SchoolsSection({ listingId }) {
  const { schools, loading, error } = useSchools(listingId)

  if (!listingId) return null

  /* Defensive filter: drop rows missing a name (shouldn't happen
     given FK with on delete restrict, but if PostgREST ever returns
     a null nested object, we don't render a broken row). */
  const validSchools = (schools || []).filter((s) => s && s.name)

  return (
    <div style={styles.section}>
      <div style={styles.head}>
        <h2 style={styles.h2}>Schools near this address</h2>
        <p style={styles.sub}>Assigned schools coming soon — based on distance from this property.</p>
      </div>

      {loading ? (
        <div style={styles.loadingWrap}>
          <div style={styles.spinner}/>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : error ? (
        <div style={styles.errorState}>
          Unable to load schools right now.
        </div>
      ) : validSchools.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIconWrap}><GraduationCap size={28}/></div>
          <div style={styles.emptyTitle}>No school data yet</div>
          <div style={styles.emptySub}>
            We haven't matched schools to this listing's location yet. Check back soon.
          </div>
        </div>
      ) : (
        <div style={styles.list}>
          {validSchools.map((school) => {
            const grade = formatGradeRange(school.grade_low, school.grade_high)
            const city = titleCase(school.city)
            const typeLabel = schoolTypeLabel(school.school_type)
            /* Build metadata row, dropping empty parts so we don't get
               "Elementary School ·  · Union City" with a double bullet. */
            const meta = [typeLabel, grade, city].filter(Boolean).join(' · ')
            return (
              <div key={school.id} style={styles.row}>
                <div style={styles.iconWrap}><GraduationCap size={18}/></div>
                <div style={styles.middle}>
                  <div style={styles.name}>{school.name}</div>
                  <div style={styles.meta}>{meta}</div>
                </div>
                <div style={styles.distance}>
                  {school.distance_miles != null ? `${school.distance_miles} mi` : ''}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const styles = {
  section: {
    padding: 24, background: '#fff',
    borderRadius: 16,
    borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0',
    boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
    marginBottom: 12,
  },
  head: { marginBottom: 16 },
  h2: { fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 4 },
  sub: { fontSize: 13, color: '#64748b' },

  list: { display: 'flex', flexDirection: 'column', gap: 8 },
  row: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '12px 14px',
    background: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0',
  },
  iconWrap: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 36, height: 36, borderRadius: 8,
    background: '#e8f0fe', color: '#1a6cf5',
    flexShrink: 0,
  },
  middle: { flex: 1, minWidth: 0 },
  name: { fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 2 },
  meta: { fontSize: 12, color: '#64748b' },
  distance: {
    fontSize: 13, fontWeight: 700, color: '#475569',
    flexShrink: 0, marginLeft: 8,
  },

  loadingWrap: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    padding: 40,
  },
  spinner: {
    width: 28, height: 28, borderRadius: '50%',
    borderWidth: 3, borderStyle: 'solid', borderColor: '#e8f0fe',
    borderTopColor: '#1a6cf5',
    animation: 'spin 0.8s linear infinite',
  },

  errorState: {
    padding: 16,
    background: '#fef2f2',
    borderWidth: 1, borderStyle: 'solid', borderColor: '#fecaca',
    borderRadius: 10,
    fontSize: 13, color: '#991b1b',
    textAlign: 'center',
  },

  empty: { textAlign: 'center', padding: 40, background: '#f8fafc', borderRadius: 12 },
  emptyIconWrap: { display: 'flex', justifyContent: 'center', marginBottom: 10, color: '#94a3b8' },
  emptyTitle: { fontWeight: 700, color: '#0f172a', marginBottom: 4, fontSize: 14 },
  emptySub: { fontSize: 13, color: '#64748b', lineHeight: 1.5 },
}