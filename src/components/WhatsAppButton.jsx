export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/917617002071?text=Hi%2C%20I%20need%20AC%20service"
      target="_blank"
      rel="noreferrer"
      style={{
        position: 'fixed',
        bottom: 28,
        right: 28,
        zIndex: 200,
        width: 56,
        height: 56,
        borderRadius: '50%',
        boxShadow: '0 4px 20px rgba(37,211,102,0.4)',
        transition: 'transform 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <svg viewBox="0 0 32 32" fill="none" width="56" height="56">
        <circle cx="16" cy="16" r="16" fill="#25D366" />
        <path
          d="M22.5 9.5A9 9 0 0 0 7.1 20.1L6 26l6.1-1.6a9 9 0 0 0 10.4-14.9z"
          fill="#fff"
        />
        <path
          d="M20.3 18.6c-.3-.1-1.6-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.6-2.1-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5 0-.2 0-.4-.1-.5-.1-.1-.7-1.7-.9-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.1 3c.1.2 2 3 4.9 4.2 2.9 1.1 2.9.7 3.4.7.5 0 1.6-.7 1.9-1.3.2-.6.2-1.1.1-1.3-.1-.1-.3-.2-.6-.3z"
          fill="#25D366"
        />
      </svg>
    </a>
  );
}