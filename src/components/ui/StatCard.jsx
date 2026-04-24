// src/components/ui/StatCard.jsx
// Dashboard stat card — white bg, tinted icon square, value, label, optional delta/trend.
//
// Usage:
//   <StatCard
//     icon={<Home size={20}/>}
//     accent="brand"
//     label="Active listings"
//     value="42"
//     delta="+3 this week"
//     trend="up"
//   />

import { colors, radius, font, space } from '../../styles/tokens'

const ACCENTS = {
  brand:   { color: colors.brand,   bg: colors.brandLight },
  accent:  { color: colors.accent,  bg: colors.accentLight },
  success: { color: colors.success, bg: colors.successBg },
  warning: { color: colors.warning, bg: colors.warningBg },
  danger:  { color: colors.danger,  bg: colors.dangerBg },
  neutral: { color: colors.slate700, bg: colors.slate100 },
}

export default function StatCard({
  icon,
  accent = 'brand',
  label,
  value,
  delta,
  trend,        // 'up' | 'down' | 'flat'
  onClick,
  style,
}) {
  const a = ACCENTS[accent] || ACCENTS.brand
  const trendColor = trend === 'up' ? colors.success : trend === 'down' ? colors.danger : colors.slate500

  return (
    <div
      onClick={onClick}
      style={{
        background: colors.white,
        border: `1px solid ${colors.border}`,
        borderRadius: radius['2xl'],
        padding: space[5],
        display: 'flex',
        flexDirection: 'column',
        gap: space[3],
        cursor: onClick ? 'pointer' : 'default',
        transition: onClick ? 'all 180ms ease' : 'none',
        ...style,
      }}
      onMouseEnter={onClick ? (e) => { e.currentTarget.style.borderColor = a.color } : undefined}
      onMouseLeave={onClick ? (e) => { e.currentTarget.style.borderColor = colors.border } : undefined}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: radius.lg,
            background: a.bg,
            color: a.color,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>
        {delta && (
          <span style={{ fontSize: font.size.xs, fontWeight: font.weight.semibold, color: trendColor }}>
            {delta}
          </span>
        )}
      </div>
      <div>
        <div style={{
          fontSize: font.size['4xl'],
          fontWeight: font.weight.bold,
          color: colors.navy,
          lineHeight: 1,
          marginBottom: space[1],
          fontFamily: font.family.sans,
          letterSpacing: -0.5,
        }}>
          {value}
        </div>
        <div style={{
          fontSize: font.size.sm,
          color: colors.slate500,
          fontWeight: font.weight.medium,
          fontFamily: font.family.sans,
        }}>
          {label}
        </div>
      </div>
    </div>
  )
}
