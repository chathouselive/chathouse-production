import { Link } from 'react-router-dom'
import Footer from '../components/Footer'

function ChathouseLogo({ height = 36 }) {
  return (
    <svg height={height} viewBox="0 0 480 140" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <g transform="translate(24, 16) scale(0.84)">
        <polygon points="54,0 108,46 96,46 96,108 12,108 12,46 0,46" fill="#1A6FE8"/>
        <rect x="38" y="72" width="32" height="36" rx="4" fill="white"/>
        <rect x="58" y="18" width="36" height="28" rx="7" fill="white"/>
        <polygon points="62,46 74,46 66,54" fill="white"/>
        <circle cx="67" cy="32" r="3" fill="#1A6FE8"/>
        <circle cx="76" cy="32" r="3" fill="#1A6FE8"/>
        <circle cx="85" cy="32" r="3" fill="#1A6FE8"/>
      </g>
      <text x="120" y="84" fontFamily="Arial, Helvetica, sans-serif" fontSize="58" letterSpacing="-2">
        <tspan fontWeight="800" fill="#0F1F3D">chat</tspan>
        <tspan fontWeight="400" fill="#1A6FE8" letterSpacing="-2">house</tspan>
      </text>
      <text x="120" y="112" fontFamily="Arial, Helvetica, sans-serif" fontWeight="400" fontSize="13" fill="#8A94A6" letterSpacing="1.5">FIND. TALK. MOVE.</text>
    </svg>
  )
}

const FEATURED_LISTINGS = [
  {
    id: 42,
    img: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
    price: '$875,000',
    address: '312 Palisade Ave',
    hood: 'Englewood, NJ',
    beds: '4', baths: '2', sqft: '2,100',
    tag: 'For Sale', tagColor: '#1A6FE8',
    comments: 8, risks: 4, riskLevel: 'high',
  },
  {
    id: 43,
    img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    price: '$2,800/mo',
    address: '47 Riverside Ave, Apt 2C',
    hood: 'Downtown Jersey City, NJ',
    beds: '1', baths: '1', sqft: '680',
    tag: 'For Rent', tagColor: '#f97316',
    comments: 12, risks: 2, riskLevel: 'medium',
  },
  {
    id: 44,
    img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    price: '$3,400/mo',
    address: '209 Hudson St, Unit 4A',
    hood: 'Hoboken, NJ',
    beds: '1', baths: '1', sqft: '750',
    tag: 'For Rent', tagColor: '#f97316',
    comments: 21, risks: 1, riskLevel: 'low',
  },
  {
    id: 1,
    img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    price: '$3,299/mo',
    address: '1600 Harbor Blvd, #3402',
    hood: 'Weehawken, NJ',
    beds: '1', baths: '1', sqft: '572',
    tag: 'For Rent', tagColor: '#f97316',
    comments: 5, risks: 0, riskLevel: 'low',
  },
]

const RISK_ITEMS = [
  { label: 'Knob & tube wiring (built 1924)', level: 'High', cost: '$8–18k', color: '#dc2626', bg: '#fef2f2' },
  { label: 'Underground oil tank risk', level: 'High', cost: '$3–15k', color: '#dc2626', bg: '#fef2f2' },
  { label: 'Lead paint likelihood', level: 'Medium', cost: '$1–4k', color: '#d97706', bg: '#fefce8' },
  { label: 'Flood zone (FEMA Zone X)', level: 'Low', cost: null, color: '#16a34a', bg: '#f0fdf4' },
  { label: 'Asbestos risk', level: 'Medium', cost: '$2–6k', color: '#d97706', bg: '#fefce8' },
]

