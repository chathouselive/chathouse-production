import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { uploadProfilePhoto, updateMyProfile } from '../lib/useProfile'

function ChathouseLogo({ height = 40 }) {
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

const ACCOUNT_TYPES = [
  { value: 'buyer', label: '🏘️ Resident, Buyer or Renter', sub: 'Free forever. Search, comment, connect.' },
  { value: 'agent', label: '🤝 Real Estate Agent', sub: 'Professional tools. Free during beta.' },
  { value: 'broker', label: '🏦 Mortgage Broker', sub: 'Lead generation. Free during beta.' },
  { value: 'landlord', label: '🏡 Individual Landlord', sub: 'Always free. Claim and respond.' },
  { value: 'management', label: '🏢 Property Manager', sub: 'Portfolio tools. Free during beta.' },
]

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
]

export default function SignUp() {
  const { signUp, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [accountType, setAccountType] = useState('buyer')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [city, setCity] = useState('New York, NY')
  const [password, setPassword] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)

  const [statesServed, setStatesServed] = useState([])
  const [licenseNumber, setLicenseNumber] = useState('')
  const [licenseState, setLicenseState] = useState('')
  const [brokerageName, setBrokerageName] = useState('')
  const [nmlsNumber, setNmlsNumber] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isPro = ['agent', 'broker'].includes(accountType)
  const isAgent = accountType === 'agent'
  const isBroker = accountType === 'broker'

  function handlePhotoChange(e) {
    const f = e.target.files[0]
    if (!f) return
    setPhotoFile(f)
    setPhotoPreview(URL.createObjectURL(f))
  }

  function toggleState(s) {
    setStatesServed(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  function validateAndContinue() {
    setError('')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    if (!name.trim()) return setError('Name is required.')
    if (!email.trim()) return setError('Email is required.')
    if (isPro) {
      if (statesServed.length === 0) return setError('Select at least one state you serve.')
      if (isAgent) {
        if (!licenseNumber.trim()) return setError('License number is required.')
        if (!licenseState) return setError('Please select the state your license is in.')
      }
      if (isBroker) {
        if (!nmlsNumber.trim()) return setError('NMLS number is required.')
      }
      if (!brokerageName.trim()) return setError(isBroker ? 'Company / lender name is required.' : 'Brokerage name is required.')
    }
    setStep(3)
  }

  async function handleFinalSubmit(skipPhoto) {
    setError('')
    if (isPro && skipPhoto) return setError('Professional accounts require a profile photo.')
    if (isPro && !photoFile) return setError('Please upload a profile photo to continue.')
    setLoading(true)
    try {
      const { data, error } = await signUp({ email, password, name, accountType, city })
      if (error) throw new Error(error.message)
      const userId = data?.user?.id
      if (userId) {
        const updates = {}
        if (isPro) {
          updates.states_served = statesServed
          updates.brokerage_name = brokerageName
          updates.company = brokerageName
          if (isAgent) {
            updates.license_number = licenseNumber
            updates.license_state = licenseState
          }
          if (isBroker) {
            updates.nmls_number = nmlsNumber
          }
          updates.license_verification_status = 'pending'
        }
        if (photoFile) {
          const { url, error: upErr } = await uploadProfilePhoto(photoFile, userId)
          if (!upErr && url) updates.photo_url = url
        }
        if (Object.keys(updates).length) {
          await updateMyProfile(updates)
          await refreshProfile()
        }
      }
      setStep(4)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>

      {/* Left panel — form */}
      <div style={styles.formPanel}>
        <div style={styles.formInner}>
          <div style={{ marginBottom: 28 }}>
            <ChathouseLogo height={40} />
          </div>

          {step === 1 && (
            <>
              <h1 style={styles.heading}>How will you use Chathouse?</h1>
              <p style={styles.sub}>Pick the account that fits. You can change this later.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {ACCOUNT_TYPES.map(t => (
                  <button key={t.value} onClick={() => setAccountType(t.value)} style={{
                    textAlign: 'left', padding: '14px 16px',
                    background: accountType === t.value ? '#e8f0fe' : '#fff',
                    border: `1.5px solid ${accountType === t.value ? '#1a6cf5' : '#e2e8f0'}`,
                    borderRadius: 12, cursor: 'pointer',
                  }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 3 }}>{t.label}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{t.sub}</div>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(2)} style={{ ...styles.button, marginTop: 20 }}>Continue →</button>
            </>
          )}

          {step === 2 && (
            <>
              <h1 style={styles.heading}>Create your account</h1>
              <p style={styles.sub}>{ACCOUNT_TYPES.find(t => t.value === accountType)?.label}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Field label="Full name" required>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} style={styles.input} placeholder="Jane Smith"/>
                </Field>
                <Field label="Email" required>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={styles.input} placeholder="you@email.com"/>
                </Field>
                <Field label="Password" required>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={styles.input} placeholder="••••••••"/>
                </Field>
                {!isPro && (
                  <Field label="City">
                    <select value={city} onChange={e => setCity(e.target.value)} style={{ ...styles.input, background: '#fff' }}>
                      <option>New York, NY</option>
                      <option>Brooklyn, NY</option>
                      <option>Jersey City, NJ</option>
                      <option>Hoboken, NJ</option>
                      <option>Newark, NJ</option>
                      <option>Hackensack, NJ</option>
                      <option>Weehawken, NJ</option>
                      <option>Other</option>
                    </select>
                  </Field>
                )}
                {isPro && (
                  <div style={styles.proSection}>
                    <div style={styles.proSectionTitle}>Professional details</div>
                    <Field label="States you serve" required hint="Pick all that apply. You'll show up in searches in these states.">
                      <div style={styles.stateGrid}>
                        {US_STATES.map(s => (
                          <button key={s} type="button" onClick={() => toggleState(s)} style={{
                            padding: '6px 0', fontSize: 11, fontWeight: 700,
                            border: `1.5px solid ${statesServed.includes(s) ? '#1a6cf5' : '#e2e8f0'}`,
                            background: statesServed.includes(s) ? '#e8f0fe' : '#fff',
                            color: statesServed.includes(s) ? '#1a6cf5' : '#64748b',
                            borderRadius: 6, cursor: 'pointer',
                          }}>{s}</button>
                        ))}
                      </div>
                      {statesServed.length > 0 && (
                        <div style={{ fontSize: 11, color: '#1a6cf5', marginTop: 6, fontWeight: 600 }}>
                          Selected: {statesServed.join(', ')}
                        </div>
                      )}
                    </Field>
                    {isAgent && (
                      <>
                        <Field label="Real estate license number" required>
                          <input value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} style={styles.input} placeholder="e.g. 12345678"/>
                        </Field>
                        <Field label="License state" required hint="The state that issued your license.">
                          <select value={licenseState} onChange={e => setLicenseState(e.target.value)} style={{ ...styles.input, background: '#fff' }}>
                            <option value="">Select state...</option>
                            {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </Field>
                      </>
                    )}
                    {isBroker && (
                      <Field label="NMLS number" required hint="Your Nationwide Multistate Licensing System ID.">
                        <input value={nmlsNumber} onChange={e => setNmlsNumber(e.target.value)} style={styles.input} placeholder="e.g. 1234567"/>
                      </Field>
                    )}
                    <Field label={isBroker ? 'Company / lender name' : 'Brokerage name'} required>
                      <input value={brokerageName} onChange={e => setBrokerageName(e.target.value)} style={styles.input}
                        placeholder={isBroker ? 'e.g. Chase Home Lending' : 'e.g. Compass NYC'}/>
                    </Field>
                    <div style={styles.verifyNote}>
                      ℹ️ Your license info will be reviewed by our admin team. You can use Chathouse while we verify — your profile will show "Pending verification" until approved.
                    </div>
                  </div>
                )}
                {error && <div style={styles.error}>{error}</div>}
                <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                  <button type="button" onClick={() => setStep(1)} style={styles.buttonSecondary}>← Back</button>
                  <button type="button" onClick={validateAndContinue} style={{ ...styles.button, flex: 1 }}>Continue →</button>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h1 style={styles.heading}>{isPro ? 'Upload your profile photo' : 'Add a profile photo?'}</h1>
              <p style={styles.sub}>
                {isPro ? 'Required for professional accounts. Helps clients recognize you.' : 'Optional — helps the community recognize you on comments.'}
              </p>
              <div style={styles.photoRow}>
                <div style={styles.photoPreview}>
                  {photoPreview ? (
                    <img src={photoPreview} alt="preview" style={styles.photoImg}/>
                  ) : (
                    <div style={styles.photoInitial}>{name[0]?.toUpperCase() || '?'}</div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <input id="photoFile" type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} style={{ display: 'none' }}/>
                  <label htmlFor="photoFile" style={styles.fileBtn}>
                    📷 {photoFile ? 'Change photo' : 'Choose photo'}
                  </label>
                  <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>JPG or PNG, under 5MB.</p>
                  {isPro && !photoFile && (
                    <p style={{ fontSize: 11, color: '#dc2626', marginTop: 6, fontWeight: 600 }}>Required for pros</p>
                  )}
                </div>
              </div>
              {error && <div style={styles.error}>{error}</div>}
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                {!isPro && (
                  <button type="button" onClick={() => handleFinalSubmit(true)} disabled={loading} style={{ ...styles.buttonSecondary, opacity: loading ? 0.5 : 1 }}>
                    Skip for now
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleFinalSubmit(false)}
                  disabled={loading || (isPro && !photoFile)}
                  style={{ ...styles.button, flex: 1, opacity: loading || (isPro && !photoFile) ? 0.5 : 1 }}
                >
                  {loading ? 'Creating account...' : 'Create account →'}
                </button>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div style={styles.checkmarkWrap}>
                <div style={styles.checkmark}>📬</div>
              </div>
              <h1 style={{ ...styles.heading, textAlign: 'center' }}>Check your email</h1>
              <p style={{ ...styles.sub, textAlign: 'center', marginBottom: 20 }}>
                We sent a confirmation link to <strong style={{ color: '#0f172a' }}>{email}</strong>.
                Click the link in the email to verify your account, then sign in.
              </p>
              <div style={styles.emailBox}>
                <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                  ✓ Open your email inbox<br/>
                  ✓ Look for a message from Chathouse (check spam if you don't see it)<br/>
                  ✓ Click the confirmation link<br/>
                  ✓ Return here and sign in
                </div>
              </div>
              <Link to="/signin" style={{ ...styles.button, textAlign: 'center', marginTop: 20, display: 'block', textDecoration: 'none' }}>
                Go to Sign In →
              </Link>
              <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 14 }}>
                Didn't get the email? Check spam, or try signing up again in a few minutes.
              </p>
            </>
          )}

          <p style={styles.footerNote}>
            Already have an account? <Link to="/signin" style={{ fontWeight: 600, color: '#1a6cf5' }}>Sign in</Link>
          </p>

          {/* Testimonial quote */}
          <div style={styles.quoteBox}>
            <div style={styles.quoteIcon}>"</div>
            <p style={styles.quoteText}>I almost signed on a place with mold issues. Chathouse saved me.</p>
            <p style={styles.quoteAuthor}>— Verified Chathouse member</p>
          </div>

          <p style={styles.legal}>
            By continuing you agree to our{' '}
            <Link to="/terms" style={{ color: '#1a6cf5', textDecoration: 'none' }}>Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" style={{ color: '#1a6cf5', textDecoration: 'none' }}>Privacy Policy</Link>
          </p>
        </div>
      </div>

      {/* Right panel — diagonal split illustration */}
      <div style={styles.rightPanel}>

        {/* Top half: apartment building at night */}
        <div style={styles.topHalf}>
          <div style={styles.topOverlay}/>
          <div style={styles.topContent}>
            <span style={styles.pill}>FOR RENTERS</span>
          </div>
        </div>

        {/* Bottom half: suburban home */}
        <div style={styles.bottomHalf}>
          <div style={styles.bottomOverlay}/>
          <div style={styles.bottomContent}>
            <span style={styles.pill}>FOR BUYERS</span>
          </div>
        </div>

        {/* Diagonal divider */}
        <div style={styles.diagonalWrap}>
          <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
            <line x1="0" y1="45%" x2="100%" y2="55%" stroke="white" strokeWidth="2.5" opacity="0.9"/>
            <line x1="0" y1="calc(45% + 2px)" x2="100%" y2="calc(55% + 2px)" stroke="#1a6cf5" strokeWidth="1" opacity="0.8"/>
          </svg>
        </div>

        {/* Center tagline */}
        <div style={styles.taglineWrap}>
          <span style={styles.tagline}>YOUR HOME STORY STARTS HERE</span>
        </div>
      </div>

    </div>
  )
}

function Field({ label, required, hint, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>
        {label}{required && <span style={{ color: '#dc2626', marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {hint && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{hint}</div>}
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'row',
  },

  // Left form panel
  formPanel: {
    width: '50%',
    minHeight: '100vh',
    background: '#fff',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    overflowY: 'auto',
    padding: '40px 20px',
  },
  formInner: {
    width: '100%',
    maxWidth: 460,
  },
  heading: { fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 700, marginBottom: 6, color: '#0f172a' },
  sub: { fontSize: 14, color: '#64748b', marginBottom: 22 },
  input: {
    width: '100%', padding: '11px 14px',
    border: '1.5px solid #e2e8f0', borderRadius: 10,
    fontSize: 14, color: '#0f172a', outline: 'none',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%', padding: '13px 20px',
    background: '#1a6cf5', color: '#fff',
    border: 'none', borderRadius: 10,
    fontSize: 15, fontWeight: 600, cursor: 'pointer',
  },
  buttonSecondary: {
    padding: '13px 18px', background: '#f1f5f9', color: '#475569',
    border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
  error: {
    padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca',
    borderRadius: 8, color: '#dc2626', fontSize: 13,
  },
  footerNote: { fontSize: 13, color: '#64748b', textAlign: 'center', marginTop: 24, marginBottom: 16 },
  quoteBox: {
    padding: '18px 20px',
    background: '#f8fafc',
    border: '1.5px solid #e2e8f0',
    borderRadius: 12,
    marginBottom: 16,
  },
  quoteIcon: {
    fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 900,
    color: '#1a6cf5', lineHeight: 0.8, marginBottom: 8,
  },
  quoteText: {
    fontSize: 13, color: '#334155', lineHeight: 1.6,
    fontStyle: 'italic', margin: '0 0 8px',
  },
  quoteAuthor: {
    fontSize: 11, color: '#94a3b8', fontWeight: 600, margin: 0,
  },
  legal: {
    fontSize: 11, color: '#94a3b8', textAlign: 'center', lineHeight: 1.6,
  },
  photoRow: { display: 'flex', alignItems: 'center', gap: 16 },
  photoPreview: { width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 },
  photoImg: { width: '100%', height: '100%', objectFit: 'cover' },
  photoInitial: {
    width: '100%', height: '100%',
    background: 'linear-gradient(135deg, #1a6cf5, #f97316)',
    color: '#fff', fontSize: 30, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  fileBtn: {
    display: 'inline-block', padding: '8px 14px',
    border: '1.5px solid #e2e8f0', borderRadius: 8,
    fontSize: 12, fontWeight: 600, color: '#475569', cursor: 'pointer', background: '#fff',
  },
  proSection: {
    padding: 16, background: '#f8fafc',
    borderRadius: 12, border: '1px solid #e2e8f0',
    display: 'flex', flexDirection: 'column', gap: 14,
  },
  proSectionTitle: {
    fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 2,
  },
  stateGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(52px, 1fr))', gap: 4,
  },
  verifyNote: {
    padding: 10, background: '#fef3c7', border: '1px solid #fcd34d',
    borderRadius: 8, fontSize: 11, color: '#92400e', lineHeight: 1.5,
  },
  checkmarkWrap: { display: 'flex', justifyContent: 'center', marginBottom: 18 },
  checkmark: {
    width: 80, height: 80, borderRadius: '50%',
    background: 'linear-gradient(135deg, #e8f0fe, #dcfce7)',
    fontSize: 40,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '3px solid #fff',
    boxShadow: '0 8px 24px rgba(26,108,245,0.15)',
  },
  emailBox: {
    padding: 18, background: '#f8fafc', borderRadius: 12, border: '1.5px solid #e2e8f0',
  },

  // Right photo panel
  rightPanel: {
    width: '50%',
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  topHalf: {
    flex: '0 0 50%',
    position: 'relative',
    backgroundImage: 'url(https://images.unsplash.com/photo-1486325212027-8081e485255e?w=900&q=85)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    clipPath: 'polygon(0 0, 100% 0, 100% 55%, 0 45%)',
    minHeight: '55vh',
  },
  topOverlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(180deg, rgba(15,23,42,0.2) 0%, rgba(15,23,42,0.55) 100%)',
  },
  topContent: {
    position: 'absolute', bottom: 80, left: 32,
  },
  bottomHalf: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundImage: 'url(https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&q=85)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    clipPath: 'polygon(0 55%, 100% 45%, 100% 100%, 0 100%)',
    zIndex: 1,
  },
  bottomOverlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(180deg, rgba(15,23,42,0.25) 0%, rgba(15,23,42,0.6) 100%)',
  },
  bottomContent: {
    position: 'absolute', bottom: 40, left: 32, zIndex: 2,
  },
  pill: {
    display: 'inline-block',
    padding: '6px 16px',
    background: 'rgba(15,23,42,0.65)',
    borderRadius: 100,
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1.5,
  },
  diagonalWrap: {
    position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
  },
  taglineWrap: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 3,
    textAlign: 'center',
    pointerEvents: 'none',
  },
  tagline: {
    fontSize: 11,
    fontWeight: 700,
    color: '#fff',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    opacity: 0.9,
    textShadow: '0 1px 4px rgba(0,0,0,0.4)',
  },
}
