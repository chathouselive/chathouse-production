// src/components/ui/ErrorState.jsx
// Usage:
//   <ErrorState
//     title="Couldn't load listings"
//     description="Check your connection and try again."
//     onRetry={() => refetch()}
//   />

import { AlertCircle } from 'lucide-react'
import { colors, radius, font, space } from '../../styles/tokens'
import Button from './Button'

export default function ErrorState({
  title = 'Something went wrong',
  description,
  onRetry,
  style,
  compact = false,
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: compact ? space[8] : space[12],
        background: colors.dangerBg,
        border: `1px solid ${colors.danger}22`,
        borderRadius: radius['2xl'],
        gap: space[3],
        ...style,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: radius.xl,
          background: colors.white,
          color: colors.danger,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AlertCircle size={24} />
      </div>
      <h3 style={{ fontSize: font.size.lg, fontWeight: font.weight.bold, color: colors.dangerText, margin: 0, fontFamily: font.family.sans }}>
        {title}
      </h3>
      {description && (
        <p style={{ fontSize: font.size.base, color: colors.slate700, margin: 0, fontFamily: font.family.sans, lineHeight: font.lineHeight.normal, maxWidth: 420 }}>
          {description}
        </p>
      )}
      {onRetry && (
        <div style={{ marginTop: space[2] }}>
          <Button variant="secondary" size="sm" onClick={onRetry}>Try again</Button>
        </div>
      )}
    </div>
  )
}
