import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import TopNav from '../components/TopNav'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { streetViewUrl } from '../lib/streetView'

const PROPERTY_TYPES = [
  { value: 'apartment', label: '🏢 Apartment building' },
  { value: 'house', label: '🏠 Single-family house' },
  { value: 'condo', label: '🏙️ Condo' },
  { value: 'townhouse', label: '🏘️ Townhouse' },
  { value: 'multi-family', label: '🏚️ Multi-family / Duplex' },
  { value: 'other', label: '🏗️ Other' },
]

export default function AddListing() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [address, setAddress] = useState('')
  const [city, setCity] = useState('New York')
  const [state, setState] = useState('NY')
  const [zip, setZip] = useState('')
  const [propertyType, setPropertyType] = useState('apartment')
  const [description, setDescription] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [useStreetView, setUseStreetView] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!address || !city || !state || !zip) {
      return setError('Please fill in all required fields.')
    }
    if (!photoFile && !useStreetView) {
      return setError('Please either upload a photo or use Street View for this address.')
    }

    setError('')
    setSubmitting(true)

    let imgUrl = null
    try {
      if (photoFile) {
        if (photoFile.size > 10 * 1024 * 1024) {
          setSubmitting(false)
          return setError('Photo must be under 10MB.')
        }
        const ext = photoFile.name.split('.').pop()
        const path = `community/${user.id}-${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage
          .from('listing-photos')
          .upload(path, photoFile)
        if (upErr) throw new Error(upErr.message)
        const { data: { publicUrl } } = supabase.storage.from('listing-photos').getPublicUrl(path)
        imgUrl = publicUrl
      } else if (useStreetView) {
        imgUrl = streetViewUrl({ address: `${address}, ${city}, ${state} ${zip}`, size: '700x400' })
      }

      const { data, error: insErr } = await supabase
        .from('listings')
        .insert({
          type: 'rent', // default — gets overwritten when a pro claims & lists
          source: 'community',
          address,
          city,
          state,
          zip,
          description: description || null,
          img_url: imgUrl,
          hood: city,
          added_by: user.id,
          tag: 'Community Listed',
          tag_color: '#7c3aed',
          is_active: true,
          // Store property type in description metadata for now; we'll add a column later if needed
        })
        .select()
        .single()

      if (insErr) throw new Error(insErr.message)
      navigate(`/listing/${data.id}`)
    } catch (err) {
      setSubmitting(false)
      setError(err.message || 'Something went wrong.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <TopNav />
      <div style={styles.page}>
        <Link to="/" style={styles.back}>← Back to listings</Link>

        <div style={styles.header}>
          <span style={styles.tag}>🏘️ Community Listing</span>
          <h1 style={styles.h1}>Add a building</h1>
          <p style={styles.sub}>
            Help your community by adding a building that isn't on Chathouse yet. Add the basics — the landlord
            or property manager can claim it later and fill in pricing, unit details, and their own photos.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <SectionTitle title="Address" />

          <Field label="Street address" required>
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="310 W 85th St" style={styles.input} />
          </Field>

          <div style={styles.row3}>
            <Field label="City" required>
              <input value={city} onChange={(e) => setCity(e.target.value)} style={styles.input} />
            </Field>
            <Field label="State" required>
              <input value={state} onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))} maxLength={2} style={styles.input} />
            </Field>
            <Field label="Zip" required>
              <input value={zip} onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))} maxLength={5} style={styles.input} />
            </Field>
          </div>

          <SectionTitle title="Building type" />

          <Field label="What kind of building is this?">
            <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} style={styles.input}>
              {PROPERTY_TYPES.map(pt => <option key={pt.value} value={pt.value}>{pt.label}</option>)}
            </select>
          </Field>

          <Field label="Description (optional)">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Anything about this building — neighborhood, what it's like, why you're adding it. (Leave pricing and specific unit details to the landlord or property manager.)"
              rows={3}
              style={{ ...styles.input, resize: 'vertical', fontFamily: 'inherit' }}
            />
          </Field>

          <SectionTitle title="Photo (required)" />

          <div style={styles.photoBox}>
            <input id="photoFile" type="file" accept="image/*" onChange={(e) => {
              setPhotoFile(e.target.files[0])
              if (e.target.files[0]) setUseStreetView(false)
            }} style={{ display: 'none' }} />

            <label htmlFor="photoFile" style={{ ...styles.fileBtn, ...(photoFile ? styles.fileBtnActive : {}) }}>
              {photoFile ? `📎 ${photoFile.name}` : '📷 Upload a photo'}
            </label>

            <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', margin: '10px 0' }}>— OR —</div>

            <button
              type="button"
              onClick={() => {
                setUseStreetView(!useStreetView)
                if (!useStreetView) setPhotoFile(null)
              }}
              style={{ ...styles.fileBtn, ...(useStreetView ? styles.fileBtnActive : {}) }}
            >
              {useStreetView ? '✓ Using Street View for this address' : '🗺️ Use Google Street View of this address'}
            </button>

            {useStreetView && address && city && (
              <div style={{ marginTop: 14 }}>
                <img
                  src={streetViewUrl({ address: `${address}, ${city}, ${state} ${zip}`, size: '400x200' })}
                  alt="Street view preview"
                  style={{ width: '100%', borderRadius: 10, border: '1px solid #e2e8f0' }}
                />
              </div>
            )}
          </div>

          <div style={styles.info}>
            💡 <strong>Why keep it simple?</strong> Community listings exist so people can leave honest comments about
            buildings they know. Prices, unit counts, and interior specs are added by the landlord or property manager
            when they claim the listing — that keeps the data accurate.
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.submit}>
            <button type="submit" disabled={submitting} style={{ ...styles.submitBtn, opacity: submitting ? 0.5 : 1 }}>
              {submitting ? 'Adding building...' : 'Add building to Chathouse →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function SectionTitle({ title }) {
  return <h3 style={{ fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 700, color: '#0f172a', marginTop: 24, marginBottom: 10 }}>{title}</h3>
}

function Field({ label, required, children }) {
  return (
    <div style={{ flex: 1, marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 6 }}>
        {label}{required && <span style={{ color: '#dc2626', marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  )
}

const styles = {
  page: { maxWidth: 720, margin: '0 auto', padding: '24px 20px 60px' },
  back: { display: 'inline-block', fontSize: 13, color: '#64748b', marginBottom: 16, textDecoration: 'none', fontWeight: 600 },
  header: { marginBottom: 24, padding: 24, background: '#fff', borderRadius: 16, border: '1.5px solid #e2e8f0' },
  tag: { display: 'inline-block', padding: '4px 12px', background: '#f3e8ff', color: '#7e22ce', borderRadius: 100, fontSize: 11, fontWeight: 700, marginBottom: 10 },
  h1: { fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 700, color: '#0f172a', marginBottom: 8 },
  sub: { fontSize: 14, color: '#64748b', lineHeight: 1.6 },
  form: { padding: 24, background: '#fff', borderRadius: 16, border: '1.5px solid #e2e8f0' },
  row3: { display: 'flex', gap: 12 },
  input: {
    width: '100%', padding: '10px 12px',
    border: '1.5px solid #e2e8f0', borderRadius: 10,
    fontSize: 14, color: '#0f172a', outline: 'none',
    background: '#fff',
  },
  photoBox: { padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' },
  fileBtn: {
    display: 'block', width: '100%', padding: '14px 16px',
    border: '2px dashed #cbd5e1', borderRadius: 10,
    fontSize: 13, color: '#64748b', cursor: 'pointer',
    textAlign: 'center', fontWeight: 600, background: '#fff',
  },
  fileBtnActive: { borderColor: '#1a6cf5', color: '#1a6cf5', background: '#e8f0fe' },
  info: {
    marginTop: 18, padding: 14, background: '#e8f0fe',
    borderRadius: 10, fontSize: 12, color: '#1e40af', lineHeight: 1.6,
  },
  error: { marginTop: 16, padding: 12, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', fontSize: 13 },
  submit: { marginTop: 20, display: 'flex', justifyContent: 'flex-end' },
  submitBtn: {
    padding: '12px 24px', background: '#1a6cf5',
    color: '#fff', border: 'none', borderRadius: 10,
    fontSize: 14, fontWeight: 700, cursor: 'pointer',
  },
}
