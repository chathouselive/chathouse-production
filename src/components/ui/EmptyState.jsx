// src/components/ui/EmptyState.jsx
// Usage:
//   <EmptyState
//     icon={<MessageSquare size={32}/>}
//     title="No comments yet"
//     description="Be the first to share what you know about this home."
//     action={<Button>Add review</Button>}
//   />

import { colors, radius, font, space } from '../../styles/tokens'

export default function EmptyState({
  icon,
  title,
  description,
  action,
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
        padding: compact ? space[8] : space[16],
        background: colors.slate50,
        border: `1px dashed ${colors.slate200}`,
        borderRadius: radius['2xl'],
        gap: space[3],
        ...style,
      }}
    >
      {icon && (
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: radius.xl,
            background: colors.white,
            border: `1px solid ${colors.border}`,
            color: colors.slate400,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: space[1],
          }}
        >
          {icon}
        </div>
      )}
      <h3 style={titleStyle}>{title}</h3>
      {description && <p style={descriptionStyle}>{description}</p>}
      {action && <div style={{ marginTop: space[3] }}>{action}</div>}
    </div>
  )
}

const titleStyle = {
  fontSize: font.size.lg,
  fontWeight: font.weight.bold,
  color: colors.navy,
  margin: 0,
  fontFamily: font.family.sans,
}

const descriptionStyle = {
  fontSize: font.size.base,
  color: colors.slate500,
  margin: 0,
  fontFamily: font.family.sans,
  lineHeight: font.lineHeight.normal,
  maxWidth: 420,
}
