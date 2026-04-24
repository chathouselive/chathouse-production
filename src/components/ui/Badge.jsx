// src/components/ui/Badge.jsx
// Usage:
//   <Badge>Default</Badge>
//   <Badge tone="success">Verified</Badge>
//   <Badge tone="danger">High risk</Badge>
//   <Badge tone="warning" size="sm">2 risks</Badge>
//   <Badge tone="brand" variant="solid">Featured</Badge>

import { colors, radius, font, space } from '../../styles/tokens'

const TONES = {
  // soft (tinted bg) - default
  neutral:  { bg: colors.slate100,  color: colors.slate700 },
  brand:    { bg: colors.brandLight, color: colors.brand },
  accent:   { bg: colors.accentLight, color: colors.accent },
  success:  { bg: colors.successBg, color: colors.successText },
  warning:  { bg: colors.warningBg, color: colors.warningText },
  danger:   { bg: colors.dangerBg,  color: colors.dangerText },
  info:     { bg: colors.infoBg,    color: colors.infoText },
}

const SOLID_TONES = {
  neutral:  { bg: colors.slate700,  color: colors.white },
  brand:    { bg: colors.brand,     color: colors.white },
  accent:   { bg: colors.accent,    color: colors.white },
  success:  { bg: colors.success,   color: colors.white },
  warning:  { bg: colors.warning,   color: colors.white },
  danger:   { bg: colors.danger,    color: colors.white },
  info:     { bg: colors.info,      color: colors.white },
}

const SIZES = {
  xs: { padding: '2px 6px',  fontSize: font.size.xs },
  sm: { padding: '3px 10px', fontSize: font.size.xs },
  md: { padding: '4px 12px', fontSize: font.size.sm },
}

export default function Badge({
  children,
  tone = 'neutral',
  variant = 'soft',  // 'soft' | 'solid'
  size = 'sm',
  leftIcon,
  style,
  ...rest
}) {
  const palette = variant === 'solid' ? SOLID_TONES[tone] : TONES[tone]
  const s = SIZES[size] || SIZES.sm

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: space[1],
        padding: s.padding,
        fontSize: s.fontSize,
        fontWeight: font.weight.semibold,
        fontFamily: font.family.sans,
        color: palette.color,
        background: palette.bg,
        borderRadius: radius.pill,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      {leftIcon}
      {children}
    </span>
  )
}
