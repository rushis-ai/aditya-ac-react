import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, ChevronDown, MapPin } from 'lucide-react'
import Seo from '../components/Seo'
import { Stars } from '../components/Icons'
import { hubBookUrl } from '../content'
import { breadcrumbSchema, faqSchema, localBusinessSchema, serviceSchema } from '../content/schema'
import { RATING, REVIEW_COUNT, REVIEWS_URL } from '../config/business'
import { reviews } from '../config/reviews'
import { track } from '../utils/analytics'

// Service hub page (/ac-installation etc.). Content lives in content/hubs/<slug>.json.
// One action only: every button goes to the booking page with this service preselected,
// so the booking page shows a matching headline and skips straight to the contact step.
export default function Hub({ hub }) {
  const book = hubBookUrl(hub)
  const heroRef = useRef(null)
  const [showSticky, setShowSticky] = useState(false)

  // Phone sticky bar appears once the hero button has scrolled out of view
  useEffect(() => {
    const el = heroRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setShowSticky(!e.isIntersecting), { threshold: 0 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const cta = (place, className = 'btn-primary') => (
    <Link to={book} className={className} onClick={() => track('click_book', { page: hub.slug, place })}>
      {hub.cta} <ArrowRight size={18} aria-hidden="true" />
    </Link>
  )

  return (
    <div className="hub">
      <Seo
        title={hub.title}
        description={hub.description}
        jsonLd={[
          localBusinessSchema(),
          serviceSchema(hub),
          faqSchema(hub.faq),
          breadcrumbSchema([['Home', '/'], ['Services', '/services'], [hub.navLabel, `/${hub.slug}`]]),
        ]}
      />

      {/* Hero + quick answer card */}
      <section className="hub-hero">
        <div className="container hub-hero-inner">
          <div>
            <nav className="hub-crumbs" aria-label="Breadcrumb">
              <Link to="/">Home</Link> <span aria-hidden="true">›</span> <Link to="/services">Services</Link>{' '}
              <span aria-hidden="true">›</span> <span aria-current="page">{hub.navLabel}</span>
            </nav>
            <span className="hub-eyebrow">{hub.eyebrow}</span>
            <h1>{hub.h1}</h1>
            <p className="hub-sub">{hub.sub}</p>
            <div className="hub-hero-actions" ref={heroRef}>
              {cta('hero')}
              <a className="hub-rating" href={REVIEWS_URL} target="_blank" rel="noopener noreferrer">
                <Stars size={15} /> <strong>{RATING}</strong> · {REVIEW_COUNT} Google reviews
              </a>
            </div>
          </div>
          <aside className="hub-facts" aria-label="At a glance">
            <h2>At a glance</h2>
            <dl>
              {hub.facts.map(([k, v]) => (
                <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
            <p>Indicative prices. Confirmed before any work starts.</p>
          </aside>
        </div>
      </section>

      {/* Prices */}
      <section className="section hub-prices" id="prices">
        <div className="container hub-narrow">
          <h2 className="hub-h2">{hub.navLabel} charges in Ahmedabad</h2>
          <p className="hub-lead">{hub.priceIntro}</p>
          <div className="hub-table-wrap">
            <table className="hub-table">
              <thead><tr><th scope="col">Job</th><th scope="col">Typical price</th></tr></thead>
              {hub.prices.map((g) => (
                <tbody key={g.group}>
                  <tr className="hub-table-group"><th colSpan={2} scope="colgroup">{g.group}</th></tr>
                  {g.rows.map(([job, price]) => (
                    <tr key={job}><td>{job}</td><td>{price}</td></tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
          <p className="hub-disclaimer">{hub.priceNote}</p>
          <div className="hub-inline-cta">{cta('prices')}</div>
        </div>
      </section>

      {/* What's included */}
      <section className="section hub-includes">
        <div className="container hub-narrow">
          <h2 className="hub-h2">{hub.includesTitle}</h2>
          <ul className="hub-checks">
            {hub.includes.map((t) => (
              <li key={t}><Check size={18} aria-hidden="true" /> {t}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Job types */}
      <section className="section hub-jobs">
        <div className="container hub-narrow">
          <h2 className="hub-h2">Installation, removal and moving</h2>
          <div className="hub-job-grid">
            {hub.jobs.map((j) => (
              <article key={j.title} className="hub-job">
                <h3>{j.title}</h3>
                <p>{j.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section hub-steps-section">
        <div className="container hub-narrow">
          <h2 className="hub-h2">How it works</h2>
          <ol className="hub-steps">
            {hub.steps.map(([t, d], i) => (
              <li key={t}><span className="hub-step-no">{i + 1}</span><h3>{t}</h3><p>{d}</p></li>
            ))}
          </ol>
        </div>
      </section>

      {/* Areas */}
      <section className="section hub-areas">
        <div className="container hub-narrow">
          <h2 className="hub-h2">{hub.areasTitle}</h2>
          <p className="hub-lead">{hub.areasText}</p>
          <ul className="hub-area-list">
            {hub.areas.map((a) => <li key={a}><MapPin size={14} aria-hidden="true" /> {a}</li>)}
          </ul>
          <p className="hub-muted">{hub.areasMore}</p>
        </div>
      </section>

      {/* Reviews */}
      <section className="section hub-reviews-section">
        <div className="container hub-narrow">
          <h2 className="hub-h2">What customers say</h2>
          <ul className="hub-reviews">
            {reviews.map((r) => (
              <li key={r.name}>
                <Stars size={14} />
                <p>“{r.text}”</p>
                <span>{r.name}{r.area ? `, ${r.area}` : ''}</span>
              </li>
            ))}
          </ul>
          <a className="hub-link" href={REVIEWS_URL} target="_blank" rel="noopener noreferrer">Read all reviews on Google</a>
        </div>
      </section>

      {/* FAQ */}
      <section className="section hub-faq-section">
        <div className="container hub-narrow">
          <h2 className="hub-h2">Frequently asked questions</h2>
          <div className="hub-faq">
            {hub.faq.map(({ q, a }) => (
              <details key={q}>
                <summary>{q}<ChevronDown size={18} aria-hidden="true" /></summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Related guides */}
      {hub.related?.length > 0 && (
        <section className="section hub-related">
          <div className="container hub-narrow">
            <h2 className="hub-h2">Helpful guides</h2>
            <ul>
              {hub.related.map(([to, label]) => (
                <li key={to}><Link to={to}>{label} <ArrowRight size={16} aria-hidden="true" /></Link></li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="hub-final">
        <div className="container">
          <h2>{hub.finalTitle}</h2>
          <p>{hub.finalText}</p>
          {cta('final')}
        </div>
      </section>

      {/* Phone sticky bar */}
      <div className={`hub-sticky${showSticky ? ' is-visible' : ''}`} aria-hidden={!showSticky} inert={!showSticky}>
        <span><strong>{hub.navLabel}</strong> from {hub.facts[0][1].split(' ')[0]}</span>
        {cta('sticky')}
      </div>
    </div>
  )
}
