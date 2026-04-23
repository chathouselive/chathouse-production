import { Link } from 'react-router-dom'
import { Users, Building2, Handshake, Unlock, Globe, Shield } from 'lucide-react'
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
    comments: 8,
  },
  {
    id: 43,
    img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    price: '$2,800/mo',
    address: '47 Riverside Ave, Apt 2C',
    hood: 'Downtown Jersey City, NJ',
    beds: '1', baths: '1', sqft: '680',
    tag: 'For Rent', tagColor: '#f97316',
    comments: 12,
  },
  {
    id: 44,
    img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    price: '$3,400/mo',
    address: '209 Hudson St, Unit 4A',
    hood: 'Hoboken, NJ',
    beds: '1', baths: '1', sqft: '750',
    tag: 'For Rent', tagColor: '#f97316',
    comments: 21,
  },
  {
    id: 1,
    img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    price: '$3,299/mo',
    address: '1600 Harbor Blvd, #3402',
    hood: 'Weehawken, NJ',
    beds: '1', baths: '1', sqft: '572',
    tag: 'For Rent', tagColor: '#f97316',
    comments: 5,
  },
]

const RISK_ITEMS = [
  { label: 'Knob & tube wiring (built 1924)', level: 'High', cost: '$8–18k', color: '#dc2626', bg: '#fef2f2' },
  { label: 'Underground oil tank risk', level: 'High', cost: '$3–15k', color: '#dc2626', bg: '#fef2f2' },
  { label: 'Lead paint likelihood', level: 'Medium', cost: '$1–4k', color: '#d97706', bg: '#fefce8' },
  { label: 'Flood zone (FEMA Zone X)', level: 'Low', cost: null, color: '#16a34a', bg: '#f0fdf4' },
  { label: 'Asbestos risk', level: 'Medium', cost: '$2–6k', color: '#d97706', bg: '#fefce8' },
]

