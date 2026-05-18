import { useState, useEffect } from 'react'

/* ============================================================
   InviteShareModal — modal for inviting friends to Chathouse
   - Shows invite link: chathouselive.com/?ref={userId}
   - Copy button with "Copied!" feedback
   - Native share (mobile) + channel buttons (email, SMS, Twitter, LinkedIn)
   - Esc / backdrop click closes
   ============================================================ */

const CopyIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
)

const CheckIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const XIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const MailIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
)

const MessageIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)

const TwitterIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

const LinkedInIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

export default function InviteShareModal({ userId, onClose }) {
  const [copied, setCopied] = useState(false)
  const [canNativeShare, setCanNativeShare] = useState(false)

  // Build invite link
  const inviteUrl = userId
    ? `${window.location.origin}/?ref=${userId}`
    : window.location.origin

  const shareTitle = 'Join me on Chathouse'
  const shareText =
    'Chathouse is real estate with real conversations — see what people who actually live in a building have to say. Join me:'

  /* ----- Detect Web Share API support ----- */
  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && !!navigator.share)
  }, [])

  /* ----- Esc + backdrop click to close ----- */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  function handleCopy() {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      // Fallback: select the input
      const input = document.getElementById('invite-link-input')
      if (input) {
        input.select()
        try { document.execCommand('copy') } catch (e) { /* noop */ }
      }
      return
    }
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(err => {
      console.error('[InviteShareModal] copy failed:', err)
    })
  }

  function handleNativeShare() {
    if (!navigator.share) return
    navigator.share({
      title: shareTitle,
      text: shareText,
      url: inviteUrl,
    }).catch(err => {
      // User cancelled — no need to log
      if (err.name !== 'AbortError') {
        console.error('[InviteShareModal] share failed:', err)
      }
    })
  }

  const emailUrl = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText + ' ' + inviteUrl)}`
  const smsUrl = `sms:?body=${encodeURIComponent(shareText + ' ' + inviteUrl)}`
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(inviteUrl)}`
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(inviteUrl)}`

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div style={styles.backdrop} onClick={handleBackdropClick}>
      <div style={styles.modal} role="dialog" aria-modal="true" aria-labelledby="invite-modal-title">
        <button onClick={onClose} style={styles.closeBtn} aria-label="Close">
          <XIcon size={18}/>
        </button>

        <h2 id="invite-modal-title" style={styles.title}>Invite friends to Chathouse</h2>
        <p style={styles.subtitle}>
          Share your invite link with friends, neighbors, or anyone curious about a building.
        </p>

        {/* Invite link with copy button */}
        <div style={styles.linkRow}>
          <input
            id="invite-link-input"
            type="text"
            readOnly
            value={inviteUrl}
            style={styles.linkInput}
            onClick={e => e.target.select()}
          />
          <button onClick={handleCopy} style={{ ...styles.copyBtn, ...(copied ? styles.copyBtnCopied : {}) }}>
            {copied ? (
              <>
                <CheckIcon size={14}/>
                <span>Copied</span>
              </>
            ) : (
              <>
                <CopyIcon size={14}/>
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Native share (mobile) */}
        {canNativeShare && (
          <button onClick={handleNativeShare} style={styles.nativeShareBtn}>
            Share via...
          </button>
        )}

        {/* Channel grid */}
        <div style={styles.channelsLabel}>Or share via:</div>
        <div style={styles.channelGrid}>
          <a href={emailUrl} style={styles.channelBtn}>
            <div style={styles.channelIcon}><MailIcon size={20}/></div>
            <span style={styles.channelLabel}>Email</span>
          </a>
          <a href={smsUrl} style={styles.channelBtn}>
            <div style={styles.channelIcon}><MessageIcon size={20}/></div>
            <span style={styles.channelLabel}>Text</span>
          </a>
          <a href={twitterUrl} target="_blank" rel="noopener noreferrer" style={styles.channelBtn}>
            <div style={styles.channelIcon}><TwitterIcon size={18}/></div>
            <span style={styles.channelLabel}>X</span>
          </a>
          <a href={linkedInUrl} target="_blank" rel="noopener noreferrer" style={styles.channelBtn}>
            <div style={styles.channelIcon}><LinkedInIcon size={18}/></div>
            <span style={styles.channelLabel}>LinkedIn</span>
          </a>
        </div>
      </div>
    </div>
  )
}

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 16,
    animation: 'chathouseFadeIn 150ms ease-out',
  },
  modal: {
    background: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 440,
    padding: '28px 24px 24px',
    position: 'relative',
    boxShadow: '0 24px 60px rgba(15, 23, 42, 0.2), 0 4px 16px rgba(15, 23, 42, 0.1)',
    animation: 'chathouseModalIn 200ms ease-out',
  },
  closeBtn: {
    position: 'absolute',
    top: 16, right: 16,
    width: 32, height: 32,
    borderRadius: 8,
    background: '#f1f5f9',
    border: 'none',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#64748b',
    transition: 'background 120ms ease',
  },
  title: {
    fontSize: 20,
    fontWeight: 800,
    color: '#0f172a',
    margin: '0 0 8px',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 1.5,
    margin: '0 0 20px',
  },

  linkRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 16,
  },
  linkInput: {
    flex: 1,
    padding: '10px 12px',
    borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0',
    borderRadius: 8,
    fontSize: 13,
    fontFamily: 'monospace',
    color: '#0f172a',
    background: '#f8fafc',
    outline: 'none',
    minWidth: 0,
  },
  copyBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '0 14px',
    background: '#1a6cf5',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
    transition: 'background 120ms ease',
  },
  copyBtnCopied: {
    background: '#15803d',
  },

  nativeShareBtn: {
    width: '100%',
    padding: '12px',
    background: '#0f172a',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
    marginBottom: 16,
  },

  channelsLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: '#94a3b8',
    marginBottom: 10,
  },
  channelGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 8,
  },
  channelBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    padding: '14px 8px',
    borderRadius: 10,
    background: '#f8fafc',
    borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0',
    color: '#475569',
    textDecoration: 'none',
    transition: 'background 120ms ease, transform 120ms ease',
    cursor: 'pointer',
  },
  channelIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#1a6cf5',
  },
  channelLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: '#475569',
  },
}