import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import Footer from '../components/Footer'

// Mock listings for the preview section — beautiful stock photos + fake but plausible data
const MOCK_LISTINGS = [
  {
    id: 'mock-1',
    img: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
    price: '$3,200/mo',
    address: '310 W 85th St, Apt 4C',
    hood: 'Upper West Side',
    beds: '1 bd', baths: '1 ba', sqft: '720 sqft',
    tag: 'For Rent', tagColor: '#f97316',
    comments: [
      { role: 'Past Tenant', roleColor: '#0369a1', roleBg: '#f0f9ff', verified: true, text: "Building is beautiful but management takes 3+ weeks on repair requests. The super is the real MVP." },
      { role: 'Neighbor', roleColor: '#6b21a8', roleBg: '#ede9fe', text: "Incredibly quiet block. The trash pickup on West End gets loud Tuesday mornings though." },
    ],
    commentCount: 7, likes: 23,
  },
  {
    id: 'mock-2',
    img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    price: '$875,000',
    address: '57 Driggs Ave, Unit 2R',
    hood: 'Williamsburg',
    beds: '2 bd', baths: '2 ba', sqft: '1,100 sqft',
    tag: 'For Sale', tagColor: '#1a6cf5',
    comments: [
      { role: 'Current Tenant', roleColor: '#92400e', roleBg: '#fef3c7', verified: true, text: "Lived here 3 years. Walls are paper thin — you will hear everything. Price reflects that, honestly." },
      { role: 'Local', roleColor: '#475569', roleBg: '#f1f5f9', text: "Ten minutes to the L train but the walk after midnight isn't great." },
    ],
    commentCount: 12, likes: 41,
  },
  {
    id: 'mock-3',
    img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    price: '$2,400/mo',
    address: '142 Clifton Ave',
    hood: 'Jersey City',
    beds: '1 bd', baths: '1 ba', sqft: '680 sqft',
    tag: 'For Rent', tagColor: '#f97316',
    comments: [
      { role: 'Past Tenant', roleColor: '#0369a1', roleBg: '#f0f9ff', verified: true, text: "Lease renewed 3 times — this is one of the honest landlords left in JC. Heat works. Hot water works. Rare in 2026." },
    ],
    commentCount: 5, likes: 19,
  },
]