function RiskBadge({ level }) {
  const colors = { high: { bg: '#fef2f2', color: '#991b1b' }, medium: { bg: '#fef9c3', color: '#854d0e' }, low: { bg: '#f0fdf4', color: '#166534' } }
  const c = colors[level] || colors.low
  return <span style={{ ...styles.riskBadge, background: c.bg, color: c.color }}>{level === 'high' ? '4 risks' : level === 'medium' ? '2 risks' : '1 risk'}</span>
}

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Georgia', var(--serif), serif" }}>

      {/* Sticky nav */}
      <header style={styles.nav}>
        <div style={styles.navInner}>
          <ChathouseLogo height={38} />
          <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <Link to="/listings" style={styles.navLink}>Listings</Link>
            <Link to="/signup" style={styles.navLink}>For agents</Link>
          </nav>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/signin" style={styles.btnGhost}>Sign in</Link>
            <Link to="/signup" style={styles.btnPrimary}>Get started free</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroInner}>
          <div style={styles.eyebrow}>
            <span style={styles.eyebrowDot}/>
            Free for buyers &amp; renters — always
          </div>
          <h1 style={styles.heroTitle}>
            Know what you're<br/>
            <span style={styles.heroAccent}>buying before you buy.</span>
          </h1>
          <p style={styles.heroSub}>
            Enter an address and we use the home's age, features, permits, and sales history to predict likely issues and what they may cost to fix.
          </p>
          <div style={styles.heroActions}>
            <Link to="/signup" style={styles.btnHero}>Search an address free →</Link>
            <Link to="/signin" style={styles.btnHeroGhost}>Sign in</Link>
          </div>
          <div style={styles.trustRow}>
            {['44 live listings', 'Verified community reviews', 'AI risk reports', 'Free for buyers'].map((t, i) => (
              <div key={i} style={styles.trustItem}>
                <span style={{ ...styles.trustDot, background: i === 0 ? '#16a34a' : i === 2 ? '#f97316' : '#1A6FE8' }}/>
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={styles.howSection}>
        <div style={styles.sectionInner}>
          <div style={styles.sectionLabel}>How it works</div>
          <h2 style={styles.h2}>Three steps to know the truth about any home</h2>
          <div style={styles.howGrid}>
            {[
              { num: '01', title: 'Search any address', body: 'Find any listing or add a building not yet on Chathouse. Every address is comment-enabled.' },
              { num: '02', title: 'Read honest reviews', body: 'Verified tenants, neighbors, and past buyers share what they actually know — the good and the bad.' },
              { num: '03', title: 'Get the AI risk report', body: 'For $29, get a full AI-generated inspection risk report — what could go wrong and what it may cost.' },
            ].map((s, i) => (
              <div key={i} style={styles.howCard}>
                <div style={styles.howNum}>{s.num}</div>
                <h3 style={styles.howTitle}>{s.title}</h3>
                <p style={styles.howBody}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live listings */}
      <section style={styles.listingsSection}>
        <div style={styles.sectionInner}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
            <div>
              <div style={styles.sectionLabel}>Live listings</div>
              <h2 style={{ ...styles.h2, marginBottom: 6 }}>Real homes. Real community insights.</h2>
              <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.6 }}>
                Every listing shows honest comments from past tenants and buyers.{' '}
                <Link to="/signup" style={{ color: '#1A6FE8', fontWeight: 700, textDecoration: 'none' }}>Sign up free</Link> to see all.
              </p>
            </div>
            <Link to="/listings" style={{ ...styles.btnGhost, fontSize: 13, whiteSpace: 'nowrap' }}>View all listings →</Link>
          </div>

          <div style={styles.sliderWrap}>
            <div style={styles.slider}>
              {FEATURED_LISTINGS.map(l => (
                <Link key={l.id} to={`/listing/${l.id}`} style={styles.listingCard}>
                  <div style={styles.cardImgWrap}>
                    <img src={l.img} alt={l.address} style={styles.cardImg}/>
                    <div style={{ ...styles.cardTag, background: l.tagColor }}>{l.tag}</div>
                    {l.risks > 0 && (
                      <div style={{ ...styles.cardRiskBadge, ...(l.riskLevel === 'high' ? { background: '#fef2f2', color: '#991b1b' } : l.riskLevel === 'medium' ? { background: '#fef9c3', color: '#854d0e' } : { background: '#f0fdf4', color: '#166534' }) }}>
                        {l.risks} risk{l.risks > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                  <div style={styles.cardBody}>
                    <div style={styles.cardPrice}>{l.price}</div>
                    <div style={styles.cardAddr}>{l.address}</div>
                    <div style={styles.cardHood}>📍 {l.hood}</div>
                    <div style={styles.cardSpecs}>{l.beds} bd · {l.baths} ba · {l.sqft} sqft</div>
                    <div style={styles.cardFooter}>
                      <span style={styles.cardComments}>💬 {l.comments} comments</span>
                      <span style={styles.cardCta}>View →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI Risk Report — dark section */}
      <section style={styles.aiSection}>
        <div style={styles.aiInner}>
          <div style={styles.aiLeft}>
            <div style={styles.aiEyebrow}>AI property intelligence</div>
            <h2 style={styles.aiTitle}>
              Know the risks<br/>before you sign.
            </h2>
            <p style={styles.aiSub}>
              We analyze the home's age, permits, construction type, flood zone, and sales history to surface what could go wrong — and what it might cost you.
            </p>
            <div style={styles.aiFeatures}>
              {['Built year & construction type', 'Permit history & violations', 'Flood zone & environmental risk', 'Underground oil tank likelihood', 'Knob & tube / lead paint / asbestos'].map((f, i) => (
                <div key={i} style={styles.aiFeatureRow}>
                  <span style={styles.aiCheck}>✓</span>
                  <span style={{ fontSize: 14, color: '#94a3b8' }}>{f}</span>
                </div>
              ))}
            </div>
            <div style={styles.aiDisclaimer}>
              This report does not replace a professional home inspection. Share it with your inspector or landlord before you move in.
            </div>
          </div>

          <div style={styles.aiRight}>
            <div style={styles.aiCard}>
              <div style={styles.aiCardHeader}>
                <div>
                  <div style={styles.aiCardTitle}>312 Palisade Ave</div>
                  <div style={styles.aiCardAddr}>Englewood, NJ · Built 1924 · 4 risks identified</div>
                </div>
                <div style={styles.aiCardBadge}>Sample report</div>
              </div>
              <div style={styles.aiRiskList}>
                {RISK_ITEMS.map((r, i) => (
                  <div key={i} style={styles.aiRiskRow}>
                    <span style={styles.aiRiskLabel}>{r.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <span style={{ ...styles.aiRiskLevel, background: r.bg, color: r.color }}>{r.level}</span>
                      {r.cost && <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{r.cost}</span>}
                    </div>
                  </div>
                ))}
              </div>
              <div style={styles.aiCardCta}>
                <div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 2 }}>Full AI inspection report</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#f97316' }}>$29 one-time</div>
                </div>
                <Link to="/signup" style={styles.aiGetBtn}>Get report →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={styles.featuresSection}>
        <div style={styles.sectionInner}>
          <div style={styles.sectionLabel}>Why Chathouse</div>
          <h2 style={styles.h2}>Everything a smart buyer needs</h2>
          <div style={styles.featuresGrid}>
            {[
              { icon: '👥', title: 'Verified community reviews', desc: 'Honest feedback from past tenants, neighbors, and buyers — not curated testimonials or staged photos.' },
              { icon: '⚡', title: 'AI risk prediction', desc: 'Surface likely issues before inspection — saving you thousands in unexpected costs after closing.' },
              { icon: '🤝', title: 'Verified agents & brokers', desc: 'Connect with real estate pros who have genuine community reviews — not paid rankings.' },
              { icon: '🔓', title: 'Free for buyers forever', desc: 'Buyers and renters always have free access. Agents and brokers pay a subscription to grow their business.' },
              { icon: '🏢', title: 'Landlord transparency', desc: 'Property owners can claim and manage their listings, respond to comments, and upload photos.' },
              { icon: '🛡️', title: 'IDX & Fair Housing compliant', desc: 'Built with MLS data standards and Fair Housing Act compliance baked into every listing.' },
            ].map((f, i) => (
              <div key={i} style={styles.featCard}>
                <div style={styles.featIcon}>{f.icon}</div>
                <h3 style={styles.featTitle}>{f.title}</h3>
                <p style={styles.featDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section style={styles.testimonialSection}>
        <div style={styles.testimonialInner}>
          <div style={styles.testimonialQuote}>"</div>
          <p style={styles.testimonialText}>
            I almost signed a lease on a Park Slope 2BR. Two verified past tenants warned me about chronic mold issues. Saved me 24 months of misery.
          </p>
          <p style={styles.testimonialAuthor}>— Verified Chathouse member</p>
        </div>
      </section>

      {/* Final CTA */}
      <section style={styles.finalCta}>
        <div style={styles.sectionInner}>
          <h2 style={styles.finalCtaTitle}>Real estate, without the lies.</h2>
          <p style={styles.finalCtaSub}>
            Join the community making housing transparent — free for every buyer and renter.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" style={styles.btnFinalPrimary}>Search listings free →</Link>
            <Link to="/signup" style={styles.btnFinalOrange}>Get AI risk report — $29</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

const styles = {
  // Nav
  nav: { background: '#fff', borderBottom: '1px solid #e8edf2', position: 'sticky', top: 0, zIndex: 50 },
  navInner: { maxWidth: 1160, margin: '0 auto', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20 },
  navLink: { fontSize: 14, color: '#475569', textDecoration: 'none', fontWeight: 500 },
  btnGhost: { padding: '8px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#334155', textDecoration: 'none' },
  btnPrimary: { padding: '8px 18px', background: '#1A6FE8', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none' },

  // Hero
  hero: { background: 'linear-gradient(160deg, #EEF4FD 0%, #fff 55%, #FFF4EC 100%)', padding: '88px 24px 96px' },
  heroInner: { maxWidth: 860, margin: '0 auto', textAlign: 'center' },
  eyebrow: { display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: '#1A6FE8', background: '#e8f0fe', padding: '5px 14px', borderRadius: 100, marginBottom: 24, letterSpacing: 0.3 },
  eyebrowDot: { display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#f97316', flexShrink: 0 },
  heroTitle: { fontFamily: 'Georgia, var(--serif), serif', fontSize: 56, fontWeight: 900, color: '#0F1F3D', lineHeight: 1.1, marginBottom: 20, letterSpacing: -1 },
  heroAccent: { color: '#1A6FE8' },
  heroSub: { fontSize: 18, color: '#4a5568', lineHeight: 1.7, maxWidth: 600, margin: '0 auto 32px' },
  heroActions: { display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 36 },
  btnHero: { padding: '14px 30px', background: '#1A6FE8', color: '#fff', borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: '0 6px 20px rgba(26,111,232,0.28)' },
  btnHeroGhost: { padding: '14px 24px', background: '#fff', color: '#0F1F3D', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 15, fontWeight: 600, textDecoration: 'none' },
  trustRow: { display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' },
  trustItem: { display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#64748b', fontWeight: 500 },
  trustDot: { width: 6, height: 6, borderRadius: '50%', flexShrink: 0 },

  // How it works
  howSection: { padding: '80px 24px', background: '#fff' },
  sectionInner: { maxWidth: 1100, margin: '0 auto' },
  sectionLabel: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: '#f97316', marginBottom: 10 },
  h2: { fontFamily: 'Georgia, var(--serif), serif', fontSize: 34, fontWeight: 800, color: '#0F1F3D', marginBottom: 36, lineHeight: 1.2 },
  howGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 },
  howCard: { padding: 28, background: '#f8fafc', borderRadius: 16, border: '1px solid #e8edf2' },
  howNum: { fontFamily: 'Georgia, var(--serif), serif', fontSize: 36, fontWeight: 900, color: '#e2e8f0', marginBottom: 14, lineHeight: 1 },
  howTitle: { fontFamily: 'Georgia, var(--serif), serif', fontSize: 19, fontWeight: 700, color: '#0F1F3D', marginBottom: 10 },
  howBody: { fontSize: 14, color: '#64748b', lineHeight: 1.7 },

  // Listings
  listingsSection: { padding: '80px 24px', background: '#f8fafc' },
  sliderWrap: { overflowX: 'auto', paddingBottom: 8 },
  slider: { display: 'flex', gap: 16, width: 'max-content', paddingBottom: 4 },
  listingCard: { width: 272, flexShrink: 0, background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', textDecoration: 'none', color: 'inherit', display: 'block' },
  cardImgWrap: { position: 'relative', height: 172 },
  cardImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  cardTag: { position: 'absolute', top: 10, left: 10, padding: '3px 10px', borderRadius: 100, color: '#fff', fontSize: 10, fontWeight: 700 },
  cardRiskBadge: { position: 'absolute', top: 10, right: 10, padding: '3px 8px', borderRadius: 100, fontSize: 10, fontWeight: 700 },
  cardBody: { padding: 14 },
  cardPrice: { fontFamily: 'Georgia, var(--serif), serif', fontSize: 20, fontWeight: 800, color: '#0F1F3D', marginBottom: 2 },
  cardAddr: { fontSize: 13, color: '#334155', marginBottom: 2, fontWeight: 600 },
  cardHood: { fontSize: 11, color: '#94a3b8', marginBottom: 8 },
  cardSpecs: { fontSize: 11, color: '#64748b', marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #f1f5f9' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardComments: { fontSize: 11, color: '#64748b' },
  cardCta: { fontSize: 12, color: '#1A6FE8', fontWeight: 700 },
  riskBadge: { fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 100 },

  // AI Section
  aiSection: { background: '#0F1F3D', padding: '80px 24px' },
  aiInner: { maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' },
  aiLeft: {},
  aiEyebrow: { display: 'inline-block', fontSize: 11, fontWeight: 700, color: '#f97316', background: 'rgba(249,115,22,0.12)', padding: '4px 12px', borderRadius: 100, marginBottom: 18, textTransform: 'uppercase', letterSpacing: 1 },
  aiTitle: { fontFamily: 'Georgia, var(--serif), serif', fontSize: 38, fontWeight: 900, color: '#f8fafc', marginBottom: 16, lineHeight: 1.15 },
  aiSub: { fontSize: 15, color: '#94a3b8', lineHeight: 1.7, marginBottom: 24 },
  aiFeatures: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 },
  aiFeatureRow: { display: 'flex', alignItems: 'center', gap: 10 },
  aiCheck: { fontSize: 13, color: '#1A6FE8', fontWeight: 700, flexShrink: 0 },
  aiDisclaimer: { fontSize: 12, color: '#475569', fontStyle: 'italic', lineHeight: 1.6, borderTop: '1px solid #1e3a5f', paddingTop: 16 },
  aiRight: {},
  aiCard: { background: '#162032', border: '1px solid #1e3a5f', borderRadius: 16, padding: 24 },
  aiCardHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18, gap: 12 },
  aiCardTitle: { fontSize: 16, fontWeight: 800, color: '#f8fafc', marginBottom: 3 },
  aiCardAddr: { fontSize: 12, color: '#64748b' },
  aiCardBadge: { fontSize: 10, fontWeight: 700, color: '#1A6FE8', background: 'rgba(26,111,232,0.12)', padding: '3px 10px', borderRadius: 100, flexShrink: 0 },
  aiRiskList: { display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 20 },
  aiRiskRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1e2d40', gap: 8 },
  aiRiskLabel: { fontSize: 12, color: '#94a3b8', flex: 1 },
  aiRiskLevel: { fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100 },
  aiCardCta: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 10 },
  aiGetBtn: { padding: '10px 18px', background: '#f97316', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', textDecoration: 'none' },

  // Features
  featuresSection: { padding: '80px 24px', background: '#fff' },
  featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 },
  featCard: { padding: 24, background: '#f8fafc', borderRadius: 14, border: '1px solid #e8edf2' },
  featIcon: { fontSize: 24, marginBottom: 14 },
  featTitle: { fontSize: 15, fontWeight: 700, color: '#0F1F3D', marginBottom: 8 },
  featDesc: { fontSize: 13, color: '#64748b', lineHeight: 1.65 },

  // Testimonial
  testimonialSection: { padding: '80px 24px', background: 'linear-gradient(135deg, #0F1F3D, #162842)' },
  testimonialInner: { maxWidth: 760, margin: '0 auto', textAlign: 'center' },
  testimonialQuote: { fontFamily: 'Georgia, serif', fontSize: 96, fontWeight: 900, color: '#1A6FE8', lineHeight: 0.7, marginBottom: 16 },
  testimonialText: { fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 400, lineHeight: 1.6, color: '#e2e8f0', marginBottom: 18, fontStyle: 'italic' },
  testimonialAuthor: { fontSize: 13, color: '#64748b', fontWeight: 600 },

  // Final CTA
  finalCta: { padding: '88px 24px', textAlign: 'center', background: 'linear-gradient(135deg, #1A6FE8 0%, #0d4fbe 50%, #0F1F3D 100%)' },
  finalCtaTitle: { fontFamily: 'Georgia, var(--serif), serif', fontSize: 42, fontWeight: 900, color: '#fff', marginBottom: 12, lineHeight: 1.15 },
  finalCtaSub: { fontSize: 16, color: 'rgba(255,255,255,0.75)', marginBottom: 32, lineHeight: 1.6 },
  btnFinalPrimary: { padding: '14px 28px', background: '#fff', color: '#1A6FE8', borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: 'none' },
  btnFinalOrange: { padding: '14px 28px', background: '#f97316', color: '#fff', borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: 'none' },
}