const SAMPLE_COMMENTS = [
  {
    initial: 'M',
    avatarBg: '#1A6FE8',
    name: 'Maria C.',
    role: 'Past tenant',
    meta: 'Lived here 2022–2024 · Verified',
    time: '3d ago',
    body: "Radiators make a banging noise all winter — we complained 3 times, never fixed. Otherwise the unit is solid and the light is amazing.",
  },
  {
    initial: 'D',
    avatarBg: '#0F1F3D',
    name: 'David R.',
    role: 'Neighbor',
    meta: 'Building resident · Verified',
    time: '1w ago',
    body: "Super is responsive. Garbage pickup in the alley can get loud on Tuesdays around 6am — FYI if you're a light sleeper.",
  },
  {
    initial: 'J',
    avatarBg: '#f97316',
    name: 'Jordan K.',
    role: 'Past buyer',
    meta: 'Closed 2023 · Verified',
    time: '2w ago',
    body: "Inspection missed the hot water line behind the kitchen wall. Budget a plumber visit in year one — otherwise we're happy here.",
  },
]

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

      {/* Hero — community is the product */}
      <section style={styles.hero}>
        <div style={styles.heroInner}>
          <div style={styles.eyebrow}>
            <span style={styles.eyebrowDot}/>
            Free for buyers &amp; renters — always
          </div>
          <h1 style={styles.heroTitle}>
            The truth about a home<br/>
            <span style={styles.heroAccent}>from the people who lived there.</span>
          </h1>
          <p style={styles.heroSub}>
            Chathouse is where past tenants, neighbors, and buyers publicly review every listing. Verified reviewers. No paid placement. Honest answers before you sign.
          </p>
          <div style={styles.heroActions}>
            <Link to="/signup" style={styles.btnHero}>Search any address free →</Link>
            <Link to="/listings" style={styles.btnHeroSecondary}>Browse live listings</Link>
          </div>
          <div style={styles.trustRow}>
            {[
              { t: 'Verified reviewers', c: '#1A6FE8' },
              { t: 'Past tenants, neighbors & buyers', c: '#16a34a' },
              { t: 'No paid placement', c: '#f97316' },
              { t: 'Free for buyers', c: '#1A6FE8' },
            ].map((item, i) => (
              <div key={i} style={styles.trustItem}>
                <span style={{ ...styles.trustDot, background: item.c }}/>
                {item.t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THE WEDGE — structural conflict of interest */}
      <section style={styles.wedgeSection}>
        <div style={styles.wedgeInner}>
          <div style={styles.wedgeLabel}>The problem</div>
          <h2 style={styles.wedgeTitle}>
            Zillow can't tell you the truth.<br/>
            <span style={{ color: '#1A6FE8', fontStyle: 'italic' }}>Their customers are the agents.</span>
          </h2>
          <p style={styles.wedgeBody}>
            Every major real estate site is paid by the people selling you the home. You see staged photos and five-star agent profiles — never the mold or the slumlord.
          </p>
          <p style={styles.wedgeBody}>
            Chathouse is built for the people who actually live in these homes. Past tenants, neighbors, and verified buyers share what they know.
          </p>
        </div>
      </section>

      {/* Community Reviews — the main product */}
      <section style={styles.communitySection}>
        <div style={styles.communityInner}>
          <div style={styles.communityLeft}>
            <div style={styles.sectionLabelBlue}>How Chathouse works</div>
            <h2 style={styles.h2}>
              Every address.<br/>
              <span style={{ color: '#1A6FE8', fontStyle: 'italic' }}>Comment-enabled.</span>
            </h2>
            <p style={styles.communitySub}>
              Search any home in the country. Read verified reviews from people who actually lived there — or add one yourself. Landlords and agents can reply, but they can't delete what's honest.
            </p>
            <div style={styles.communityFeatures}>
              {[
                'Past tenants share what they lived with',
                'Neighbors flag building-level issues',
                'Past buyers share what inspection missed',
                'All reviewers verified by Chathouse',
                'Landlord & agent replies visible to everyone',
              ].map((f, i) => (
                <div key={i} style={styles.communityFeatureRow}>
                  <span style={styles.communityCheck}>✓</span>
                  <span style={{ fontSize: 15, color: '#334155' }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.communityRight}>
            <div style={styles.threadCard}>
              <div style={styles.threadHeader}>
                <div>
                  <div style={styles.threadTitle}>47 Riverside Ave, Apt 2C</div>
                  <div style={styles.threadMeta}>Downtown Jersey City, NJ · 12 verified reviews</div>
                </div>
                <span style={styles.threadLive}>Live thread</span>
              </div>

              <div style={styles.threadComments}>
                {SAMPLE_COMMENTS.map((c, i) => (
                  <div key={i} style={styles.commentCard}>
                    <div style={styles.commentTop}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ ...styles.avatar, background: c.avatarBg }}>{c.initial}</div>
                        <div>
                          <div style={styles.commentName}>{c.name} · {c.role}</div>
                          <div style={styles.commentMeta}>{c.meta}</div>
                        </div>
                      </div>
                      <div style={styles.commentTime}>{c.time}</div>
                    </div>
                    <p style={styles.commentBody}>{c.body}</p>
                  </div>
                ))}

                <div style={styles.landlordReply}>
                  <div style={styles.landlordLabel}>Landlord reply</div>
                  <p style={styles.landlordText}>
                    Thanks for flagging — we've scheduled radiator maintenance for Q2. —Building mgmt
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Risk Report — optional upgrade (revenue layer) */}
      <section style={styles.aiSection}>
        <div style={styles.aiInner}>
          <div style={styles.aiLeft}>
            <div style={styles.aiEyebrow}>Optional upgrade · $29</div>
            <h2 style={styles.aiTitle}>
              Want the risks<br/>
              <span style={{ color: '#f59e42', fontStyle: 'italic' }}>before inspection?</span>
            </h2>
            <p style={styles.aiSub}>
              Community reviews are free, forever. If you want extra signal before making an offer, add an AI risk report to any listing for $29. We analyze age, permits, construction type, flood zone, and sales history.
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

      {/* How it works — community-centric */}
      <section style={styles.howSection}>
        <div style={styles.sectionInner}>
          <div style={styles.sectionLabel}>How it works</div>
          <h2 style={styles.h2}>Three steps to honest housing</h2>
          <div style={styles.howGrid}>
            {[
              { num: '01', title: 'Search any address', body: 'Find any listing or add a building not yet on Chathouse. Every address in the country is comment-enabled.' },
              { num: '02', title: 'Read verified reviews', body: 'Past tenants, neighbors, and buyers tell you what they actually know — no staged photos, no paid rankings.' },
              { num: '03', title: 'Sign with confidence', body: 'Make your move with real information. Landlords and agents can reply, but they can\'t hide the truth.' },
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
                    {l.comments > 0 && (
                      <div style={styles.cardCommentsBadge}>
                        💬 {l.comments}
                      </div>
                    )}
                  </div>
                  <div style={styles.cardBody}>
                    <div style={styles.cardPrice}>{l.price}</div>
                    <div style={styles.cardAddr}>{l.address}</div>
                    <div style={styles.cardHood}>📍 {l.hood}</div>
                    <div style={styles.cardSpecs}>{l.beds} bd · {l.baths} ba · {l.sqft} sqft</div>
                    <div style={styles.cardFooter}>
                      <span style={styles.cardComments}>{l.comments} verified reviews</span>
                      <span style={styles.cardCta}>Read →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features grid — AI report is now ONE card among equals */}
      <section style={styles.featuresSection}>
        <div style={styles.sectionInner}>
          <div style={styles.sectionLabel}>What you get</div>
          <h2 style={styles.h2}>Everything buyers deserve to know</h2>
          <div style={styles.featuresGrid}>
            {[
              { icon: <Users size={22} strokeWidth={1.75} />, title: 'Verified community reviews', desc: 'Honest feedback from past tenants, neighbors, and buyers — verified by Chathouse, not by the agent selling the home.' },
              { icon: <Building2 size={22} strokeWidth={1.75} />, title: 'Landlord transparency', desc: 'Property owners can claim listings and reply to reviews — but they can\'t hide or delete what tenants say.' },
              { icon: <Handshake size={22} strokeWidth={1.75} />, title: 'Verified agents & brokers', desc: 'Connect with real estate pros who have genuine community reviews — not paid rankings or fake testimonials.' },
              { icon: <Unlock size={22} strokeWidth={1.75} />, title: 'Free for buyers forever', desc: 'Buyers and renters always have free access. Agents and brokers pay a subscription to grow their business.' },
              { icon: <Globe size={22} strokeWidth={1.75} />, title: 'National coverage', desc: 'Every address in the country is comment-enabled — not just buildings already listed for sale or rent.' },
              { icon: <Shield size={22} strokeWidth={1.75} />, title: 'Built for MLS & Fair Housing standards', desc: 'Architected to MLS data standards with Fair Housing principles baked into every listing and review.' },
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
          <p style={styles.testimonialAuthor}>— Maria C., verified Chathouse member · Brooklyn, NY</p>
        </div>
      </section>

      {/* Final CTA */}
      <section style={styles.finalCta}>
        <div style={styles.sectionInner}>
          <h2 style={styles.finalCtaTitle}>Real estate, without the lies.</h2>
          <p style={styles.finalCtaSub}>
            Join the community making housing transparent — free for every buyer and renter.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link to="/signup" style={styles.btnFinalPrimary}>Search listings free →</Link>
            <Link to="/listings" style={styles.btnFinalSecondary}>Browse listings</Link>
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
  heroInner: { maxWidth: 900, margin: '0 auto', textAlign: 'center' },
  eyebrow: { display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: '#1A6FE8', background: '#e8f0fe', padding: '5px 14px', borderRadius: 100, marginBottom: 24, letterSpacing: 0.3 },
  eyebrowDot: { display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#f97316', flexShrink: 0 },
  heroTitle: { fontFamily: 'Georgia, var(--serif), serif', fontSize: 58, fontWeight: 900, color: '#0F1F3D', lineHeight: 1.08, marginBottom: 20, letterSpacing: -1.2 },
  heroAccent: { color: '#1A6FE8', fontStyle: 'italic' },
  heroSub: { fontSize: 18, color: '#4a5568', lineHeight: 1.7, maxWidth: 640, margin: '0 auto 32px' },
  heroActions: { display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center', marginBottom: 40 },
  btnHero: { padding: '14px 30px', background: '#f97316', color: '#fff', borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: '0 6px 20px rgba(249,115,22,0.35)' },
  btnHeroSecondary: { padding: '14px 24px', background: '#fff', color: '#0F1F3D', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 15, fontWeight: 600, textDecoration: 'none' },
  trustRow: { display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' },
  trustItem: { display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#64748b', fontWeight: 500 },
  trustDot: { width: 6, height: 6, borderRadius: '50%', flexShrink: 0 },

  // Wedge (structural conflict section)
  wedgeSection: { padding: '88px 24px', background: '#0F1F3D' },
  wedgeInner: { maxWidth: 820, margin: '0 auto', textAlign: 'center' },
  wedgeLabel: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: '#f97316', marginBottom: 14 },
  wedgeTitle: { fontFamily: 'Georgia, var(--serif), serif', fontSize: 42, fontWeight: 900, color: '#fff', lineHeight: 1.15, marginBottom: 24, letterSpacing: -0.8 },
  wedgeBody: { fontSize: 17, color: '#cbd5e1', lineHeight: 1.75, marginBottom: 16, maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' },

  // Community
  communitySection: { padding: '88px 24px', background: '#fff' },
  // MOBILE PASS: '1fr 1.1fr' breaks on narrow viewports — add media query to stack on mobile
  communityInner: { maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 60, alignItems: 'center' },
  communityLeft: {},
  communityRight: {},
  sectionLabelBlue: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: '#1A6FE8', marginBottom: 10 },
  communitySub: { fontSize: 16, color: '#475569', lineHeight: 1.7, marginBottom: 28 },
  communityFeatures: { display: 'flex', flexDirection: 'column', gap: 12 },
  communityFeatureRow: { display: 'flex', alignItems: 'center', gap: 12 },
  communityCheck: { color: '#1A6FE8', fontWeight: 800, fontSize: 16, flexShrink: 0 },

  threadCard: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24 },
  threadHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid #e2e8f0' },
  threadTitle: { fontSize: 15, fontWeight: 800, color: '#0F1F3D', marginBottom: 3 },
  threadMeta: { fontSize: 12, color: '#64748b' },
  threadLive: { fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: '#dcfce7', color: '#166534' },
  threadComments: { display: 'flex', flexDirection: 'column', gap: 14 },
  commentCard: { background: '#fff', border: '1px solid #e8edf2', borderRadius: 10, padding: 14 },
  commentTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  avatar: { width: 28, height: 28, borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0 },
  commentName: { fontSize: 12, fontWeight: 700, color: '#0F1F3D' },
  commentMeta: { fontSize: 10, color: '#94a3b8' },
  commentTime: { fontSize: 10, color: '#94a3b8' },
  commentBody: { fontSize: 13, color: '#334155', lineHeight: 1.55, margin: 0 },
  landlordReply: { background: '#eef4fd', borderLeft: '3px solid #1A6FE8', borderRadius: 8, padding: 12 },
  landlordLabel: { fontSize: 10, fontWeight: 800, color: '#1A6FE8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  landlordText: { fontSize: 12, color: '#334155', lineHeight: 1.5, margin: 0 },

  // AI Risk Report section (optional upgrade / revenue)
  aiSection: { background: '#0F1F3D', padding: '80px 24px' },
  // MOBILE PASS: two-column grid needs to stack on narrow viewports
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

  // How it works
  howSection: { padding: '80px 24px', background: '#f8fafc' },
  sectionInner: { maxWidth: 1100, margin: '0 auto' },
  sectionLabel: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: '#f97316', marginBottom: 10 },
  h2: { fontFamily: 'Georgia, var(--serif), serif', fontSize: 34, fontWeight: 800, color: '#0F1F3D', marginBottom: 36, lineHeight: 1.2 },
  howGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 },
  howCard: { padding: 28, background: '#fff', borderRadius: 16, border: '1px solid #e8edf2' },
  howNum: { fontFamily: 'Georgia, var(--serif), serif', fontSize: 36, fontWeight: 900, color: '#e2e8f0', marginBottom: 14, lineHeight: 1 },
  howTitle: { fontFamily: 'Georgia, var(--serif), serif', fontSize: 19, fontWeight: 700, color: '#0F1F3D', marginBottom: 10 },
  howBody: { fontSize: 14, color: '#64748b', lineHeight: 1.7 },

  // Listings
  listingsSection: { padding: '80px 24px', background: '#fff' },
  sliderWrap: { overflowX: 'auto', paddingBottom: 8 },
  slider: { display: 'flex', gap: 16, width: 'max-content', paddingBottom: 4 },
  listingCard: { width: 272, flexShrink: 0, background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', textDecoration: 'none', color: 'inherit', display: 'block' },
  cardImgWrap: { position: 'relative', height: 172 },
  cardImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  cardTag: { position: 'absolute', top: 10, left: 10, padding: '3px 10px', borderRadius: 100, color: '#fff', fontSize: 10, fontWeight: 700 },
  cardCommentsBadge: { position: 'absolute', top: 10, right: 10, padding: '3px 8px', borderRadius: 100, fontSize: 10, fontWeight: 700, background: '#fff', color: '#0F1F3D' },
  cardBody: { padding: 14 },
  cardPrice: { fontFamily: 'Georgia, var(--serif), serif', fontSize: 20, fontWeight: 800, color: '#0F1F3D', marginBottom: 2 },
  cardAddr: { fontSize: 13, color: '#334155', marginBottom: 2, fontWeight: 600 },
  cardHood: { fontSize: 11, color: '#94a3b8', marginBottom: 8 },
  cardSpecs: { fontSize: 11, color: '#64748b', marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #f1f5f9' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardComments: { fontSize: 11, color: '#64748b' },
  cardCta: { fontSize: 12, color: '#1A6FE8', fontWeight: 700 },

  // Features
  featuresSection: { padding: '80px 24px', background: '#f8fafc' },
  featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 },
  featCard: { padding: 24, background: '#fff', borderRadius: 14, border: '1px solid #e8edf2' },
  featIcon: { color: '#1A6FE8', marginBottom: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, background: '#eef4fd', borderRadius: 10 },
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
  btnFinalPrimary: { padding: '14px 28px', background: '#f97316', color: '#fff', borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: '0 6px 20px rgba(249,115,22,0.35)' },
  btnFinalSecondary: { padding: '14px 28px', background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,0.35)', borderRadius: 10, fontSize: 15, fontWeight: 600, textDecoration: 'none' },
}