export default function SignIn() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn({ email, password })
    setLoading(false)
    if (error) setError(error.message)
    else navigate('/')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      {/* Top bar */}
      <header style={styles.topbar}>
        <div style={styles.topbarInner}>
          <div style={styles.logo}>
            <span style={{ fontSize: 24 }}>🏠</span>
            <span style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 22 }}>Chathouse</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowForm(true)} style={styles.signInBtn}>Sign in</button>
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
            <button onClick={() => setShowForm(true)} style={styles.ctaSecondary}>Sign in</button>
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

      {/* Preview (mock listings with comments) */}
      <section style={styles.previewSection}>
        <div style={styles.sectionInner}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={styles.eyebrow}>See it in action</span>
            <h2 style={styles.h2}>Real buildings. Real conversations.</h2>
            <p style={styles.sectionSub}>A glimpse of what the community is saying about listings right now.</p>
          </div>

          <div style={styles.previewGrid}>
            {MOCK_LISTINGS.map(l => (
              <div key={l.id} style={styles.previewCard}>
                <div style={styles.previewImgWrap}>
                  <img src={l.img} alt={l.address} style={styles.previewImg}/>
                  <div style={{ ...styles.previewTag, background: l.tagColor }}>{l.tag}</div>
                </div>
                <div style={{ padding: 16 }}>
                  <div style={styles.previewPrice}>{l.price}</div>
                  <div style={styles.previewAddress}>{l.address}</div>
                  <div style={styles.previewHood}>📍 {l.hood}</div>
                  <div style={styles.previewSpecs}>{l.beds} · {l.baths} · {l.sqft}</div>

                  <div style={styles.commentsPreview}>
                    {l.comments.map((c, i) => (
                      <div key={i} style={styles.commentPreview}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5, flexWrap: 'wrap' }}>
                          <span style={{ ...styles.roleTag, background: c.roleBg, color: c.roleColor }}>
                            {c.verified ? '✓ ' : ''}{c.role}
                          </span>
                        </div>
                        <p style={styles.commentText}>"{c.text}"</p>
                      </div>
                    ))}
                  </div>

                  <div style={styles.previewFooter}>
                    💬 {l.commentCount} comments · ❤ {l.likes}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to="/signup" style={styles.ctaPrimary}>Sign up free to see real listings →</Link>
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

      {/* Footer */}
      <Footer />

      {/* Sign-in modal */}
      {showForm && (
        <div style={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <div style={styles.modalCard} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowForm(false)} style={styles.modalClose}>✕</button>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Welcome back</h2>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>Sign in to continue.</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required style={styles.input}/>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required style={styles.input}/>
              {error && <div style={styles.error}>{error}</div>}
              <button type="submit" disabled={loading} style={{ ...styles.modalButton, opacity: loading ? 0.5 : 1 }}>
                {loading ? 'Signing in...' : 'Sign in →'}
              </button>
            </form>

            <p style={{ fontSize: 13, color: '#64748b', textAlign: 'center', marginTop: 18 }}>
              Don't have an account? <Link to="/signup" style={{ fontWeight: 700, color: '#1a6cf5' }}>Sign up free</Link>
            </p>
          </div>
        </div>
      )}
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
  topbar: {
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky', top: 0, zIndex: 40,
  },
  topbarInner: {
    maxWidth: 1160, margin: '0 auto',
    padding: '14px 20px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  logo: { display: 'flex', alignItems: 'center', gap: 8 },
  signInBtn: {
    padding: '8px 16px', background: '#f1f5f9',
    border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
    color: '#475569', cursor: 'pointer',
  },
  signUpBtn: {
    padding: '8px 16px', background: '#1a6cf5', color: '#fff',
    borderRadius: 8, fontSize: 13, fontWeight: 700,
    textDecoration: 'none',
  },

  hero: {
    background: 'linear-gradient(135deg, #e8f0fe 0%, #fff 50%, #fff3e8 100%)',
    padding: '80px 20px 100px',
  },
  heroInner: { maxWidth: 900, margin: '0 auto', textAlign: 'center' },
  eyebrow: {
    display: 'inline-block', padding: '5px 14px',
    background: 'rgba(26,108,245,0.1)',
    color: '#1a6cf5', fontSize: 11, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: 1,
    borderRadius: 100, marginBottom: 20,
  },
  heroTitle: {
    fontFamily: 'var(--serif)', fontSize: 58, fontWeight: 800,
    lineHeight: 1.1, color: '#0f172a', marginBottom: 18,
    letterSpacing: -1,
  },
  heroSub: {
    fontSize: 18, color: '#64748b', lineHeight: 1.6,
    maxWidth: 620, margin: '0 auto 32px',
  },
  heroButtons: { display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' },
  ctaPrimary: {
    padding: '14px 28px', background: '#1a6cf5', color: '#fff',
    borderRadius: 12, fontSize: 15, fontWeight: 700,
    textDecoration: 'none', cursor: 'pointer',
    boxShadow: '0 8px 20px rgba(26,108,245,0.3)',
  },
  ctaSecondary: {
    padding: '14px 28px', background: '#fff', color: '#0f172a',
    border: '2px solid #e2e8f0', borderRadius: 12,
    fontSize: 15, fontWeight: 700, cursor: 'pointer',
  },
  ctaWhite: {
    padding: '14px 28px', background: '#fff', color: '#1a6cf5',
    borderRadius: 12, fontSize: 15, fontWeight: 700,
    textDecoration: 'none', display: 'inline-block',
    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
  },
  heroNote: { fontSize: 12, color: '#94a3b8', marginTop: 18 },

  howSection: { padding: '80px 20px', background: '#fff' },
  sectionInner: { maxWidth: 1100, margin: '0 auto' },
  h2: {
    fontFamily: 'var(--serif)', fontSize: 36, fontWeight: 700,
    color: '#0f172a', marginBottom: 10,
  },
  sectionSub: {
    fontSize: 16, color: '#64748b', lineHeight: 1.6,
    maxWidth: 540, margin: '0 auto',
  },
  howGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 20,
  },
  howCard: {
    padding: 28, background: '#f8fafc',
    borderRadius: 16, border: '1.5px solid #e2e8f0',
  },
  howNum: {
    width: 40, height: 40, borderRadius: '50%',
    background: 'linear-gradient(135deg, #1a6cf5, #f97316)',
    color: '#fff', fontSize: 18, fontWeight: 800,
    fontFamily: 'var(--serif)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  howTitle: {
    fontFamily: 'var(--serif)', fontSize: 19, fontWeight: 700,
    color: '#0f172a', marginBottom: 8,
  },
  howBody: { fontSize: 14, color: '#64748b', lineHeight: 1.65 },

  previewSection: { padding: '80px 20px', background: '#f8fafc' },
  previewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: 20,
  },
  previewCard: {
    background: '#fff', borderRadius: 16,
    border: '1.5px solid #e2e8f0', overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
  },
  previewImgWrap: { position: 'relative', height: 200 },
  previewImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  previewTag: {
    position: 'absolute', top: 12, right: 12,
    padding: '4px 12px', borderRadius: 100,
    color: '#fff', fontSize: 11, fontWeight: 700,
  },
  previewPrice: {
    fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 700,
    color: '#0f172a', marginBottom: 2,
  },
  previewAddress: { fontSize: 14, color: '#334155', marginBottom: 3 },
  previewHood: { fontSize: 12, color: '#64748b', marginBottom: 10 },
  previewSpecs: {
    fontSize: 12, color: '#64748b', marginBottom: 14,
    paddingBottom: 14, borderBottom: '1px solid #f1f5f9',
  },
  commentsPreview: { display: 'flex', flexDirection: 'column', gap: 12 },
  commentPreview: {
    padding: 12, background: '#f8fafc',
    borderRadius: 10, borderLeft: '3px solid #1a6cf5',
  },
  roleTag: {
    fontSize: 10, fontWeight: 700,
    padding: '2px 8px', borderRadius: 100,
  },
  commentText: {
    fontSize: 13, color: '#334155',
    lineHeight: 1.55, fontStyle: 'italic',
  },
  previewFooter: {
    marginTop: 12, fontSize: 11, color: '#94a3b8', fontWeight: 600,
  },

  testimonialSection: {
    padding: '80px 20px',
    background: 'linear-gradient(135deg, #0f172a, #1e293b)',
    color: '#fff',
  },
  testimonialInner: { maxWidth: 760, margin: '0 auto', textAlign: 'center' },
  quote: {
    fontFamily: 'var(--serif)', fontSize: 80, fontWeight: 900,
    color: '#1a6cf5', lineHeight: 0.6, marginBottom: 10,
  },
  testimonialText: {
    fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 400,
    lineHeight: 1.5, color: '#f1f5f9', marginBottom: 16,
    fontStyle: 'italic',
  },
  testimonialAuthor: {
    fontSize: 13, color: '#94a3b8', fontWeight: 600,
  },

  finalCta: {
    padding: '80px 20px', textAlign: 'center',
    background: 'linear-gradient(135deg, #1a6cf5, #f97316)',
  },

  modalOverlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(15,23,42,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 20, zIndex: 100,
  },
  modalCard: {
    background: '#fff', borderRadius: 20, padding: 32,
    maxWidth: 420, width: '100%', position: 'relative',
  },
  modalClose: {
    position: 'absolute', top: 14, right: 14,
    background: 'transparent', border: 'none',
    width: 32, height: 32, borderRadius: '50%',
    fontSize: 16, color: '#64748b', cursor: 'pointer',
  },
  input: {
    width: '100%', padding: '12px 14px',
    border: '1.5px solid #e2e8f0', borderRadius: 10,
    fontSize: 14, color: '#0f172a', outline: 'none',
  },
  modalButton: {
    width: '100%', padding: '12px', background: '#1a6cf5',
    color: '#fff', border: 'none', borderRadius: 10,
    fontSize: 14, fontWeight: 700, cursor: 'pointer',
  },
  error: {
    padding: 10, background: '#fef2f2',
    border: '1px solid #fecaca', borderRadius: 8,
    color: '#dc2626', fontSize: 13,
  },
}
