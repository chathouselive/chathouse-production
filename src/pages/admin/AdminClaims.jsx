import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { supabase } from '../../lib/supabase'

export default function AdminClaims() {
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')

  useEffect(() => { fetchClaims() }, [filter])

  async function fetchClaims() {
    setLoading(true)
    let query = supabase
      .from('listing_claims')
      .select('*, claimant:user_id(id, name, photo_url, account_type, company), listing:listing_id(id, address, hood, city)')
      .order('created_at', { ascending: false })
    if (filter !== 'all') query = query.eq('status', filter)
    const { data } = await query
    setClaims(data || [])
    setLoading(false)
  }

  async function approveClaim(claim) {
    // Update claim status
    await supabase.from('listing_claims').update({ status: 'approved' }).eq('id', claim.id)
    // Set claimed_by on the listing
    await supabase.from('listings').update({ claimed_by: claim.user_id }).eq('id', claim.listing_id)
    // Notify the claimant
    await supabase.from('notifications').insert({
      user_id: claim.user_id,
      type: 'claim_approved',
      title: '✅ Your listing claim was approved',
      body: `You now manage ${claim.listing?.address}`,
      related_url: `/listing/${claim.listing_id}`,
    })
    fetchClaims()
  }

  async function declineClaim(claimId, userId, address) {
    await supabase.from('listing_claims').update({ status: 'declined' }).eq('id', claimId)
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'claim_declined',
      title: '❌ Your listing claim was declined',
      body: `Your claim for ${address} was not approved. Contact support if you believe this is an error.`,
    })
    fetchClaims()
  }

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000), hours = Math.floor(diff / 3600000), days = Math.floor(diff / 86400000)
    if (mins < 1) return 'just now'; if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`; if (days < 7) return `${days}d ago`
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const pendingCount = claims.filter(c => c.status === 'pending').length

  return (
    <AdminLayout>
      <div style={styles.head}>
        <h1 style={styles.h1}>Listing Claims {pendingCount > 0 && <span style={styles.badge}>{pendingCount} pending</span>}</h1>
        <p style={styles.sub}>Review and approve ownership claims from landlords and property managers.</p>
      </div>

      <div style={styles.filters}>
        {['pending', 'approved', 'declined', 'all'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ ...styles.chip, ...(filter === f ? styles.chipActive : {}) }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={styles.center}>Loading...</div>
      ) : claims.length === 0 ? (
        <div style={styles.empty}>No {filter} claims.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {claims.map(claim => (
            <div key={claim.id} style={styles.claimCard}>
              <div style={styles.claimTop}>
                <div style={styles.claimLeft}>
                  <div style={styles.claimAvatar}>
                    {claim.claimant?.photo_url ? (
                      <img src={claim.claimant.photo_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}/>
                    ) : (
                      <div style={styles.claimAvatarInitial}>{claim.claimant?.name?.[0]?.toUpperCase()}</div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{claim.claimant?.name}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      {claim.claimant?.account_type === 'management' ? '🏢 Property Manager' : '🏡 Landlord'}
                      {claim.claimant?.company && ` · ${claim.claimant.company}`}
                    </div>
                    <Link to={`/profile/${claim.user_id}`} style={{ fontSize: 11, color: '#1a6cf5', textDecoration: 'none' }}>View profile →</Link>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ ...styles.statusBadge, ...(claim.status === 'pending' ? styles.statusPending : claim.status === 'approved' ? styles.statusApproved : styles.statusDeclined) }}>
                    {claim.status}
                  </span>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{timeAgo(claim.created_at)}</div>
                </div>
              </div>

              <div style={styles.listingInfo}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>📍 {claim.listing?.address}</span>
                <span style={{ fontSize: 12, color: '#64748b' }}>{claim.listing?.hood || claim.listing?.city}</span>
                <Link to={`/listing/${claim.listing_id}`} style={{ fontSize: 11, color: '#1a6cf5', textDecoration: 'none' }}>View listing →</Link>
              </div>

              {claim.notes && (
                <div style={styles.docRow}>
                  <span style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>📎 Verification document:</span>
                  <a href={claim.notes} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#1a6cf5', textDecoration: 'none', fontWeight: 600 }}>
                    View document →
                  </a>
                </div>
              )}

              {claim.status === 'pending' && (
                <div style={styles.actions}>
                  <button onClick={() => approveClaim(claim)} style={styles.approveBtn}>✅ Approve & Set Owner</button>
                  <button onClick={() => declineClaim(claim.id, claim.user_id, claim.listing?.address)} style={styles.declineBtn}>✕ Decline</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}

const styles = {
  head: { marginBottom: 20 },
  h1: { fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 10 },
  badge: { fontSize: 13, fontWeight: 700, background: '#fef3c7', color: '#92400e', padding: '3px 10px', borderRadius: 100 },
  sub: { fontSize: 14, color: '#64748b', marginTop: 4 },
  filters: { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  chip: { padding: '7px 16px', border: '1.5px solid #e2e8f0', borderRadius: 100, background: '#fff', fontSize: 13, fontWeight: 600, color: '#64748b', cursor: 'pointer' },
  chipActive: { background: '#1a6cf5', color: '#fff', borderColor: '#1a6cf5' },
  claimCard: { background: '#fff', borderRadius: 14, border: '1.5px solid #e2e8f0', padding: 20 },
  claimTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 12 },
  claimLeft: { display: 'flex', alignItems: 'flex-start', gap: 12 },
  claimAvatar: { width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(135deg, #7c3aed, #ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  claimAvatarInitial: { color: '#fff', fontSize: 16, fontWeight: 700 },
  statusBadge: { fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100 },
  statusPending: { background: '#fef3c7', color: '#92400e' },
  statusApproved: { background: '#dcfce7', color: '#166534' },
  statusDeclined: { background: '#fee2e2', color: '#991b1b' },
  listingInfo: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f8fafc', borderRadius: 8, marginBottom: 12, flexWrap: 'wrap' },
  docRow: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: '#eff6ff', borderRadius: 8, marginBottom: 12 },
  actions: { display: 'flex', gap: 8 },
  approveBtn: { padding: '9px 18px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  declineBtn: { padding: '9px 14px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  center: { padding: 40, textAlign: 'center', color: '#64748b' },
  empty: { padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 14 },
}
