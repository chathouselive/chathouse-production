import { Link } from 'react-router-dom'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={styles.footer}>
      <div style={styles.footerInner}>

        {/* Top row: logo + nav columns */}
        <div style={styles.topRow}>

          {/* Brand */}
          <div style={styles.brand}>
            <div style={styles.logo}>
              <span style={{ fontSize: 22 }}>🏠</span>
              <span style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 20 }}>Chathouse</span>
            </div>
            <p style={styles.tagline}>
              Community-sourced transparency for every address — before you sign.
            </p>
            <p style={styles.fair}>
              <span style={styles.fairBadge}>⚖️ Fair Housing</span>
              We are committed to the Fair Housing Act. We do not discriminate on the basis of race, color, religion, sex, national origin, disability, or familial status.
            </p>
          </div>

          {/* Nav columns */}
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

        {/* Divider */}
        <div style={styles.divider} />

        {/* Bottom row */}
        <div style={styles.bottomRow}>
          <p style={styles.copyright}>
            © {year} Chathouse · All rights reserved
          </p>
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
  footer: {
    background: '#0f172a',
    color: '#fff',
    padding: '56px 20px 32px',
  },
  footerInner: {
    maxWidth: 1100,
    margin: '0 auto',
  },
  topRow: {
    display: 'flex',
    gap: 60,
    flexWrap: 'wrap',
    marginBottom: 40,
  },
  brand: {
    flex: '1 1 260px',
    maxWidth: 320,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 1.65,
    marginBottom: 16,
  },
  fair: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 1.7,
  },
  fairBadge: {
    display: 'inline-block',
    background: 'rgba(26,108,245,0.15)',
    color: '#93c5fd',
    fontSize: 10,
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 100,
    marginRight: 6,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  navColumns: {
    display: 'flex',
    gap: 48,
    flexWrap: 'wrap',
    flex: '1 1 auto',
  },
  navCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    minWidth: 120,
  },
  navHeader: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: '#475569',
    marginBottom: 4,
  },
  navLink: {
    fontSize: 13,
    color: '#94a3b8',
    textDecoration: 'none',
    lineHeight: 1.4,
  },
  divider: {
    height: 1,
    background: '#1e293b',
    marginBottom: 24,
  },
  bottomRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  copyright: {
    fontSize: 12,
    color: '#475569',
  },
  bottomLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  bottomLink: {
    fontSize: 12,
    color: '#475569',
    textDecoration: 'none',
  },
  dot: {
    color: '#334155',
    fontSize: 12,
  },
}
