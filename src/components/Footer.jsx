import { Link, useLocation } from 'react-router-dom'

function ChathouseLogo({ height = 28 }) {
  return (
    <svg height={height} viewBox="0 0 600 140" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <g transform="translate(24, 16) scale(0.84)">
        <polygon points="54,0 108,46 96,46 96,108 12,108 12,46 0,46" fill="#fff"/>
        <rect x="38" y="72" width="32" height="36" rx="4" fill="#0f172a"/>
        <rect x="58" y="18" width="36" height="28" rx="7" fill="#0f172a"/>
        <polygon points="62,46 74,46 66,54" fill="#0f172a"/>
        <circle cx="67" cy="32" r="3" fill="#fff"/>
        <circle cx="76" cy="32" r="3" fill="#fff"/>
        <circle cx="85" cy="32" r="3" fill="#fff"/>
      </g>
      <text x="120" y="84" fontFamily="Arial, Helvetica, sans-serif" fontSize="58" letterSpacing="-2">
        <tspan fontWeight="800" fill="#fff">chat</tspan>
        <tspan fontWeight="400" fill="#93c5fd" letterSpacing="-2">house</tspan>
      </text>
      <text x="120" y="112" fontFamily="Arial, Helvetica, sans-serif" fontWeight="400" fontSize="13" fill="#475569" letterSpacing="1.5">FIND. TALK. MOVE.</text>
    </svg>
  )
}

