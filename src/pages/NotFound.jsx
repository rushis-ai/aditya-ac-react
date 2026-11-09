import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import { site } from '../content'

export default function NotFound() {
  return (
    <div style={{ paddingTop: 64 }}>
      <Seo title={`Page not found | ${site.titleSuffix}`} description="This page doesn't exist." noindex />
      <section style={{ padding: '120px 24px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 40, color: 'var(--navy)', marginBottom: 12 }}>Page not found</h1>
        <p style={{ color: 'var(--gray-600)', marginBottom: 28 }}>The page you're looking for has moved or doesn't exist.</p>
        <Link to="/" className="btn-primary">Back to home</Link>
      </section>
    </div>
  )
}
