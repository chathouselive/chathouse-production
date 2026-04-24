// src/components/ui/Card.jsx
// Usage:
//   <Card>Plain card</Card>
//   <Card interactive>Hover card (for clickable listing cards)</Card>
//   <Card padding="lg">Larger padding</Card>

import { colors, radius, shadow, space, transition } from '../../styles/tokens'

const PADDING = {
  none: 0,
  sm: space[3],
  md: space[5],
  lg: space[6],
  xl: space[8],
}

export default function Card({
  children,
  padding = 'md',
  interactive = false,
  bordered = true,
  elevated = false,
  style,
  ...rest
}) {
  const baseStyle = {
    background: colors.white,
    border: bordered ? `1px solid ${colors.border}` : 'none',
    borderRadius: radius['2xl'],
    padding: PADDING[padding],
    boxShadow: elevated ? shadow.md : 'none',
    transition: interactive ? transition.base : 'none',
    cursor: interactive ? 'pointer' : 'default',
    ...style,
  }

  // Interactive hover handled via onMouseEnter/Leave inline to avoid CSS
  const handlers = interactive
    ? {
        onMouseEnter: (e) => {
          e.currentTarget.style.borderColor = colors.brand
          e.currentTarget.style.boxShadow = shadow.lg
          e.currentTarget.style.transform = 'translateY(-2px)'
        },
        onMouseLeave: (e) => {
          e.currentTarget.style.borderColor = colors.border
          e.currentTarget.style.boxShadow = elevated ? shadow.md : 'none'
          e.currentTarget.style.transform = 'translateY(0)'
        },
      }
    : {}

  return (
    <div style={baseStyle} {...handlers} {...rest}>
      {children}
    </div>
  )
}
