import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { uploadProfilePhoto, updateMyProfile } from '../lib/useProfile'

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

  // Shared
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [city, setCity] = useState('New York, NY')
  const [password, setPassword] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)

  // Pro-specific
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

    setStep(3) // photo
  }

  async function handleFinalSubmit(skipPhoto) {
    setError('')

    // Pros MUST upload a photo
    if (isPro && skipPhoto) return setError('Professional accounts require a profile photo.')
    if (isPro && !photoFile) return setError('Please upload a profile photo to continue.')

    setLoading(true)
    try {
      const { data, error } = await signUp({ email, password, name, accountType, city })
      if (error) throw new Error(error.message)

      // Save pro fields + photo in one update
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

      navigate('/')
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>🏠 <span style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 24 }}>Chathouse</span></div>

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
                <>
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
                </>
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
              {isPro
                ? 'Required for professional accounts. Helps clients recognize you.'
                : 'Optional — helps the community recognize you on comments.'}
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
                  <p style={{ fontSize: 11, color: '#dc2626', marginTop: 6, fontWeight: 600 }}>
                    Required for pros
                  </p>
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

        <p style={styles.footer}>
          Already have an account? <Link to="/signin" style={{ fontWeight: 600 }}>Sign in</Link>
        </p>
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
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 24,
    background: 'linear-gradient(135deg, #e8f0fe 0%, #fff 50%, #fff3e8 100%)',
  },
  card: {
    width: '100%', maxWidth: 520,
    background: '#fff', borderRadius: 20, padding: 36,
    boxShadow: '0 20px 60px rgba(26,108,245,0.12)',
    border: '1.5px solid #e2e8f0',
    maxHeight: '94vh', overflowY: 'auto',
  },
  logo: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 },
  heading: { fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 700, marginBottom: 6, color: '#0f172a' },
  sub: { fontSize: 14, color: '#64748b', marginBottom: 22 },
  input: {
    width: '100%', padding: '11px 14px',
    border: '1.5px solid #e2e8f0', borderRadius: 10,
    fontSize: 14, color: '#0f172a', outline: 'none',
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
  footer: { fontSize: 13, color: '#64748b', textAlign: 'center', marginTop: 24 },
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
    fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 700,
    color: '#0f172a', marginBottom: 2,
  },
  stateGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(52px, 1fr))',
    gap: 4,
  },
  verifyNote: {
    padding: 10, background: '#fef3c7',
    border: '1px solid #fcd34d', borderRadius: 8,
    fontSize: 11, color: '#92400e', lineHeight: 1.5,
  },
}
