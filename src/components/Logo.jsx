import { useId } from 'react'

// Brand mark: an "A" whose crossbar is a wave of cool air, with a frost sparkle.
// Same artwork as public/favicon.svg — keep the two in sync.
export function LogoMark({ size = 40 }) {
  const id = useId()
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false" style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1a56db" />
          <stop offset="1" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill={`url(#${id})`} />
      <g fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11.5 30 L20 10.5 L28.5 30" strokeWidth="3.4" />
        <path d="M11 23.5c3-2.4 6-2.4 9 0s6 2.4 9 0" strokeWidth="2.4" />
        <path d="M31 7.6v6.8M28.05 9.3l5.9 3.4M28.05 12.7l5.9-3.4" strokeWidth="1.5" opacity="0.9" />
      </g>
    </svg>
  )
}

// Full logo: mark + two-line wordmark. `dark` = for navy backgrounds.
export default function Logo({ dark = false, size = 40 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <LogoMark size={size} />
      <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: size * 0.5, letterSpacing: '-0.01em',
          color: dark ? 'var(--white)' : 'var(--navy)'
        }}>Aditya</span>
        <span style={{
          fontFamily: 'var(--font-body)', fontWeight: 500,
          fontSize: Math.max(9, size * 0.235), letterSpacing: '0.16em',
          textTransform: 'uppercase', marginTop: 4,
          color: dark ? 'var(--accent)' : 'var(--blue)'
        }}>AC &amp; Refrigeration</span>
      </span>
    </span>
  )
}
