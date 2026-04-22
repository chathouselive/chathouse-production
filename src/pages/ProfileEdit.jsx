import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import TopNav from '../components/TopNav'
import { useAuth } from '../lib/AuthContext'
import { updateMyProfile, uploadProfilePhoto } from '../lib/useProfile'
import { supabase } from '../lib/supabase'

export default function ProfileEdit() {
  const { profile, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [moveTimeline, setMoveTimeline] = useState('')
  const [bio, setBio] = useState('')
  const [lookingFor, setLookingFor] = useState('')
  const [company, setCompany] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [highlights, setHighlights] = useState({})
  const [photoFile, setPhotoFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [photoPreview, setPhotoPreview] = useState(null)
  const [liveAvgRating, setLiveAvgRating] = useState(null)
  const [reviewCount, setReviewCount] = useState(0)

  useEffect(() => {
    if (profile) {
      setName(profile.name || '')
      setCity(profile.city || '')
      setMoveTimeline(profile.move_timeline || '')
      setBio(profile.bio || '')
      setLookingFor(profile.looking_for || '')
      setCompany(profile.company || '')
      setLicenseNumber(profile.license_number || '')
      // Strip avg_rating from highlights so it's never saved manually
      const { avg_rating, ...rest } = profile.highlights || {}
      setHighlights(rest)
      if (['agent', 'broker', 'management'].includes(profile.account_type)) {
        fetchLiveRating(profile.id)
      }
    }
  }, [profile])

  async function fetchLiveRating(userId) {
    const { data } = await supabase
      .from('reviews')
      .select('rating')
      .eq('reviewee_id', userId)
    if (data && data.length > 0) {
      const avg = data.reduce((s, r) => s + r.rating, 0) / data.length
      setLiveAvgRating(Math.round(avg * 10) / 10)
      setReviewCount(data.length)
    } else {
      setLiveAvgRating(null)
      setReviewCount(0)
    }
  }

  function handlePhotoChange(e) {
    const f = e.target.files[0]
    if (!f) return
    setPhotoFile(f)
    setPhotoPreview(URL.createObjectURL(f))
  }

  function updateHighlight(key, value) {
    setHighlights(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      let photoUrl = profile?.photo_url
      if (photoFile) {
        const { url, error: upErr } = await uploadProfilePhoto(photoFile, profile.id)
        if (upErr) throw new Error(upErr)
        photoUrl = url
      }

      // Never save avg_rating to highlights
      const { avg_rating, ...cleanHighlights } = highlights

      const updates = {
        name,
        city,
        move_timeline: moveTimeline || null,
        bio: bio || null,
        looking_for: lookingFor || null,
        company: company || null,
        license_number: licenseNumber || null,
        highlights: cleanHighlights,
        photo_url: photoUrl,
      }

      const { error: updErr } = await updateMyProfile(updates)
      if (updErr) throw new Error(updErr.message || 'Update failed')

      await refreshProfile()
      navigate(`/profile/${profile.id}`)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  if (!profile) return null

  const isPro = ['agent', 'broker', 'landlord', 'management'].includes(profile.account_type)
  const isBuyer = profile.account_type === 'buyer'

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <TopNav />
      <div style={styles.page}>
        <Link to={`/profile/${profile.id}`} style={styles.back}>← Back to profile</Link>

        <div style={styles.header}>
          <h1 style={styles.h1}>Edit your profile</h1>
          <p style={styles.sub}>Let the community know who you are.</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <SectionTitle>Profile photo</SectionTitle>
          <div style={styles.photoRow}>
            <div style={styles.photoPreview}>
              {photoPreview || profile.photo_url ? (
                <img src={photoPreview || profile.photo_url} alt="preview" style={styles.photoImg}/>
              ) : (
                <div style={styles.photoInitial}>{profile.name?.[0]?.toUpperCase()}</div>
              )}
            </div>
            <div>
              <input id="profilePhoto" type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }}/>
              <label htmlFor="profilePhoto" style={styles.fileBtn}>
                📷 {photoFile ? 'Change photo' : 'Upload photo'}
              </label>
              <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>Recommended: square image, under 5MB</p>
            </div>
          </div>

          <SectionTitle>About you</SectionTitle>
          <Field label="Full name" required>
            <input value={name} onChange={e => setName(e.target.value)} style={styles.input} required/>
          </Field>
          <div style={styles.row2}>
            <Field label="City">
              <input value={city} onChange={e => setCity(e.target.value)} style={styles.input} placeholder="New York, NY"/>
            </Field>
            {isBuyer && (
              <Field label="Move timeline">
                <input value={moveTimeline} onChange={e => setMoveTimeline(e.target.value)} style={styles.input} placeholder="e.g. 3 months"/>
              </Field>
            )}
          </div>
          <Field label="Bio">
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} style={{ ...styles.input, resize: 'vertical', fontFamily: 'inherit' }} placeholder="Tell the community about yourself..."/>
          </Field>

          {isBuyer && (
            <>
              <SectionTitle>What I'm looking for</SectionTitle>
              <Field label="Your search criteria">
                <input value={lookingFor} onChange={e => setLookingFor(e.target.value)} style={styles.input} placeholder="e.g. 2–3 bed, For Sale, NYC"/>
              </Field>
            </>
          )}

          {profile.account_type === 'agent' && (
            <>
              <SectionTitle>Agent Highlights</SectionTitle>
              <Field label="License number">
                <input value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} style={styles.input}/>
              </Field>
              <Field label="Brokerage / Company">
                <input value={company} onChange={e => setCompany(e.target.value)} style={styles.input} placeholder="e.g. Compass NYC"/>
              </Field>
              <div style={styles.row2}>
                <Field label="Market">
                  <input value={highlights.market || ''} onChange={e => updateHighlight('market', e.target.value)} style={styles.input} placeholder="e.g. All 5 Boroughs"/>
                </Field>
                <Field label="Experience">
                  <input value={highlights.experience || ''} onChange={e => updateHighlight('experience', e.target.value)} style={styles.input} placeholder="e.g. 8 Years"/>
                </Field>
              </div>
              <div style={styles.row2}>
                <Field label="Deals closed">
                  <input value={highlights.deals_closed || ''} onChange={e => updateHighlight('deals_closed', e.target.value)} style={styles.input} placeholder="e.g. 200+"/>
                </Field>
                <Field label="Specialty">
                  <input value={highlights.specialty || ''} onChange={e => updateHighlight('specialty', e.target.value)} style={styles.input} placeholder="e.g. First-Time Buyers"/>
                </Field>
              </div>
              <RatingReadOnly avgRating={liveAvgRating} reviewCount={reviewCount}/>
            </>
          )}

          {profile.account_type === 'broker' && (
            <>
              <SectionTitle>Broker Highlights</SectionTitle>
              <Field label="License number">
                <input value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} style={styles.input}/>
              </Field>
              <Field label="Lender / Company">
                <input value={company} onChange={e => setCompany(e.target.value)} style={styles.input} placeholder="e.g. Chase Home Lending"/>
              </Field>
              <div style={styles.row2}>
                <Field label="Experience">
                  <input value={highlights.experience || ''} onChange={e => updateHighlight('experience', e.target.value)} style={styles.input} placeholder="e.g. 12 Years"/>
                </Field>
                <Field label="Loans closed">
                  <input value={highlights.loans_closed || ''} onChange={e => updateHighlight('loans_closed', e.target.value)} style={styles.input} placeholder="e.g. 500+"/>
                </Field>
              </div>
              <div style={styles.row2}>
                <Field label="Avg close time">
                  <input value={highlights.avg_close_time || ''} onChange={e => updateHighlight('avg_close_time', e.target.value)} style={styles.input} placeholder="e.g. 21 Days"/>
                </Field>
                <Field label="Loan types">
                  <input value={highlights.loan_types || ''} onChange={e => updateHighlight('loan_types', e.target.value)} style={styles.input} placeholder="e.g. Conv · FHA · VA"/>
                </Field>
              </div>
              <RatingReadOnly avgRating={liveAvgRating} reviewCount={reviewCount}/>
            </>
          )}

          {profile.account_type === 'management' && (
            <>
              <SectionTitle>Property Management info</SectionTitle>
              <Field label="Company name (optional)">
                <input value={company} onChange={e => setCompany(e.target.value)} style={styles.input} placeholder="Leave blank if individual"/>
              </Field>
              <RatingReadOnly avgRating={liveAvgRating} reviewCount={reviewCount}/>
              <div style={styles.note}>
                💡 Claim your buildings in the Listings feed to show them on your profile. Feature coming soon.
              </div>
            </>
          )}

          {profile.account_type === 'landlord' && (
            <>
              <SectionTitle>Landlord info</SectionTitle>
              <Field label="Company name (optional)">
                <input value={company} onChange={e => setCompany(e.target.value)} style={styles.input} placeholder="Leave blank if individual"/>
              </Field>
              <div style={styles.note}>
                💡 Claim your buildings in the Listings feed to show them on your profile. Feature coming soon.
              </div>
            </>
          )}

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.submit}>
            <button type="button" onClick={() => navigate(`/profile/${profile.id}`)} style={styles.cancelBtn}>Cancel</button>
            <button type="submit" disabled={saving} style={{ ...styles.saveBtn, opacity: saving ? 0.5 : 1 }}>
              {saving ? 'Saving...' : 'Save profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function RatingReadOnly({ avgRating, reviewCount }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 6 }}>
        Avg Rating
      </label>
      <div style={{ padding: '10px 14px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
        {avgRating ? (
          <>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#d97706' }}>{avgRating} ⭐</span>
            <span style={{ fontSize: 13, color: '#64748b' }}>based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}</span>
          </>
        ) : (
          <span style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>No reviews yet — your rating will appear here once clients leave reviews.</span>
        )}
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#94a3b8', background: '#f1f5f9', padding: '3px 8px', borderRadius: 6 }}>🔒 Set by reviews</span>
      </div>
    </div>
  )
}

