// Same mark as the main site's favicon
export default function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className="logo">
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1a56db" />
          <stop offset="1" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#logo-g)" />
      <g fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11.5 30 L20 10.5 L28.5 30" strokeWidth="3.4" />
        <path d="M11 23.5c3-2.4 6-2.4 9 0s6 2.4 9 0" strokeWidth="2.4" />
        <path d="M31 7.6v6.8M28.05 9.3l5.9 3.4M28.05 12.7l5.9-3.4" strokeWidth="1.5" opacity="0.9" />
      </g>
    </svg>
  )
}
