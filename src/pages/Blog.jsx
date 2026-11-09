import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import CTABanner from '../components/CTABanner'
import { getPosts, pages, formatDate } from '../content'
import { breadcrumbSchema } from '../content/schema'

export default function Blog() {
  const posts = getPosts()
  const page = pages.blog

  return (
    <div style={{ paddingTop: 64 }}>
      <Seo
        title={page.title}
        description={page.description}
        image={page.ogImage}
        jsonLd={[breadcrumbSchema([['Home', '/'], ['Blog', '/blog']])]}
      />

      <section style={{ background: 'var(--navy)', padding: '80px 24px 64px', textAlign: 'center' }}>
        <span className="section-tag" style={{ color: 'var(--accent)' }}>Blog</span>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(34px, 5vw, 54px)',
          fontWeight: 700, color: 'var(--white)', marginBottom: 14,
        }}>{page.heading}</h1>
        <p style={{ fontSize: 17, color: 'var(--gray-400)', maxWidth: 560, margin: '0 auto' }}>{page.intro}</p>
      </section>

      <section style={{ padding: '64px 0 80px', background: 'var(--gray-50)' }}>
        <div className="container">
          {posts.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--gray-600)' }}>New articles are on the way.</p>
          ) : (
            <div className="blog-grid">
              {posts.map((p) => (
                <article key={p.slug} className="blog-card">
                  <Link to={`/blog/${p.slug}`} className="blog-card-link">
                    {p.cover && (
                      <img src={p.cover} alt={p.coverAlt || ''} loading="lazy" width="1200" height="630" className="blog-card-img" />
                    )}
                    <div style={{ padding: 24 }}>
                      {p.tags[0] && <span className="blog-tag">{p.tags[0]}</span>}
                      <h2 className="blog-card-title">{p.title}</h2>
                      <p style={{ fontSize: 15, color: 'var(--gray-600)', lineHeight: 1.6, marginBottom: 16 }}>{p.description}</p>
                      <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>
                        <time dateTime={p.date}>{formatDate(p.date)}</time> · {p.readingMinutes} min read
                      </p>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <CTABanner />
    </div>
  )
}
