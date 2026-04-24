// src/components/ui/Button.jsx
// Usage:
//   <Button>Default (primary, md)</Button>
//   <Button variant="secondary" size="sm">Secondary small</Button>
//   <Button variant="ghost" as={Link} to="/signup">Link-styled as button</Button>
//   <Button variant="danger" loading>Deleting...</Button>
//   <Button leftIcon={<Search size={16}/>} rightIcon={<ArrowRight size={16}/>}>Search</Button>

import { colors, radius, font, shadow, transition, space } from '../../styles/tokens'

const VARIANTS = {
  primary: {
    background: colors.brand,
    color: colors.white,
    border: `1px solid ${colors.brand}`,
    boxShadow: shadow.brand,
  },
  accent: {
    background: colors.accent,
    color: colors.white,
    border: `1px solid ${colors.accent}`,
    boxShadow: shadow.accent,
  },
  secondary: {
    background: colors.white,
    color: colors.navy,
    border: `1px solid ${colors.slate200}`,
    boxShadow: 'none',
  },
  ghost: {
    background: colors.slate50,
    color: colors.slate700,
    border: `1px solid ${colors.slate200}`,
    boxShadow: 'none',
  },
  subtle: {
    background: 'transparent',
    color: colors.slate700,
    border: '1px solid transparent',
    boxShadow: 'none',
  },
  danger: {
    background: colors.danger,
    color: colors.white,
    border: `1px solid ${colors.danger}`,
    boxShadow: 'none',
  },
  dangerOutline: {
    background: colors.white,
    color: colors.danger,
    border: `1px solid ${colors.danger}`,
    boxShadow: 'none',
  },
}

const SIZES = {
  sm: {
    padding: '7px 14px',
    fontSize: font.size.sm,
    borderRadius: radius.md,
    gap: space[1],
    height: 32,
  },
  md: {
    padding: '9px 18px',
    fontSize: font.size.base,
    borderRadius: radius.md,
    gap: space[2],
    height: 38,
  },
  lg: {
    padding: '12px 24px',
    fontSize: font.size.md,
    borderRadius: radius.lg,
    gap: space[2],
    height: 44,
  },
  xl: {
    padding: '14px 30px',
    fontSize: font.size.md,
    borderRadius: radius.lg,
    gap: space[2],
    height: 50,
  },
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  loading = false,
  disabled = false,
  fullWidth = false,
  as: Component = 'button',
  type = 'button',
  style,
  ...rest
}) {
  const v = VARIANTS[variant] || VARIANTS.primary
  const s = SIZES[size] || SIZES.md
  const isDisabled = disabled || loading

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s.gap,
    padding: s.padding,
    fontSize: s.fontSize,
    fontFamily: font.family.sans,
    fontWeight: font.weight.semibold,
    lineHeight: 1,
    height: s.height,
    borderRadius: s.borderRadius,
    textDecoration: 'none',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    transition: transition.base,
    opacity: isDisabled ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
    whiteSpace: 'nowrap',
    ...v,
    ...style,
  }

  const componentProps = Component === 'button'
    ? { type, disabled: isDisabled }
    : {}

  return (
    <Component {...componentProps} style={baseStyle} {...rest}>
      {loading ? <Spinner size={s.fontSize} /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </Component>
  )
}

function Spinner({ size = 14 }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        border: '2px solid currentColor',
        borderRightColor: 'transparent',
        borderRadius: '50%',
        animation: 'chathouse-spin 0.7s linear infinite',
      }}
    />
  )
}
