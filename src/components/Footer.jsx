import { Link } from 'react-router-dom'
import Logo from './Logo'
import { business } from '../content'
import { OPENS_TEXT, CLOSES_TEXT } from '../utils/hours'

export default function Footer() {
  return (
    <footer style={{ background: 'var(--navy)', padding: '60px 0 0' }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 2fr',
          gap: 40, paddingBottom: 40,
          borderBottom: '1px solid rgba(255,255,255,0.08)'
        }}>
          {/* Brand */}
          <div>
            <div style={{ marginBottom: 16 }}>
              <Logo dark size={40} />
            </div>
            <p style={{ fontSize: 14, color: 'var(--gray-400)', lineHeight: 1.7 }}>
              From installation to repair, we keep your AC running perfectly. Serving Chandkheda, Motera & across Ahmedabad.
            </p>
          </div>

          {/* Links */}
          <div>
            <h5 style={{
              fontFamily: 'var(--font-display)', fontSize: 13,
              fontWeight: 700, color: 'var(--white)',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              marginBottom: 16
            }}>Pages</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[['/', 'Home'], ['/services', 'Services'], ['/blog', 'Blog'], ['/contact', 'Contact']].map(([path, label]) => (
                <Link key={path} to={path} style={{
                  fontSize: 14, color: 'var(--gray-400)',
                  transition: 'color 0.2s'
                }}>{label}</Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h5 style={{
              fontFamily: 'var(--font-display)', fontSize: 13,
              fontWeight: 700, color: 'var(--white)',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              marginBottom: 16
            }}>Contact</h5>
            <p style={{ fontSize: 14, color: 'var(--gray-400)', lineHeight: 1.7, marginBottom: 8 }}>
              {business.street}<br />
              {business.locality}, {business.city} {business.postalCode}
            </p>
            <p style={{ fontSize: 14, color: 'var(--gray-400)' }}>Open daily · {OPENS_TEXT} – {CLOSES_TEXT}</p>
          </div>
        </div>

        <div style={{ padding: '20px 0', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--gray-600)' }}>
            © {new Date().getFullYear()} Aditya Air Conditioning & Refrigeration Services. All rights reserved.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          footer > div > div:first-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  )
}