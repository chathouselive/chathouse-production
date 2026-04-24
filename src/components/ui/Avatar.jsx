// src/components/ui/Avatar.jsx
// Usage:
//   <Avatar name="Maria C." />                      // initials, auto-colored
//   <Avatar name="Maria C." color="#1A6FE8" />      // initials with specific color
//   <Avatar src="/photo.jpg" name="Maria C." />     // photo with fallback
//   <Avatar size={40} />                            // custom size

import { colors, font, radius } from '../../styles/tokens'

// Deterministic color from name (so the same person always gets the same color)
const AVATAR_COLORS = [
  colors.brand,
  colors.navy,
  colors.accent,
  colors.success,
  colors.warning,
  '#9333ea',  // violet
  '#0891b2',  // cyan
  '#be185d',  // pink
]

function colorFromName(name = '') {
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

function initialsFromName(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function Avatar({
  name = '',
  src,
  size = 32,
  color,
  style,
  ...rest
}) {
  const bg = color || colorFromName(name)
  const initials = initialsFromName(name)
  const fontSize = Math.max(10, Math.round(size * 0.4))

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          borderRadius: radius.full,
          objectFit: 'cover',
          background: colors.slate100,
          ...style,
        }}
        {...rest}
      />
    )
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: radius.full,
        background: bg,
        color: colors.white,
        fontWeight: font.weight.bold,
        fontSize,
        fontFamily: font.family.sans,
        lineHeight: 1,
        flexShrink: 0,
        ...style,
      }}
      {...rest}
    >
      {initials}
    </span>
  )
}
