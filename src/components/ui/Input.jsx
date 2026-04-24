// src/components/ui/Input.jsx
// Usage:
//   <Input label="Email" type="email" value={email} onChange={...} />
//   <Input label="Password" type="password" error="Too short" />
//   <Input label="Search" leftIcon={<Search size={16}/>} placeholder="..." />

import { colors, radius, font, space, transition } from '../../styles/tokens'

export default function Input({
  label,
  error,
  helper,
  leftIcon,
  rightIcon,
  id,
  style,
  containerStyle,
  ...rest
}) {
  const inputId = id || `input-${label?.replace(/\s/g, '-').toLowerCase()}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space[1], ...containerStyle }}>
      {label && (
        <label htmlFor={inputId} style={labelStyle}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {leftIcon && (
          <span style={{ position: 'absolute', left: 12, color: colors.slate400, display: 'inline-flex' }}>
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          style={{
            ...inputStyle,
            paddingLeft: leftIcon ? 38 : 12,
            paddingRight: rightIcon ? 38 : 12,
            borderColor: error ? colors.danger : colors.slate200,
            ...style,
          }}
          {...rest}
        />
        {rightIcon && (
          <span style={{ position: 'absolute', right: 12, color: colors.slate400, display: 'inline-flex' }}>
            {rightIcon}
          </span>
        )}
      </div>
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

const inputStyle = {
  width: '100%',
  height: 40,
  padding: '10px 12px',
  fontSize: font.size.base,
  fontFamily: font.family.sans,
  color: colors.navy,
  background: colors.white,
  border: `1px solid ${colors.slate200}`,
  borderRadius: radius.md,
  outline: 'none',
  transition: transition.fast,
  boxSizing: 'border-box',
}

const errorStyle = {
  fontSize: font.size.xs,
  color: colors.danger,
  fontFamily: font.family.sans,
  fontWeight: font.weight.medium,
}

const helperStyle = {
  fontSize: font.size.xs,
  color: colors.slate500,
  fontFamily: font.family.sans,
}
