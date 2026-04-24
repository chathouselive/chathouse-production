// src/components/ui/SectionLabel.jsx
// Usage:
//   <SectionLabel>How it works</SectionLabel>
//   <SectionLabel tone="brand">Community reviews</SectionLabel>

import { colors, font } from '../../styles/tokens'

const TONES = {
  accent: colors.accent,
  brand: colors.brand,
  success: colors.success,
  slate: colors.slate500,
}

export default function SectionLabel({ children, tone = 'accent', style, ...rest }) {
  return (
    <div
      style={{
        fontSize: font.size.xs,
        fontWeight: font.weight.bold,
        textTransform: 'uppercase',
        letterSpacing: font.letterSpacing.widest,
        color: TONES[tone] || TONES.accent,
        fontFamily: font.family.sans,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  )
}
