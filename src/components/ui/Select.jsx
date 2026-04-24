// src/components/ui/Select.jsx
import { colors, radius, font, space, transition } from '../../styles/tokens'

export default function Select({
  label,
  error,
  helper,
  id,
  children,
  style,
  containerStyle,
  ...rest
}) {
  const inputId = id || `select-${label?.replace(/\s/g, '-').toLowerCase()}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space[1], ...containerStyle }}>
      {label && (
        <label htmlFor={inputId} style={labelStyle}>
          {label}
        </label>
      )}
      <select
        id={inputId}
        style={{
          ...selectStyle,
          borderColor: error ? colors.danger : colors.slate200,
          ...style,
        }}
        {...rest}
      >
        {children}
      </select>
      {error && <span style={errorStyle}>{error}</span>}
      {helper && !error && <span style={helperStyle}>{helper}</span>}
    </div>
  )
}

const labelStyle = { fontSize: font.size.sm, fontWeight: font.weight.semibold, color: colors.slate700, fontFamily: font.family.sans }
const selectStyle = {
  width: '100%',
  height: 40,
  padding: '10px 36px 10px 12px',
  fontSize: font.size.base,
  fontFamily: font.family.sans,
  color: colors.navy,
  background: colors.white,
  border: `1px solid ${colors.slate200}`,
  borderRadius: radius.md,
  outline: 'none',
  cursor: 'pointer',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  transition: transition.fast,
  boxSizing: 'border-box',
}
const errorStyle = { fontSize: font.size.xs, color: colors.danger, fontFamily: font.family.sans, fontWeight: font.weight.medium }
const helperStyle = { fontSize: font.size.xs, color: colors.slate500, fontFamily: font.family.sans }
