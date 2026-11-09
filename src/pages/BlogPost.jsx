import { Link, useParams } from 'react-router-dom'
import Seo from '../components/Seo'
import CTABanner from '../components/CTABanner'
import NotFound from './NotFound'
import { getPost, getPosts, site, formatDate } from '../content'
import { articleSchema, breadcrumbSchema, faqSchema } from '../content/schema'

export default function BlogPost() {
  const { slug } = useParams()
  const post = getPost(slug)
  if (!post) return <NotFound />

  const related = getPosts().filter((p) => p.slug !== post.slug).slice(0, 3)
  const title = post.seoTitle || `${post.title} | ${site.titleSuffix}`

  return (
    <div style={{ paddingTop: 64 }}>
      <Seo
        title={title}
        description={post.description}
        image={post.cover}
        type="article"
        canonical={post.canonical || undefined}
        noindex={post.noindex}
        publishedTime={post.date}
        modifiedTime={post.updated || post.date}
        jsonLd={[
          articleSchema(post),
          breadcrumbSchema([['Home', '/'], ['Blog', '/blog'], [post.title, `/blog/${post.slug}`]]),
          faqSchema(post.faq),
        ]}
      />

      <article>
        <header style={{ background: 'var(--navy)', padding: '64px 24px 56px' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <nav aria-label="Breadcrumb" style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 20 }}>
              <Link to="/" style={{ color: 'var(--gray-400)' }}>Home</Link>
              {' / '}
              <Link to="/blog" style={{ color: 'var(--gray-400)' }}>Blog</Link>
            </nav>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 4.5vw, 46px)',
              fontWeight: 700, color: 'var(--white)', lineHeight: 1.2, marginBottom: 18,
            }}>{post.title}</h1>
            <p style={{ fontSize: 14, color: 'var(--gray-400)' }}>
              {post.author || site.blogAuthor} · <time dateTime={post.date}>{formatDate(post.date)}</time>
              {post.updated && post.updated !== post.date && <> · Updated <time dateTime={post.updated}>{formatDate(post.updated)}</time></>}
              {' · '}{post.readingMinutes} min read
            </p>
          </div>
        </header>

        <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 64px' }}>
          {post.cover && (
            <img src={post.cover} alt={post.coverAlt || ''} width="1200" height="630" className="post-cover" fetchPriority="high" />
          )}

          <div className="prose" dangerouslySetInnerHTML={{ __html: post.html }} />

          {post.faq.length > 0 && (
            <section className="post-faq" aria-labelledby="faq-heading">
              <h2 id="faq-heading">Frequently asked questions</h2>
              {post.faq.map(({ q, a }) => (
                <details key={q}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
            </section>
          )}

          {post.tags.length > 0 && (
            <p style={{ marginTop: 40, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {post.tags.map((t) => <span key={t} className="blog-tag">{t}</span>)}
            </p>
          )}
        </div>
      </article>

      {related.length > 0 && (
        <section style={{ background: 'var(--gray-50)', padding: '56px 0' }}>
          <div className="container">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--navy)', marginBottom: 24 }}>More guides</h2>
            <div className="blog-grid">
              {related.map((p) => (
                <article key={p.slug} className="blog-card">
                  <Link to={`/blog/${p.slug}`} className="blog-card-link">
                    <div style={{ padding: 24 }}>
                      <h3 className="blog-card-title">{p.title}</h3>
                      <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.6 }}>{p.description}</p>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <CTABanner />
    </div>
  )
}
