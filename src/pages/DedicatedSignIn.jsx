import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Shield, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { Button, Input, Badge, Avatar, GoogleButton } from '../components/ui'
import { colors, space, font, radius } from '../styles/tokens'

function ChathouseLogo({ height = 36 }) {
  return (
    <svg height={height} viewBox="0 0 480 140" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <g transform="translate(24, 16) scale(0.84)">
        <polygon points="54,0 108,46 96,46 96,108 12,108 12,46 0,46" fill="#1A6FE8"/>
        <rect x="38" y="72" width="32" height="36" rx="4" fill="white"/>
        <rect x="58" y="18" width="36" height="28" rx="7" fill="white"/>
        <polygon points="62,46 74,46 66,54" fill="white"/>
        <circle cx="67" cy="32" r="3" fill="#1A6FE8"/>
        <circle cx="76" cy="32" r="3" fill="#1A6FE8"/>
        <circle cx="85" cy="32" r="3" fill="#1A6FE8"/>
      </g>
      <text x="120" y="84" fontFamily="Inter, system-ui, sans-serif" fontSize="58" letterSpacing="-2">
        <tspan fontWeight="800" fill="#0F1F3D">chat</tspan>
        <tspan fontWeight="400" fill="#1A6FE8" letterSpacing="-2">house</tspan>
      </text>
      <text x="120" y="112" fontFamily="Inter, system-ui, sans-serif" fontWeight="500" fontSize="13" fill="#8A94A6" letterSpacing="1.5">FIND. TALK. MOVE.</text>
    </svg>
  )
}

