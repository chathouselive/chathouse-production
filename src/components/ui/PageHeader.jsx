// src/components/ui/PageHeader.jsx
// Standard page header for dashboards and detail pages.
//
// Usage:
//   <PageHeader
//     title="My listings"
//     subtitle="Manage your 12 active properties"
//     eyebrow="Agent dashboard"
//     actions={<Button>+ New listing</Button>}
//   />

import { colors, font, space } from '../../styles/tokens'
import SectionLabel from './SectionLabel'

export default function PageHeader({
  title,
  subtitle,
  eyebrow,
  actions,
  style,
  ...rest
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: space[4],
        marginBottom: space[8],
        ...style,
      }}
      {...rest}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: space[2] }}>
        {eyebrow && <SectionLabel>{eyebrow}</SectionLabel>}
        <h1 style={titleStyle}>{title}</h1>
        {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: space[2] }}>{actions}</div>}
    </div>
  )
}

const titleStyle = {
  fontSize: font.size['4xl'],
  fontWeight: font.weight.bold,
  color: colors.navy,
  lineHeight: font.lineHeight.tight,
  letterSpacing: font.letterSpacing.tight,
  margin: 0,
  fontFamily: font.family.sans,
}

const subtitleStyle = {
  fontSize: font.size.md,
  color: colors.slate500,
  lineHeight: font.lineHeight.normal,
  margin: 0,
  fontFamily: font.family.sans,
}
