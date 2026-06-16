import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(0,0,0,0.06)',
      boxShadow: scrolled ? 'var(--shadow)' : 'none',
      transition: 'box-shadow 0.3s'
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto', padding: '0 24px',
        height: 64, display: 'flex', alignItems: 'center', gap: 32
      }}>
        {/* Logo */}
        <Link to="/" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: 18, color: 'var(--navy)'
        }}>
          <span style={{ color: 'var(--blue)', fontSize: 20 }}>❄</span>
          Aditya AC
        </Link>

        {/* Desktop Links */}
        <ul style={{
          display: 'flex', gap: 28, marginLeft: 'auto',
          listStyle: 'none'
        }} className="desktop-nav">
          {[['/', 'Home'], ['/services', 'Services'], ['/contact', 'Contact']].map(([path, label]) => (
            <li key={path}>
              <Link to={path} style={{
                fontSize: 14, fontWeight: 500,
                color: location.pathname === path ? 'var(--blue)' : 'var(--gray-600)',
                transition: 'color 0.2s'
              }}>{label}</Link>
            </li>
          ))}
        </ul>

        {/* Call Button */}
        <a href="tel:+917617002071" className="btn-primary" style={{
          padding: '9px 20px', fontSize: 14
        }} className="desktop-nav">
          📞 Call Now
        </a>

        {/* Hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)} style={{
          display: 'none', flexDirection: 'column', gap: 5,
          background: 'none', border: 'none', cursor: 'pointer',
          marginLeft: 'auto', padding: 4
        }} className="hamburger">
          <span style={{ width: 24, height: 2, background: 'var(--navy)', borderRadius: 2, display: 'block' }} />
          <span style={{ width: 24, height: 2, background: 'var(--navy)', borderRadius: 2, display: 'block' }} />
          <span style={{ width: 24, height: 2, background: 'var(--navy)', borderRadius: 2, display: 'block' }} />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          display: 'flex', flexDirection: 'column',
          padding: '12px 24px 16px', gap: 12,
          borderTop: '1px solid var(--gray-100)',
          background: 'white'
        }}>
          {[['/', 'Home'], ['/services', 'Services'], ['/contact', 'Contact']].map(([path, label]) => (
            <Link key={path} to={path} style={{
              fontSize: 15, fontWeight: 500,
              color: location.pathname === path ? 'var(--blue)' : 'var(--gray-600)',
              padding: '6px 0'
            }}>{label}</Link>
          ))}
          <a href="tel:+917617002071" className="btn-primary" style={{ textAlign: 'center' }}>
            📞 Call Now
          </a>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: flex !important; }
        }
      `}</style>
    </nav>
  )
}