export default function DedicatedSignIn() {
  const { signIn, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn({ email, password })
    setLoading(false)
    if (error) setError(error.message)
    else navigate('/listings')
  }

  async function handleGoogle() {
    setError('')
    setGoogleLoading(true)
    const { error } = await signInWithGoogle()
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', background: colors.white }}>

      {/* LEFT — Form */}
      <div style={{ display: 'flex', flexDirection: 'column', padding: space[8] }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: space[16] }}>
          <Link to="/" style={{ display: 'inline-block' }}>
            <ChathouseLogo height={36} />
          </Link>
          <div style={{ display: 'flex', gap: space[3], alignItems: 'center' }}>
            <span style={{ fontSize: font.size.sm, color: colors.slate500 }}>No account?</span>
            <Button as={Link} to="/signup" variant="secondary" size="sm">Sign up free</Button>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 400, width: '100%', margin: '0 auto' }}>
          <h1 style={{
            fontSize: font.size['5xl'],
            fontWeight: font.weight.bold,
            color: colors.navy,
            letterSpacing: font.letterSpacing.tight,
            lineHeight: font.lineHeight.tight,
            margin: 0,
            marginBottom: space[2],
          }}>
            Welcome back
          </h1>
          <p style={{
            fontSize: font.size.md,
            color: colors.slate500,
            lineHeight: font.lineHeight.normal,
            margin: 0,
            marginBottom: space[6],
          }}>
            Sign in to access your Chathouse account.
          </p>

          <GoogleButton onClick={handleGoogle} loading={googleLoading} disabled={loading} />

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: space[3],
            margin: `${space[6]}px 0`,
            color: colors.slate400,
            fontSize: font.size.xs,
            fontWeight: font.weight.semibold,
            textTransform: 'uppercase',
            letterSpacing: font.letterSpacing.wider,
          }}>
            <div style={{ flex: 1, height: 1, background: colors.slate200 }} />
            <span>Or with email</span>
            <div style={{ flex: 1, height: 1, background: colors.slate200 }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: space[4] }}>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@email.com"
              leftIcon={<Mail size={16} />}
              required
              autoComplete="email"
              autoFocus
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock size={16} />}
              required
              autoComplete="current-password"
              error={error || undefined}
            />
            <Button type="submit" loading={loading} disabled={googleLoading} fullWidth size="lg" style={{ marginTop: space[2] }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <p style={{
            fontSize: font.size.sm,
            color: colors.slate500,
            textAlign: 'center',
            margin: `${space[8]}px 0 0 0`,
          }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: colors.brand, fontWeight: font.weight.semibold, textDecoration: 'none' }}>
              Sign up free
            </Link>
            {' '}— it takes 30 seconds.
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: space[2],
          fontSize: font.size.xs,
          color: colors.slate400,
          marginTop: space[8],
        }}>
          <Shield size={14} />
          Free for buyers, renters, and neighbors — always will be.
        </div>
      </div>

      {/* RIGHT — Visual panel */}
      <div style={{
        background: colors.navy,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: space[12],
        color: colors.white,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(${colors.navyLine}66 1px, transparent 1px), linear-gradient(90deg, ${colors.navyLine}66 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          opacity: 0.4,
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', maxWidth: 460, margin: '0 auto', width: '100%' }}>
          <div style={{
            fontSize: font.size.xs,
            fontWeight: font.weight.bold,
            textTransform: 'uppercase',
            letterSpacing: font.letterSpacing.widest,
            color: colors.accent,
            marginBottom: space[3],
          }}>
            What you're signing into
          </div>
          <h2 style={{
            fontSize: font.size['4xl'],
            fontWeight: font.weight.bold,
            color: colors.white,
            letterSpacing: font.letterSpacing.tight,
            lineHeight: font.lineHeight.tight,
            margin: 0,
            marginBottom: space[3],
          }}>
            Honest reviews. Real risks. Before you sign.
          </h2>
          <p style={{
            fontSize: font.size.md,
            color: colors.slate400,
            lineHeight: font.lineHeight.relaxed,
            margin: 0,
            marginBottom: space[8],
          }}>
            Verified past tenants, neighbors, and buyers publicly review every listing.
          </p>

          <div style={{
            background: colors.navyDark,
            border: `1px solid ${colors.navyLine}`,
            borderRadius: radius['2xl'],
            padding: space[5],
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: space[3],
              marginBottom: space[4],
              borderBottom: `1px solid ${colors.navyLine}`,
            }}>
              <div>
                <div style={{ fontSize: font.size.base, fontWeight: font.weight.bold, color: colors.white, marginBottom: 2 }}>
                  47 Riverside Ave, Apt 2C
                </div>
                <div style={{ fontSize: font.size.xs, color: colors.slate400 }}>
                  Downtown Jersey City, NJ · 12 verified reviews
                </div>
              </div>
              <Badge tone="success" size="sm">Live</Badge>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: space[3] }}>
              <ThreadMessage name="Maria C." role="Past tenant" meta="Lived here 2022–2024 · Verified" time="3d ago"
                body="Radiators make a banging noise all winter — we complained 3 times, never fixed. Otherwise the unit is solid and the light is amazing." />
              <ThreadMessage name="David R." role="Neighbor" meta="Building resident · Verified" time="1w ago"
                body="Super is responsive. Garbage pickup in the alley can get loud on Tuesdays around 6am — FYI if you're a light sleeper." />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: space[2], marginTop: space[8] }}>
            {['Verified reviewers only', 'No paid placement', 'Free for every buyer and renter'].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: space[2], fontSize: font.size.sm, color: colors.slate300 }}>
                <CheckCircle2 size={14} color={colors.brand} />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ThreadMessage({ name, role, meta, time, body }) {
  return (
    <div style={{ background: colors.navy, border: `1px solid ${colors.navyLineSoft}`, borderRadius: radius.lg, padding: space[3] }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: space[2] }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: space[2] }}>
          <Avatar name={name} size={26} />
          <div>
            <div style={{ fontSize: font.size.xs, fontWeight: font.weight.bold, color: colors.white }}>{name} · {role}</div>
            <div style={{ fontSize: 10, color: colors.slate400 }}>{meta}</div>
          </div>
        </div>
        <div style={{ fontSize: 10, color: colors.slate400 }}>{time}</div>
      </div>
      <p style={{ fontSize: font.size.sm, color: colors.slate300, lineHeight: font.lineHeight.relaxed, margin: 0 }}>{body}</p>
    </div>
  )
}