function SectionTitle({ children }) {
  return <h3 style={{ fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 700, color: '#0f172a', marginTop: 24, marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid #e2e8f0' }}>{children}</h3>
}

function Field({ label, required, children }) {
  return (
    <div style={{ flex: 1, marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 6 }}>
        {label}{required && <span style={{ color: '#dc2626', marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  )
}

const styles = {
  page: { maxWidth: 720, margin: '0 auto', padding: '24px 20px 60px' },
  back: { display: 'inline-block', fontSize: 13, color: '#64748b', marginBottom: 16, textDecoration: 'none', fontWeight: 600 },
  header: { marginBottom: 20 },
  h1: { fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 700, color: '#0f172a' },
  sub: { fontSize: 14, color: '#64748b', marginTop: 2 },
  form: { padding: 24, background: '#fff', borderRadius: 16, border: '1.5px solid #e2e8f0' },
  photoRow: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 },
  photoPreview: { width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 },
  photoImg: { width: '100%', height: '100%', objectFit: 'cover' },
  photoInitial: { width: '100%', height: '100%', background: 'linear-gradient(135deg, #1a6cf5, #f97316)', color: '#fff', fontSize: 30, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  fileBtn: { display: 'inline-block', padding: '8px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#475569', cursor: 'pointer', background: '#fff' },
  row2: { display: 'flex', gap: 12 },
  input: { width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, color: '#0f172a', outline: 'none', background: '#fff' },
  note: { padding: 12, background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 10, fontSize: 12, color: '#92400e', lineHeight: 1.5 },
  error: { marginTop: 16, padding: 12, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', fontSize: 13 },
  submit: { marginTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end' },
  cancelBtn: { padding: '11px 18px', background: '#f1f5f9', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer' },
  saveBtn: { padding: '11px 22px', background: '#1a6cf5', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' },
}
