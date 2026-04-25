import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Camera, CheckCircle2, Info, ArrowLeft, MapPin, Shield } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { uploadProfilePhoto, updateMyProfile } from '../lib/useProfile'
import { Button, Input, Select, Avatar, GoogleButton } from '../components/ui'
import { colors, space, font, radius } from '../styles/tokens'

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
      <text x="120" y="84" fontFamily="Inter, system-ui, sans-serif" fontSize="58" letterSpacing="-2">
        <tspan fontWeight="800" fill="#0F1F3D">chat</tspan>
        <tspan fontWeight="400" fill="#1A6FE8" letterSpacing="-2">house</tspan>
      </text>
      <text x="120" y="112" fontFamily="Inter, system-ui, sans-serif" fontWeight="500" fontSize="13" fill="#8A94A6" letterSpacing="1.5">FIND. TALK. MOVE.</text>
    </svg>
  )
}

const ACCOUNT_TYPES = [
  { value: 'buyer',      label: 'Resident, Buyer or Renter', sub: 'Free forever. Search, comment, connect.' },
  { value: 'agent',      label: 'Real Estate Agent',         sub: 'Professional tools. Free during beta.' },
  { value: 'broker',     label: 'Mortgage Broker',           sub: 'Lead generation. Free during beta.' },
  { value: 'landlord',   label: 'Individual Landlord',       sub: 'Always free. Claim and respond.' },
  { value: 'management', label: 'Property Manager',          sub: 'Portfolio tools. Free during beta.' },
]

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
]

const CITIES = [
  'New York, NY', 'Brooklyn, NY', 'Jersey City, NJ', 'Hoboken, NJ',
  'Newark, NJ', 'Hackensack, NJ', 'Weehawken, NJ', 'Other',
]

