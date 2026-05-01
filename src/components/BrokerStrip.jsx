/* ============================================================
   BrokerStrip — site-wide brokerage compliance strip
   
   Required by NJ co-branding rule: "co-branding will be presumed
   not to be deceptive or misleading if the Participant's logo and
   contact information is larger than that of any third party"
   
   - Participant = eXp Realty (the licensed brokerage)
   - Third party = Chathouse (the technology platform)
   
   eXp logo here is sized larger than the Chathouse logo in the
   nav below it, satisfying the size-comparison test.
   ============================================================ */

const PinIcon = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)

const PhoneIcon = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
)

export default function BrokerStrip() {
  return (
    <div style={styles.strip}>
      <div style={styles.inner}>
        {/* Left: eXp Realty logo + brokerage name */}
        <div style={styles.brand}>
          <img
            src="/brokers/exp-logo.png"
            alt="eXp Realty, LLC"
            style={styles.logo}
          />
          <div style={styles.brandText}>
            <div style={styles.brokerage}>eXp Realty, LLC</div>
            <div style={styles.subtitle}>Brokerage of Record</div>
          </div>
        </div>

        {/* Right: contact info */}
        <div style={styles.contact}>
          <a href="https://maps.apple.com/?q=28+Valley+Road+Montclair+NJ+07042" target="_blank" rel="noopener noreferrer" style={styles.contactItem}>
            <PinIcon size={12}/>
            <span>28 Valley Road, #1, Montclair, NJ 07042</span>
          </a>
          <a href="tel:9734050095" style={styles.contactItem}>
            <PhoneIcon size={12}/>
            <span>(973) 405-0095</span>
          </a>
        </div>
      </div>
    </div>
  )
}

const styles = {
  strip: {
    background: '#fff',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: '#e2e8f0',
  },
  inner: {
    maxWidth: 1160,
    margin: '0 auto',
    padding: '10px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap',
  },

  /* eXp Realty branding — sized to satisfy NJ co-branding rule.
     Chathouse logo in TopNav is rendered at height={48}.
     eXp logo here is 52px tall — larger than Chathouse, per the rule. */
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    flexShrink: 0,
  },
  logo: {
    height: 52,
    width: 'auto',
    display: 'block',
  },
  brandText: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: 1.2,
  },
  brokerage: {
    fontSize: 16,
    fontWeight: 800,
    color: '#0F1F3D',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 2,
  },

  /* Contact info — required by the co-branding rule alongside the logo */
  contact: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    flexWrap: 'wrap',
  },
  contactItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    fontWeight: 600,
    color: '#475569',
    textDecoration: 'none',
    lineHeight: 1.4,
  },
}