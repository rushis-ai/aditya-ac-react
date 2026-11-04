// Shared icon helpers. Line icons come from lucide-react; WhatsApp is a brand glyph Lucide doesn't ship.

// Icon inside a soft tinted rounded square (used on cards, trust items, badges)
export function IconTile({ icon: Icon, color = 'var(--blue)', bg, size = 52, iconSize, radius = 14, style }) {
  return (
    <span aria-hidden="true" style={{
      width: size, height: size, flexShrink: 0,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: radius,
      background: bg || `color-mix(in srgb, ${color} 12%, transparent)`,
      color,
      ...style
    }}>
      <Icon size={iconSize || Math.round(size * 0.46)} strokeWidth={2} />
    </span>
  )
}

// Inline icon sized to sit next to text in buttons and labels
export function InlineIcon({ icon: Icon, size = 18, className, style }) {
  return <Icon size={size} strokeWidth={2.2} aria-hidden="true" className={className} style={{ flexShrink: 0, ...style }} />
}

export function WhatsAppIcon({ size = 20, color = 'currentColor', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true" style={{ flexShrink: 0, ...style }}>
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.48-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.3 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.43 9.43 0 0 1-4.8-1.32l-.35-.2-3.57.93.96-3.48-.23-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.24-9.44 9.45-9.44 2.52 0 4.9.99 6.68 2.77a9.38 9.38 0 0 1 2.76 6.68c0 5.21-4.24 9.44-9.45 9.44m8.04-17.48A11.3 11.3 0 0 0 12.05.7C5.78.7.68 5.8.68 12.07c0 2 .52 3.96 1.52 5.68L.6 23.6l6-1.57a11.34 11.34 0 0 0 5.43 1.38h.01c6.27 0 11.37-5.1 11.37-11.37 0-3.04-1.18-5.9-3.33-8.03" />
    </svg>
  )
}

// Five filled stars for review cards
export function Stars({ count = 5, size = 16 }) {
  return (
    <span aria-label={`${count} out of 5 stars`} role="img" style={{ display: 'inline-flex', gap: 2, color: '#f59e0b' }}>
      {Array.from({ length: count }, (_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2.5l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.52l-5.88 3.09 1.12-6.55L2.48 9.42l6.58-.96z" />
        </svg>
      ))}
    </span>
  )
}