export default function SignUp() {
  const { signUp, signInWithGoogle, refreshProfile } = useAuth()
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
  const [googleLoading, setGoogleLoading] = useState(false)

  const isPro = ['agent', 'broker'].includes(accountType)
  const isAgent = accountType === 'agent'
  const isBroker = accountType === 'broker'

  // Google sign-up is for account types that don't require license verification.
  // Agents need a license number, brokers need NMLS, property managers need business
  // verification — those flows need the full email signup form. Buyers and individual
  // landlords have no credentials to verify, so Google sign-in works cleanly for them.
  const canUseGoogle = ['buyer', 'landlord'].includes(accountType)

  async function handleGoogle() {
    setError('')
    setGoogleLoading(true)
    // Stash the chosen account type + city so AuthContext can apply them to the
    // profile row after Google returns. Cleared automatically on first use.
    localStorage.setItem('chathouse_pending_account_type', accountType)
    if (!isPro) localStorage.setItem('chathouse_pending_city', city)
    const { error } = await signInWithGoogle()
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
      // If OAuth failed, clear the stash so it doesn't leak into a later signup.
      localStorage.removeItem('chathouse_pending_account_type')
      localStorage.removeItem('chathouse_pending_city')
    }
  }

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
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', background: colors.white }}>

      {/* LEFT — Form */}
      <div style={{ display: 'flex', flexDirection: 'column', padding: space[8], overflowY: 'auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: space[10] }}>
          <Link to="/" style={{ display: 'inline-block' }}>
            <ChathouseLogo height={36} />
          </Link>
          <div style={{ display: 'flex', gap: space[3], alignItems: 'center' }}>
            <span style={{ fontSize: font.size.sm, color: colors.slate500 }}>Have an account?</span>
            <Button as={Link} to="/signin" variant="secondary" size="sm">Sign in</Button>
          </div>
        </div>

        {step < 4 && (
          <div style={{ display: 'flex', gap: space[2], marginBottom: space[8], maxWidth: 440, width: '100%', margin: `0 auto ${space[8]}px` }}>
            {[1, 2, 3].map(n => (
              <div key={n} style={{
                flex: 1,
                height: 3,
                borderRadius: radius.pill,
                background: n <= step ? colors.brand : colors.slate200,
                transition: 'background 200ms ease',
              }} />
            ))}
          </div>
        )}

        <div style={{ flex: 1, maxWidth: 440, width: '100%', margin: '0 auto', paddingBottom: space[8] }}>

          {step === 1 && (
            <>
              <h1 style={stepHeading}>How will you use Chathouse?</h1>
              <p style={stepSub}>Pick the account that fits. You can change this later.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: space[2] }}>
                {ACCOUNT_TYPES.map(t => {
                  const selected = accountType === t.value
                  return (
                    <button
                      key={t.value}
                      onClick={() => setAccountType(t.value)}
                      style={{
                        textAlign: 'left',
                        padding: `${space[4]}px`,
                        background: selected ? colors.brandLight : colors.white,
                        border: `1.5px solid ${selected ? colors.brand : colors.slate200}`,
                        borderRadius: radius.xl,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: space[3],
                        transition: 'all 160ms ease',
                        fontFamily: font.family.sans,
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: font.weight.bold, fontSize: font.size.base, color: colors.navy, marginBottom: 2 }}>
                          {t.label}
                        </div>
                        <div style={{ fontSize: font.size.xs, color: colors.slate500 }}>{t.sub}</div>
                      </div>
                      {selected && <CheckCircle2 size={18} color={colors.brand} />}
                    </button>
                  )
                })}
              </div>

              {canUseGoogle ? (
                <>
                  <GoogleButton
                    onClick={handleGoogle}
                    loading={googleLoading}
                    label="Sign up with Google"
                    style={{ marginTop: space[6] }}
                  />
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: space[3],
                    margin: `${space[4]}px 0`,
                    color: colors.slate400,
                    fontSize: font.size.xs,
                    fontWeight: font.weight.semibold,
                    textTransform: 'uppercase',
                    letterSpacing: font.letterSpacing.wider,
                  }}>
                    <div style={{ flex: 1, height: 1, background: colors.slate200 }} />
                    <span>Or with email</span>
                    <div style={{ flex: 1, height: 1, background: colors.slate200 }} />
                  </div>
                  <Button onClick={() => setStep(2)} fullWidth size="lg" variant="secondary">
                    Continue with email
                  </Button>
                  {error && <div style={{ marginTop: space[4] }}><ErrorBanner>{error}</ErrorBanner></div>}
                </>
              ) : (
                <>
                  <div style={{
                    marginTop: space[5],
                    padding: space[3],
                    background: colors.slate50,
                    border: `1px solid ${colors.border}`,
                    borderRadius: radius.md,
                    fontSize: font.size.xs,
                    color: colors.slate500,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: space[2],
                  }}>
                    <Info size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>
                      Professional accounts need license verification, which requires email signup.
                    </span>
                  </div>
                  <Button onClick={() => setStep(2)} fullWidth size="lg" style={{ marginTop: space[4] }}>
                    Continue
                  </Button>
                </>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <button onClick={() => setStep(1)} style={backBtnStyle}>
                <ArrowLeft size={14} /> Back
              </button>

              <h1 style={stepHeading}>Create your account</h1>
              <p style={stepSub}>{ACCOUNT_TYPES.find(t => t.value === accountType)?.label}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: space[4] }}>
                <Input label="Full name" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" leftIcon={<User size={16} />} required autoComplete="name" />
                <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" leftIcon={<Mail size={16} />} required autoComplete="email" />
                <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" leftIcon={<Lock size={16} />} required autoComplete="new-password" />

                {!isPro && (
                  <Select label="City" value={city} onChange={e => setCity(e.target.value)}>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </Select>
                )}

                {isPro && (
                  <div style={proSectionStyle}>
                    <div style={proSectionTitleStyle}>Professional details</div>

                    <div>
                      <div style={fieldLabelStyle}>
                        States you serve <span style={{ color: colors.danger }}>*</span>
                      </div>
                      <div style={fieldHintStyle}>Pick all that apply. You'll show up in searches in these states.</div>
                      <div style={stateGridStyle}>
                        {US_STATES.map(s => {
                          const on = statesServed.includes(s)
                          return (
                            <button key={s} type="button" onClick={() => toggleState(s)} style={{
                              padding: '7px 0', fontSize: font.size.xs, fontWeight: font.weight.bold,
                              fontFamily: font.family.sans,
                              border: `1.5px solid ${on ? colors.brand : colors.slate200}`,
                              background: on ? colors.brandLight : colors.white,
                              color: on ? colors.brand : colors.slate500,
                              borderRadius: radius.sm, cursor: 'pointer', transition: 'all 120ms ease',
                            }}>{s}</button>
                          )
                        })}
                      </div>
                      {statesServed.length > 0 && (
                        <div style={{ fontSize: font.size.xs, color: colors.brand, marginTop: space[2], fontWeight: font.weight.semibold }}>
                          Selected: {statesServed.join(', ')}
                        </div>
                      )}
                    </div>

                    {isAgent && (
                      <>
                        <Input label="Real estate license number" value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} placeholder="e.g. 12345678" required />
                        <Select label="License state" value={licenseState} onChange={e => setLicenseState(e.target.value)} helper="The state that issued your license." required>
                          <option value="">Select state...</option>
                          {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </Select>
                      </>
                    )}

                    {isBroker && (
                      <Input label="NMLS number" value={nmlsNumber} onChange={e => setNmlsNumber(e.target.value)} placeholder="e.g. 1234567" helper="Your Nationwide Multistate Licensing System ID." required />
                    )}

                    <Input label={isBroker ? 'Company / lender name' : 'Brokerage name'} value={brokerageName} onChange={e => setBrokerageName(e.target.value)}
                      placeholder={isBroker ? 'e.g. Chase Home Lending' : 'e.g. Compass NYC'} required />

                    <div style={verifyNoteStyle}>
                      <Info size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>Your license info will be reviewed by our admin team. You can use Chathouse while we verify — your profile will show "Pending verification" until approved.</span>
                    </div>
                  </div>
                )}

                {error && <ErrorBanner>{error}</ErrorBanner>}
                <Button onClick={validateAndContinue} fullWidth size="lg" style={{ marginTop: space[2] }}>Continue</Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <button onClick={() => setStep(2)} style={backBtnStyle}>
                <ArrowLeft size={14} /> Back
              </button>

              <h1 style={stepHeading}>{isPro ? 'Upload your profile photo' : 'Add a profile photo?'}</h1>
              <p style={stepSub}>
                {isPro ? 'Required for professional accounts. Helps clients recognize you.' : 'Optional — helps the community recognize you on comments.'}
              </p>

              <div style={photoRowStyle}>
                <div style={photoPreviewStyle}>
                  {photoPreview ? (
                    <img src={photoPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Avatar name={name || '?'} size={96} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <input id="photoFile" type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} style={{ display: 'none' }} />
                  <label htmlFor="photoFile" style={fileBtnStyle}>
                    <Camera size={14} /> {photoFile ? 'Change photo' : 'Choose photo'}
                  </label>
                  <p style={{ fontSize: font.size.xs, color: colors.slate400, marginTop: space[2] }}>JPG or PNG, under 5MB.</p>
                  {isPro && !photoFile && (
                    <p style={{ fontSize: font.size.xs, color: colors.danger, marginTop: space[2], fontWeight: font.weight.semibold }}>Required for pros</p>
                  )}
                </div>
              </div>

              {error && <div style={{ marginTop: space[4] }}><ErrorBanner>{error}</ErrorBanner></div>}

              <div style={{ display: 'flex', gap: space[3], marginTop: space[6] }}>
                {!isPro && (
                  <Button variant="ghost" onClick={() => handleFinalSubmit(true)} disabled={loading} size="lg">Skip for now</Button>
                )}
                <Button onClick={() => handleFinalSubmit(false)} loading={loading} disabled={loading || (isPro && !photoFile)} fullWidth size="lg">
                  {loading ? 'Creating account...' : 'Create account'}
                </Button>
              </div>
            </>
          )}

          {step === 4 && (
            <div style={{ textAlign: 'center', paddingTop: space[8] }}>
              <div style={successIconStyle}><Mail size={32} color={colors.brand} /></div>
              <h1 style={{ ...stepHeading, textAlign: 'center' }}>Check your email</h1>
              <p style={{ ...stepSub, textAlign: 'center', marginBottom: space[6] }}>
                We sent a confirmation link to <strong style={{ color: colors.navy }}>{email}</strong>. Click the link to verify your account, then sign in.
              </p>
              <div style={emailStepsStyle}>
                {['Open your email inbox', "Look for a message from Chathouse (check spam if you don't see it)", 'Click the confirmation link', 'Return here and sign in'].map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: space[3] }}>
                    <CheckCircle2 size={16} color={colors.brand} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: font.size.sm, color: colors.slate700, lineHeight: font.lineHeight.normal, textAlign: 'left' }}>{s}</span>
                  </div>
                ))}
              </div>
              <Button as={Link} to="/signin" fullWidth size="lg" style={{ marginTop: space[6], textDecoration: 'none' }}>Go to sign in</Button>
              <p style={{ fontSize: font.size.xs, color: colors.slate400, marginTop: space[4] }}>Didn't get the email? Check spam, or try signing up again in a few minutes.</p>
            </div>
          )}

          {step < 4 && (
            <p style={legalStyle}>
              By continuing you agree to our <Link to="/terms" style={linkStyle}>Terms of Service</Link> and <Link to="/privacy" style={linkStyle}>Privacy Policy</Link>.
            </p>
          )}
        </div>

        <div style={trustNoteStyle}>
          <Shield size={14} />
          Free for buyers, renters, and neighbors — always will be.
        </div>
      </div>

      {/* RIGHT — Social proof panel */}
      <div style={rightPanelStyle}>
        <div style={gridBgStyle} />

        <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto', width: '100%' }}>
          <div style={{
            fontSize: font.size.xs, fontWeight: font.weight.bold, textTransform: 'uppercase',
            letterSpacing: font.letterSpacing.widest, color: colors.accent, marginBottom: space[3],
          }}>
            Join the community
          </div>

          <h2 style={{
            fontSize: font.size['5xl'], fontWeight: font.weight.bold, color: colors.white,
            letterSpacing: font.letterSpacing.tight, lineHeight: font.lineHeight.tight,
            margin: 0, marginBottom: space[3],
          }}>
            1,200+ already on Chathouse.
          </h2>
          <p style={{
            fontSize: font.size.md, color: colors.slate400,
            lineHeight: font.lineHeight.relaxed, margin: 0, marginBottom: space[8],
          }}>
            Renters, buyers, and neighbors across the country sharing what they actually know about the homes they live in.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: space[2], marginBottom: space[8] }}>
            {['New York', 'Brooklyn', 'Jersey City', 'Hoboken', 'Newark', 'Weehawken', 'Hackensack'].map(c => (
              <span key={c} style={cityPillStyle}>
                <MapPin size={11} />
                {c}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: space[3] }}>
            <TestimonialCard name="Maria C." role="Past tenant" location="Brooklyn, NY"
              body="I almost signed a lease on a Park Slope 2BR. Two verified past tenants warned me about chronic mold. Saved me 24 months of misery." />
            <TestimonialCard name="James T." role="Buyer" location="Jersey City, NJ"
              body="Neighbor flagged a flooding issue three buyers before me missed. Renegotiated $18k off the closing price." />
            <TestimonialCard name="Priya S." role="Renter" location="Hoboken, NJ"
              body="The reviews are brutally honest. Not perfect apartments, but real ones. That's what I wanted." />
          </div>
        </div>
      </div>
    </div>
  )
}

