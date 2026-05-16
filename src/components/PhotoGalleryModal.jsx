import { useState, useEffect, useRef, useCallback } from 'react'

/* ============================================================
   PhotoGalleryModal
   --------------------------------------------------------------
   A modal that displays a photo gallery for a listing.

   Props:
     photos    — array of { id, display_order, storage_url, ... }
                 Already filtered for compliance (caller is responsible)
     onClose   — function called when user closes the modal
     startIndex — optional initial photo index (default 0)

   Behavior:
     - Click backdrop or X button → close
     - Esc key → close
     - ← / → arrow keys → navigate
     - Click thumbnail → jump to that photo
     - Auto-scrolls thumbnail strip to keep active in view
     - Preloads next/prev photos for smooth nav

   Matches Chathouse's boxed modal aesthetic (rounded corners,
   white background, soft shadow) rather than full-screen black.
   ============================================================ */
export default function PhotoGalleryModal({ photos, onClose, startIndex = 0 }) {
  const [index, setIndex] = useState(
    Math.min(Math.max(0, startIndex), Math.max(0, photos.length - 1))
  )
  const thumbStripRef = useRef(null)
  const activeThumbRef = useRef(null)

  const goPrev = useCallback(() => {
    setIndex((i) => (i === 0 ? photos.length - 1 : i - 1))
  }, [photos.length])

  const goNext = useCallback(() => {
    setIndex((i) => (i === photos.length - 1 ? 0 : i + 1))
  }, [photos.length])

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, goPrev, goNext])

  // Lock body scroll while modal is open
  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [])

  // Auto-scroll thumbnail strip to keep the active one in view
  useEffect(() => {
    if (activeThumbRef.current && thumbStripRef.current) {
      activeThumbRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }
  }, [index])

  // Preload adjacent photos
  useEffect(() => {
    if (photos.length <= 1) return
    const nextIdx = index === photos.length - 1 ? 0 : index + 1
    const prevIdx = index === 0 ? photos.length - 1 : index - 1
    ;[nextIdx, prevIdx].forEach((i) => {
      const url = photos[i]?.storage_url
      if (url) {
        const img = new Image()
        img.src = url
      }
    })
  }, [index, photos])

  if (!photos || photos.length === 0) return null

  const activePhoto = photos[index]

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header bar with counter + close button */}
        <div style={styles.header}>
          <div style={styles.counter}>
            {index + 1} <span style={styles.counterSep}>of</span> {photos.length}
          </div>
          <button onClick={onClose} style={styles.closeBtn} aria-label="Close gallery">
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Main photo area */}
        <div style={styles.photoArea}>
          {photos.length > 1 && (
            <button onClick={goPrev} style={{ ...styles.navBtn, ...styles.navBtnLeft }} aria-label="Previous photo">
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
          )}

          <img
            key={activePhoto.id}
            src={activePhoto.storage_url}
            alt={`Photo ${index + 1} of ${photos.length}`}
            style={styles.photo}
          />

          {photos.length > 1 && (
            <button onClick={goNext} style={{ ...styles.navBtn, ...styles.navBtnRight }} aria-label="Next photo">
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          )}
        </div>

        {/* Thumbnail strip */}
        {photos.length > 1 && (
          <div ref={thumbStripRef} style={styles.thumbStrip}>
            {photos.map((p, i) => (
              <button
                key={p.id}
                ref={i === index ? activeThumbRef : null}
                onClick={() => setIndex(i)}
                style={{
                  ...styles.thumb,
                  ...(i === index ? styles.thumbActive : {}),
                }}
                aria-label={`Go to photo ${i + 1}`}
              >
                <img src={p.storage_url} alt="" style={styles.thumbImg} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(15, 23, 42, 0.75)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 2000, padding: 20,
    backdropFilter: 'blur(4px)',
  },
  modal: {
    background: '#fff',
    borderRadius: 16,
    maxWidth: 1100, width: '100%',
    maxHeight: '92vh',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 20px',
    borderBottom: '1px solid #e2e8f0',
    flexShrink: 0,
  },
  counter: {
    fontFamily: 'var(--serif)',
    fontSize: 15, fontWeight: 700,
    color: '#0f172a',
  },
  counterSep: { color: '#94a3b8', fontWeight: 500 },
  closeBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 36, height: 36,
    background: '#f1f5f9',
    border: 'none', borderRadius: 10,
    color: '#475569', cursor: 'pointer',
    transition: 'background 120ms ease',
  },
  photoArea: {
    position: 'relative',
    flex: 1, minHeight: 0,
    background: '#0f172a',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  photo: {
    maxWidth: '100%', maxHeight: '100%',
    width: 'auto', height: 'auto',
    objectFit: 'contain',
    display: 'block',
  },
  navBtn: {
    position: 'absolute', top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 44, height: 44,
    background: 'rgba(255, 255, 255, 0.9)',
    border: 'none', borderRadius: '50%',
    color: '#0f172a', cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    transition: 'background 120ms ease, transform 120ms ease',
  },
  navBtnLeft: { left: 16 },
  navBtnRight: { right: 16 },
  thumbStrip: {
    display: 'flex', gap: 8,
    padding: '12px 16px',
    overflowX: 'auto',
    overflowY: 'hidden',
    borderTop: '1px solid #e2e8f0',
    background: '#f8fafc',
    flexShrink: 0,
    scrollbarWidth: 'thin',
  },
  thumb: {
    flexShrink: 0,
    width: 80, height: 60,
    background: 'transparent',
    border: '2px solid transparent',
    borderRadius: 8,
    padding: 0,
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'border-color 120ms ease, transform 120ms ease',
  },
  thumbActive: {
    borderColor: '#1a6cf5',
    transform: 'scale(1.05)',
  },
  thumbImg: {
    width: '100%', height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
}