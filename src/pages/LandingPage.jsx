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
    tag: 'For Sale', tagColor: '#1a6cf5',
  },
  {
    id: 43,
    img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    price: '$2,800/mo',
    address: '47 Riverside Ave, Apt 2C',
    hood: 'Downtown Jersey City, NJ',
    beds: '1', baths: '1', sqft: '680',
    tag: 'For Rent', tagColor: '#f97316',
  },
  {
    id: 44,
    img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    price: '$3,400/mo',
    address: '209 Hudson St, Unit 4A',
    hood: 'Hoboken, NJ',
    beds: '1', baths: '1', sqft: '750',
    tag: 'For Rent', tagColor: '#f97316',
  },
  {
    id: 1,
    img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    price: '$3,299/mo',
    address: '1600 Harbor Blvd, #3402',
    hood: 'Weehawken, NJ',
    beds: '1', baths: '1', sqft: '572',
    tag: 'For Rent', tagColor: '#f97316',
  },
]

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>

      {/* Top bar */}
      <header style={styles.topbar}>
        <div style={styles.topbarInner}>
          <ChathouseLogo height={40} />
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/signin" style={styles.signInBtn}>Sign in</Link>
            <Link to="/signup" style={styles.signUpBtn}>Sign up →</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroInner}>
          <span style={styles.eyebrow}>🏘️ Community real estate</span>
          <h1 style={styles.heroTitle}>
            Know what's wrong with any address —<br/>
            <em style={{ color: '#1a6cf5', fontStyle: 'normal', background: 'linear-gradient(135deg, #1a6cf5, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>before you sign.</em>
          </h1>
          <p style={styles.heroSub}>
            Read what verified tenants, neighbors, and past buyers have to say — before you sign anything.
          </p>
          <div style={styles.heroButtons}>
            <Link to="/signup" style={styles.ctaPrimary}>Sign up free →</Link>
            <Link to="/signin" style={styles.ctaSecondary}>Sign in</Link>
          </div>
          <p style={styles.heroNote}>Free for buyers, renters, and neighbors · Always will be</p>
        </div>
      </section>

      {/* How it works */}
      <section style={styles.howSection}>
        <div style={styles.sectionInner}>
          <div style={styles.howGrid}>
            <HowCard num="1" title="Search any address" body="Find real listings or add buildings not yet on Chathouse. Every address is comment-enabled."/>
            <HowCard num="2" title="Read honest comments" body="Verified tenants, neighbors, and past buyers share what they actually know — the good and the bad."/>
            <HowCard num="3" title="Sign with confidence" body="Make your next rental or home purchase knowing what you're walking into. No staged photos. No sales spin."/>
          </div>
        </div>
      </section>

      {/* Live listings slider */}
      <section style={styles.sliderSection}>
        <div style={styles.sectionInner}>
          <div style={{ marginBottom: 28 }}>
            <span style={styles.eyebrow}>Live listings</span>
            <h2 style={styles.h2}>See what's on Chathouse right now</h2>
            <p style={styles.sectionSub}>
              A sample of real listings with community transparency built in.{' '}
              <Link to="/signup" style={{ color: '#1a6cf5', fontWeight: 700, textDecoration: 'none' }}>
                Sign up free
              </Link>{' '}
              to see the full catalog.
            </p>
          </div>

          {/* Horizontal scroll container */}
          <div style={styles.sliderWrap}>
            <div style={styles.slider}>
              {FEATURED_LISTINGS.map(l => (
                <Link key={l.id} to={`/listing/${l.id}`} style={styles.sliderCard}>
                  <div style={styles.sliderImgWrap}>
                    <img src={l.img} alt={l.address} style={styles.sliderImg}/>
                    <div style={{ ...styles.sliderTag, background: l.tagColor }}>{l.tag}</div>
                  </div>
                  <div style={styles.sliderBody}>
                    <div style={styles.sliderPrice}>{l.price}</div>
                    <div style={styles.sliderAddress}>{l.address}</div>
                    <div style={styles.sliderHood}>📍 {l.hood}</div>
                    <div style={styles.sliderSpecs}>{l.beds} bd · {l.baths} ba · {l.sqft} sqft</div>
                    <div style={styles.sliderCta}>View listing + community comments →</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <Link to="/signup" style={styles.ctaPrimary}>
              See all listings — sign up free →
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section style={styles.testimonialSection}>
        <div style={styles.testimonialInner}>
          <div style={styles.quote}>"</div>
          <p style={styles.testimonialText}>
            I almost signed a lease on a Park Slope 2BR. Two verified past tenants warned me about chronic mold.
            Saved me 24 months of misery.
          </p>
          <p style={styles.testimonialAuthor}>— Anonymous Chathouse member</p>
        </div>
      </section>

      {/* Final CTA */}
      <section style={styles.finalCta}>
        <div style={styles.sectionInner}>
          <h2 style={{ ...styles.h2, color: '#fff' }}>Real estate, without the lies.</h2>
          <p style={{ ...styles.sectionSub, color: 'rgba(255,255,255,0.8)', marginBottom: 24 }}>
            Join the community that's making housing transparent.
          </p>
          <Link to="/signup" style={styles.ctaWhite}>Get started — it's free →</Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function HowCard({ num, title, body }) {
  return (
    <div style={styles.howCard}>
      <div style={styles.howNum}>{num}</div>
      <h3 style={styles.howTitle}>{title}</h3>
      <p style={styles.howBody}>{body}</p>
    </div>
  )
}

const styles = {
  topbar: { background: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 40 },
  topbarInner: { maxWidth: 1160, margin: '0 auto', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  signInBtn: { padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#475569', textDecoration: 'none' },
  signUpBtn: { padding: '8px 16px', background: '#1a6cf5', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none' },
  hero: { background: 'linear-gradient(135deg, #e8f0fe 0%, #fff 50%, #fff3e8 100%)', padding: '80px 20px 100px' },
  heroInner: { maxWidth: 900, margin: '0 auto', textAlign: 'center' },
  eyebrow: { display: 'inline-block', padding: '5px 14px', background: 'rgba(26,108,245,0.1)', color: '#1a6cf5', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, borderRadius: 100, marginBottom: 20 },
  heroTitle: { fontFamily: 'var(--serif)', fontSize: 58, fontWeight: 800, lineHeight: 1.1, color: '#0f172a', marginBottom: 18, letterSpacing: -1 },
  heroSub: { fontSize: 18, color: '#64748b', lineHeight: 1.6, maxWidth: 620, margin: '0 auto 32px' },
  heroButtons: { display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' },
  ctaPrimary: { padding: '14px 28px', background: '#1a6cf5', color: '#fff', borderRadius: 12, fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: '0 8px 20px rgba(26,108,245,0.3)' },
  ctaSecondary: { padding: '14px 28px', background: '#fff', color: '#0f172a', border: '2px solid #e2e8f0', borderRadius: 12, fontSize: 15, fontWeight: 700, textDecoration: 'none' },
  ctaWhite: { padding: '14px 28px', background: '#fff', color: '#1a6cf5', borderRadius: 12, fontSize: 15, fontWeight: 700, textDecoration: 'none', display: 'inline-block', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' },
  heroNote: { fontSize: 12, color: '#94a3b8', marginTop: 18 },
  howSection: { padding: '80px 20px', background: '#fff' },
  sectionInner: { maxWidth: 1100, margin: '0 auto' },
  h2: { fontFamily: 'var(--serif)', fontSize: 36, fontWeight: 700, color: '#0f172a', marginBottom: 10 },
  sectionSub: { fontSize: 16, color: '#64748b', lineHeight: 1.6, maxWidth: 540, margin: '0 auto' },
  howGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 },
  howCard: { padding: 28, background: '#f8fafc', borderRadius: 16, border: '1.5px solid #e2e8f0' },
  howNum: { width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #1a6cf5, #f97316)', color: '#fff', fontSize: 18, fontWeight: 800, fontFamily: 'var(--serif)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  howTitle: { fontFamily: 'var(--serif)', fontSize: 19, fontWeight: 700, color: '#0f172a', marginBottom: 8 },
  howBody: { fontSize: 14, color: '#64748b', lineHeight: 1.65 },

  // Slider
  sliderSection: { padding: '80px 20px', background: '#f8fafc' },
  sliderWrap: { overflowX: 'auto', paddingBottom: 12, marginLeft: -4, marginRight: -4 },
  slider: { display: 'flex', gap: 16, paddingLeft: 4, paddingRight: 4, width: 'max-content' },
  sliderCard: {
    width: 280, flexShrink: 0,
    background: '#fff', borderRadius: 16,
    border: '1.5px solid #e2e8f0', overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
    textDecoration: 'none', color: 'inherit',
    display: 'block',
  },
  sliderImgWrap: { position: 'relative', height: 180 },
  sliderImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  sliderTag: { position: 'absolute', top: 10, right: 10, padding: '4px 10px', borderRadius: 100, color: '#fff', fontSize: 11, fontWeight: 700 },
  sliderBody: { padding: 16 },
  sliderPrice: { fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 2 },
  sliderAddress: { fontSize: 13, color: '#334155', marginBottom: 2 },
  sliderHood: { fontSize: 11, color: '#64748b', marginBottom: 8 },
  sliderSpecs: { fontSize: 11, color: '#64748b', marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #f1f5f9' },
  sliderCta: { fontSize: 12, color: '#1a6cf5', fontWeight: 700 },

  testimonialSection: { padding: '80px 20px', background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#fff' },
  testimonialInner: { maxWidth: 760, margin: '0 auto', textAlign: 'center' },
  quote: { fontFamily: 'var(--serif)', fontSize: 80, fontWeight: 900, color: '#1a6cf5', lineHeight: 0.6, marginBottom: 10 },
  testimonialText: { fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 400, lineHeight: 1.5, color: '#f1f5f9', marginBottom: 16, fontStyle: 'italic' },
  testimonialAuthor: { fontSize: 13, color: '#94a3b8', fontWeight: 600 },
  finalCta: { padding: '80px 20px', textAlign: 'center', background: 'linear-gradient(135deg, #1a6cf5, #f97316)' },
}