function ErrorBanner({ children }) {
  return (
    <div style={{
      padding: `${space[3]}px ${space[4]}px`,
      background: colors.dangerBg,
      border: `1px solid ${colors.danger}33`,
      borderRadius: radius.md,
      color: colors.dangerText,
      fontSize: font.size.sm,
      fontWeight: font.weight.medium,
    }}>
      {children}
    </div>
  )
}

function TestimonialCard({ name, role, location, body }) {
  return (
    <div style={{ background: colors.navyDark, border: `1px solid ${colors.navyLine}`, borderRadius: radius.xl, padding: space[4] }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: space[2], marginBottom: space[3] }}>
        <Avatar name={name} size={28} />
        <div>
          <div style={{ fontSize: font.size.xs, fontWeight: font.weight.bold, color: colors.white }}>{name} · {role}</div>
          <div style={{ fontSize: 10, color: colors.slate400, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <MapPin size={9} />{location}
          </div>
        </div>
      </div>
      <p style={{ fontSize: font.size.sm, color: colors.slate300, lineHeight: font.lineHeight.relaxed, margin: 0 }}>{body}</p>
    </div>
  )
}

const stepHeading = { fontSize: font.size['4xl'], fontWeight: font.weight.bold, color: colors.navy, letterSpacing: font.letterSpacing.tight, lineHeight: font.lineHeight.tight, margin: 0, marginBottom: space[2] }
const stepSub = { fontSize: font.size.md, color: colors.slate500, lineHeight: font.lineHeight.normal, margin: 0, marginBottom: space[6] }
const backBtnStyle = { display: 'inline-flex', alignItems: 'center', gap: space[1], padding: `${space[1]}px ${space[2]}px`, background: 'transparent', border: 'none', color: colors.slate500, fontSize: font.size.sm, fontWeight: font.weight.semibold, fontFamily: font.family.sans, cursor: 'pointer', marginBottom: space[4], marginLeft: -space[2], borderRadius: radius.sm }
const proSectionStyle = { padding: space[4], background: colors.slate50, borderRadius: radius.xl, border: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column', gap: space[4] }
const proSectionTitleStyle = { fontSize: font.size.base, fontWeight: font.weight.bold, color: colors.navy, marginBottom: space[1], fontFamily: font.family.sans }
const fieldLabelStyle = { fontSize: font.size.sm, fontWeight: font.weight.semibold, color: colors.slate700, fontFamily: font.family.sans, marginBottom: 4 }
const fieldHintStyle = { fontSize: font.size.xs, color: colors.slate500, marginBottom: space[2] }
const stateGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(52px, 1fr))', gap: 4 }
const verifyNoteStyle = { padding: space[3], background: colors.warningBg, border: `1px solid ${colors.warning}33`, borderRadius: radius.md, fontSize: font.size.xs, color: colors.warningText, lineHeight: font.lineHeight.normal, display: 'flex', alignItems: 'flex-start', gap: space[2] }
const photoRowStyle = { display: 'flex', alignItems: 'center', gap: space[4], padding: space[4], background: colors.slate50, borderRadius: radius.xl, border: `1px solid ${colors.border}` }
const photoPreviewStyle = { width: 96, height: 96, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.white, border: `2px solid ${colors.white}`, boxShadow: '0 2px 8px rgba(15,31,61,0.08)' }
const fileBtnStyle = { display: 'inline-flex', alignItems: 'center', gap: space[2], padding: `${space[2]}px ${space[3]}px`, border: `1.5px solid ${colors.slate200}`, borderRadius: radius.md, fontSize: font.size.sm, fontWeight: font.weight.semibold, color: colors.slate700, cursor: 'pointer', background: colors.white, fontFamily: font.family.sans }
const successIconStyle = { width: 72, height: 72, borderRadius: '50%', background: colors.brandLight, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: space[5], border: `4px solid ${colors.white}`, boxShadow: '0 4px 16px rgba(26,111,232,0.15)' }
const emailStepsStyle = { padding: space[5], background: colors.slate50, borderRadius: radius.xl, border: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column', gap: space[3], textAlign: 'left' }
const legalStyle = { fontSize: font.size.xs, color: colors.slate400, textAlign: 'center', lineHeight: font.lineHeight.normal, marginTop: space[6], marginBottom: 0 }
const linkStyle = { color: colors.brand, textDecoration: 'none', fontWeight: font.weight.semibold }
const trustNoteStyle = { display: 'flex', alignItems: 'center', gap: space[2], fontSize: font.size.xs, color: colors.slate400, marginTop: space[8], maxWidth: 440, width: '100%', margin: `${space[8]}px auto 0` }
const rightPanelStyle = { background: colors.navy, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: space[12], color: colors.white, position: 'relative', overflow: 'hidden' }
const gridBgStyle = { position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${colors.navyLine}66 1px, transparent 1px), linear-gradient(90deg, ${colors.navyLine}66 1px, transparent 1px)`, backgroundSize: '40px 40px', opacity: 0.4, pointerEvents: 'none' }
const cityPillStyle = { display: 'inline-flex', alignItems: 'center', gap: 4, padding: `${space[1]}px ${space[3]}px`, background: colors.navyDark, border: `1px solid ${colors.navyLine}`, borderRadius: radius.pill, fontSize: font.size.xs, fontWeight: font.weight.semibold, color: colors.slate300 }