// src/components/ui/Textarea.jsx
import { colors, radius, font, space, transition } from '../../styles/tokens'

export default function Textarea({
  label,
  error,
  helper,
  id,
  rows = 4,
  style,
  containerStyle,
  ...rest
}) {
  const inputId = id || `textarea-${label?.replace(/\s/g, '-').toLowerCase()}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space[1], ...containerStyle }}>
      {label && (
        <label htmlFor={inputId} style={labelStyle}>
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        style={{
          ...textareaStyle,
          borderColor: error ? colors.danger : colors.slate200,
          ...style,
        }}
        {...rest}
      />
      {error && <span style={errorStyle}>{error}</span>}
      {helper && !error && <span style={helperStyle}>{helper}</span>}
    </div>
  )
}

const labelStyle = {
  fontSize: font.size.sm,
  fontWeight: font.weight.semibold,
  color: colors.slate700,
  fontFamily: font.family.sans,
}

const textareaStyle = {
  width: '100%',
  padding: '10px 12px',
  fontSize: font.size.base,
  fontFamily: font.family.sans,
  color: colors.navy,
  background: colors.white,
  border: `1px solid ${colors.slate200}`,
  borderRadius: radius.md,
  outline: 'none',
  resize: 'vertical',
  transition: transition.fast,
  boxSizing: 'border-box',
  lineHeight: font.lineHeight.normal,
}

const errorStyle = { fontSize: font.size.xs, color: colors.danger, fontFamily: font.family.sans, fontWeight: font.weight.medium }
const helperStyle = { fontSize: font.size.xs, color: colors.slate500, fontFamily: font.family.sans }
