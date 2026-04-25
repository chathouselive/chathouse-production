// src/components/ui/GoogleButton.jsx
// "Continue with Google" button with the official Google G logo.
// Follows Google's brand guidelines: white background, colored G, neutral label.
//
// Usage:
//   <GoogleButton onClick={handleGoogle} loading={loading} />
//   <GoogleButton label="Sign up with Google" />

import { colors, radius, font, space, transition } from '../../styles/tokens'

export default function GoogleButton({
  onClick,
  loading = false,
  disabled = false,
  label = 'Continue with Google',
  style,
  ...rest
}) {
  const isDisabled = disabled || loading

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: space[3],
        width: '100%',
        height: 44,
        padding: '0 18px',
        background: colors.white,
        color: colors.navy,
        border: `1px solid ${colors.slate200}`,
        borderRadius: radius.md,
        fontFamily: font.family.sans,
        fontSize: font.size.md,
        fontWeight: font.weight.semibold,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.6 : 1,
        transition: transition.base,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) e.currentTarget.style.background = colors.slate50
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) e.currentTarget.style.background = colors.white
      }}
      {...rest}
    >
      {loading ? <SmallSpinner /> : <GoogleGLogo />}
      {loading ? 'Redirecting...' : label}
    </button>
  )
}

// Official Google "G" multicolor logo
function GoogleGLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"
      />
    </svg>
  )
}

function SmallSpinner() {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 16,
        height: 16,
        border: `2px solid ${colors.slate300}`,
        borderTopColor: colors.brand,
        borderRadius: '50%',
        animation: 'chathouse-spin 0.7s linear infinite',
      }}
    />
  )
}