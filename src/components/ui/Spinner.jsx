// src/components/ui/Spinner.jsx
// Usage:
//   <Spinner />                 // default 20px, brand color
//   <Spinner size={32} />       // larger
//   <Spinner label="Loading listings..." />   // with label, centered block
//
// NOTE: Animation requires the keyframes in GlobalStyles.jsx to be mounted at the app root.

import { colors, font, space } from '../../styles/tokens'

export default function Spinner({ size = 20, color, label, style }) {
  const spinnerColor = color || colors.brand

  const spinner = (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        border: `${Math.max(2, Math.round(size / 10))}px solid ${spinnerColor}33`,
        borderTopColor: spinnerColor,
        borderRadius: '50%',
        animation: 'chathouse-spin 0.7s linear infinite',
        ...style,
      }}
      aria-label={label || 'Loading'}
      role="status"
    />
  )

  if (!label) return spinner

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: space[3], padding: space[8] }}>
      {spinner}
      <span style={{ fontSize: font.size.sm, color: colors.slate500, fontFamily: font.family.sans, fontWeight: font.weight.medium }}>
        {label}
      </span>
    </div>
  )
}