export default function Footer() {
  const year = new Date().getFullYear()
  const { pathname } = useLocation()

  /* Show the brokerage disclosure block only on pages where MLS listing data is
     displayed or could be displayed. The NJ co-branding rule applies when both
     brands are presented to the consumer simultaneously — on internal product
     pages (profile, dashboard, messages, etc.) Chathouse is the only brand
     present, so no co-branding disclosure is required.

     Allowed routes:
       /                  Landing page
       /listings          Listings index (Home.jsx)
       /listing/:id       Individual listing detail page
       /saved             Saved MLS listings

     IMPORTANT: use startsWith('/listing/') WITH the trailing slash so it
     matches /listing/abc-123 but NOT /listings (which would otherwise match
     '/listing' as a prefix). */
  const showBrokerBlock =
    pathname === '/' ||
    pathname === '/listings' ||
    pathname === '/saved' ||
    pathname.startsWith('/listing/')

  return (
    <footer style={styles.footer}>
      <div style={styles.footerInner}>

        {/* ============= Top row: brand + nav columns ============= */}
        <div style={styles.topRow}>
          <div style={styles.brand}>
            <div style={styles.logoWrap}>
              <ChathouseLogo height={32} />
            </div>
            <p style={styles.tagline}>
              Community-sourced transparency for every address — before you sign.
            </p>
            <p style={styles.fair}>
              <span style={styles.fairBadge}>⚖️ Fair Housing</span>
              We are committed to the Fair Housing Act. We do not discriminate on the basis of race, color, religion, sex, national origin, disability, or familial status.
            </p>
          </div>

          <div style={styles.navColumns}>
            <div style={styles.navCol}>
              <div style={styles.navHeader}>Platform</div>
              <Link to="/" style={styles.navLink}>Browse Listings</Link>
              <Link to="/add-listing" style={styles.navLink}>Add a Listing</Link>
              <Link to="/signup" style={styles.navLink}>Create Account</Link>
              <Link to="/signin" style={styles.navLink}>Sign In</Link>
            </div>
            <div style={styles.navCol}>
              <div style={styles.navHeader}>Legal</div>
              <Link to="/privacy" style={styles.navLink}>Privacy Policy</Link>
              <Link to="/terms" style={styles.navLink}>Terms of Service</Link>
              <Link to="/fair-housing" style={styles.navLink}>Fair Housing</Link>
            </div>
            <div style={styles.navCol}>
              <div style={styles.navHeader}>Company</div>
              <a href="mailto:hello@chathouselive.com" style={styles.navLink}>Contact Us</a>
              <a href="https://chathouselive.com" style={styles.navLink}>chathouselive.com</a>
            </div>
          </div>
        </div>

        {/* ============= Brokerage Disclosure block =============
            Only rendered on pages where MLS listing data is displayed.
            Hidden on profiles, dashboards, messages, settings, admin, etc.
            See showBrokerBlock logic at top of component. */}
        {showBrokerBlock && (
          <div style={styles.brokerBlock}>
            <div style={styles.brokerBlockLabel}>Brokerage of Record</div>

            <div style={styles.brokerBrandRow}>
              <img
                src="/brokers/exp-logo.png"
                alt="eXp Realty, LLC"
                style={styles.expLogo}
              />
              <div style={styles.brokerBrandInfo}>
                <div style={styles.brokerName}>eXp Realty, LLC</div>
                <div style={styles.brokerAddress}>
                  28 Valley Road, #1, Montclair, NJ 07042 · <a href="tel:9734050095" style={styles.brokerPhone}>(973) 405-0095</a>
                </div>
              </div>
            </div>

            <div style={styles.brokerDivider} />

            <p style={styles.brokerLead}>
              Listings displayed on Chathouse are provided through <strong style={styles.brokerHighlight}>eXp Realty, LLC</strong>, a participating member of the New Jersey Multiple Listing Service, Inc. (NJMLS). Your eXp Realty point of contact for this site is <strong style={styles.brokerHighlight}>Naeem Boucher, Realtor</strong> (NJ Real Estate License #1017034).
            </p>

            <p style={styles.brokerIDX}>
              Real estate listing data displayed on Chathouse is provided through the NJMLS Internet Data Exchange (IDX) program. Information deemed reliable but not guaranteed. Chathouse is the technology platform that displays this data; eXp Realty, LLC is the brokerage of record. © {year} New Jersey Multiple Listing Service, Inc. All rights reserved.
            </p>
          </div>
        )}

        <div style={styles.divider} />

        {/* ============= Bottom row ============= */}
        <div style={styles.bottomRow}>
          <p style={styles.copyright}>© {year} Chathouse · All rights reserved</p>
          <div style={styles.bottomLinks}>
            <Link to="/privacy" style={styles.bottomLink}>Privacy</Link>
            <span style={styles.dot}>·</span>
            <Link to="/terms" style={styles.bottomLink}>Terms</Link>
            <span style={styles.dot}>·</span>
            <Link to="/fair-housing" style={styles.bottomLink}>Fair Housing</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

const styles = {
  footer: { background: '#0f172a', color: '#fff', padding: '56px 20px 32px' },
  footerInner: { maxWidth: 1100, margin: '0 auto' },

  // Top row
  topRow: { display: 'flex', gap: 60, flexWrap: 'wrap', marginBottom: 40 },
  brand: { flex: '1 1 260px', maxWidth: 320 },
  logoWrap: { marginBottom: 12 },
  tagline: { fontSize: 13, color: '#94a3b8', lineHeight: 1.65, marginBottom: 16 },
  fair: { fontSize: 11, color: '#64748b', lineHeight: 1.7 },
  fairBadge: { display: 'inline-block', background: 'rgba(26,108,245,0.15)', color: '#93c5fd', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, marginRight: 6, marginBottom: 6, letterSpacing: 0.5 },
  navColumns: { display: 'flex', gap: 48, flexWrap: 'wrap', flex: '1 1 auto' },
  navCol: { display: 'flex', flexDirection: 'column', gap: 10, minWidth: 120 },
  navHeader: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: '#475569', marginBottom: 4 },
  navLink: { fontSize: 13, color: '#94a3b8', textDecoration: 'none', lineHeight: 1.4 },

  // Brokerage block — eXp Realty is the dominant brand here
  brokerBlock: {
    background: '#162032',
    borderRadius: 12,
    padding: 28,
    marginBottom: 32,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#1e293b',
  },
  brokerBlockLabel: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    color: '#93c5fd',
    marginBottom: 18,
  },

  // Brand row — eXp logo + brokerage name large and prominent
  brokerBrandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    flexWrap: 'wrap',
    marginBottom: 18,
  },
  expLogo: {
    height: 56,
    width: 'auto',
    display: 'block',
    background: '#fff',
    padding: '12px 18px',
    borderRadius: 10,
    flexShrink: 0,
  },
  brokerBrandInfo: {
    flex: 1,
    minWidth: 200,
  },
  brokerName: {
    fontSize: 20,
    fontWeight: 800,
    color: '#fff',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  brokerAddress: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 1.5,
  },
  brokerPhone: {
    color: '#94a3b8',
    textDecoration: 'none',
  },

  brokerDivider: {
    height: 1,
    background: '#1e293b',
    marginBottom: 18,
  },

  brokerLead: {
    fontSize: 13,
    color: '#cbd5e1',
    lineHeight: 1.65,
    marginBottom: 12,
    marginTop: 0,
  },
  brokerHighlight: {
    color: '#fff',
    fontWeight: 700,
  },
  brokerIDX: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 1.7,
    marginTop: 0,
    marginBottom: 0,
  },

  // Divider + bottom row
  divider: { height: 1, background: '#1e293b', marginBottom: 24 },
  bottomRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 },
  copyright: { fontSize: 12, color: '#475569' },
  bottomLinks: { display: 'flex', alignItems: 'center', gap: 8 },
  bottomLink: { fontSize: 12, color: '#475569', textDecoration: 'none' },
  dot: { color: '#334155', fontSize: 12 },
}