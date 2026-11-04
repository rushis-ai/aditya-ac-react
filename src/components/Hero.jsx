import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import heroImg from '../assets/wireman-dissasembling-air-conditioner.webp'
import { PHONE_TEL, RATING, REVIEW_COUNT, REVIEWS_URL } from '../config/business'

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
          ⭐ {RATING} on Google · {REVIEW_COUNT} Reviews
        </motion.a>

        {/* Heading */}
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(40px, 5vw, 66px)',
          fontWeight: 700,
          color: 'var(--white)',
          lineHeight: 1.12,
          marginBottom: 22,
          letterSpacing: '-0.01em'
        }}>
          Stay Cool,<br />
          <span style={{
            color: 'var(--accent)',
            fontStyle: 'italic'
          }}>Any Season.</span>
        </h1>

        {/* Subtext */}
        <p className="hero-sub" style={{
          fontSize: 16,
          color: 'var(--gray-400)',
          lineHeight: 1.8,
          marginBottom: 40,
          maxWidth: 440
        }}>
          Expert AC installation, repair & refrigeration services in Chandkheda, Ahmedabad. Fast response. All brands. Open till 11:30 PM.
        </p>

        {/* Buttons: call for urgent jobs, form for bookings (form records lead source) */}
        <div className="hero-actions" style={{
          display: 'flex', gap: 14,
          flexWrap: 'wrap', marginBottom: 52
        }}>
          <a href={`tel:${PHONE_TEL}`} className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            📞 Call Now
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
            { num: `${RATING}★`, label: 'Google Rating' },
            { num: REVIEW_COUNT, label: 'Google Reviews' },
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

      {/* RIGHT — Image */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="hero-media"
      >
        <div style={{ position: 'relative', width: '100%', maxWidth: 500 }}>
          {/* Glow behind image */}
          <div style={{
            position: 'absolute',
            inset: -20,
            background: 'radial-gradient(ellipse at center, rgba(26,86,219,0.2) 0%, transparent 70%)',
            borderRadius: 'var(--radius-lg)',
            zIndex: 0
          }} />

          <img
            src={heroImg}
            alt="AC technician servicing outdoor unit"
            className="hero-img"
            width="500"
            height="540"
            fetchPriority="high"
            decoding="async"
          />

          {/* Same Day Service Badge */}
          <motion.div
            className="hero-badge-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <div style={{
              width: 40, height: 40,
              background: '#fff7ed',
              borderRadius: 10,
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 20,
              flexShrink: 0
            }}>⚡</div>
            <div style={{ textAlign: 'left' }}>
              <strong style={{
                display: 'block',
                fontFamily: 'var(--font-display)',
                fontSize: 13, fontWeight: 700,
                color: 'var(--navy)', marginBottom: 3
              }}>Same Day Service</strong>
              <p style={{
                fontSize: 12, color: 'var(--gray-600)', margin: 0
              }}>Available till 11:30 PM</p>
            </div>
          </motion.div>

          {/* Rating Badge */}
          <motion.div
            className="hero-badge-right"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <span style={{ fontSize: 20 }}>⭐</span>
            <div style={{ textAlign: 'left' }}>
              <strong style={{
                display: 'block', color: 'white',
                fontFamily: 'var(--font-display)',
                fontSize: 13, fontWeight: 700
              }}>{RATING} Rating</strong>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                {REVIEW_COUNT} Google Reviews
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
