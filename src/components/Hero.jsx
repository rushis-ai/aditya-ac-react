import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import HeroVisual from './HeroVisual'
import { PHONE_TEL, RATING, REVIEW_COUNT, REVIEWS_URL } from '../config/business'
import { Phone, Star } from 'lucide-react'
import { InlineIcon } from './Icons'

export default function Hero() {
  return (
    <section className="hero">

      {/* Background shape — top right only */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', width: 500, height: 500,
          background: 'var(--blue)', borderRadius: '50%',
          opacity: 0.06, top: -150, right: -80
        }} />
      </div>

      {/* LEFT — Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="hero-content"
      >
        {/* Badge */}
        <motion.a
          href={REVIEWS_URL}
          target="_blank"
          rel="noreferrer"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(26,86,219,0.15)',
            color: 'var(--ice)',
            border: '1px solid rgba(96,165,250,0.25)',
            padding: '8px 18px',
            borderRadius: 100,
            fontSize: 13,
            fontWeight: 500,
            marginBottom: 28,
            letterSpacing: '0.02em',
            textDecoration: 'none'
          }}>
          <Star size={14} fill="#f59e0b" color="#f59e0b" aria-hidden="true" /> {RATING} on Google · {REVIEW_COUNT} Reviews
        </motion.a>

        {/* Heading */}
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(38px, 4.4vw, 60px)',
          fontWeight: 700,
          color: 'var(--white)',
          lineHeight: 1.12,
          marginBottom: 22,
          letterSpacing: '-0.01em'
        }}>
          AC Repair &amp; Service,<br />
          <span style={{
            color: 'var(--accent)',
            fontStyle: 'italic'
          }}>Same Day.</span>
        </h1>

        {/* Subtext */}
        <p className="hero-sub" style={{
          fontSize: 16,
          color: 'var(--gray-400)',
          lineHeight: 1.8,
          marginBottom: 40,
          maxWidth: 440
        }}>
          Stay cool, any season. Expert AC installation, repair & refrigeration services in Chandkheda, Ahmedabad. Fast response. All brands. Open till 11:30 PM.
        </p>

        {/* Buttons: call for urgent jobs, form for bookings (form records lead source) */}
        <div className="hero-actions" style={{
          display: 'flex', gap: 14,
          flexWrap: 'wrap', marginBottom: 52
        }}>
          <a href={`tel:${PHONE_TEL}`} className="btn-primary">
            <InlineIcon icon={Phone} size={17} /> Call Now
          </a>
          <Link to="/contact" className="btn-secondary">
            Book a Service →
          </Link>
        </div>

        {/* Stats */}
        <div className="hero-stats" style={{
          display: 'flex', alignItems: 'center', gap: 0,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 'var(--radius)',
          padding: '16px 24px',
          width: 'fit-content'
        }}>
          {[
            { num: 'All', label: 'AC Brands' },
            { num: 'Genuine', label: 'Spare Parts' },
            { num: '11:30 PM', label: 'Open Till' }
          ].map((stat, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              {i > 0 && (
                <div className="hero-stat-divider" style={{
                  width: 1, height: 36,
                  background: 'rgba(255,255,255,0.12)',
                  margin: '0 24px'
                }} />
              )}
              <div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 20, fontWeight: 700,
                  color: 'var(--white)', lineHeight: 1.2
                }}>{stat.num}</div>
                <div style={{
                  fontSize: 11, color: 'var(--gray-400)',
                  marginTop: 2, letterSpacing: '0.03em'
                }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* RIGHT — Illustration */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="hero-media"
      >
        <HeroVisual />
      </motion.div>
    </section>
  )
}
