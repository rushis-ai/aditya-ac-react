import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import heroImg from '../assets/wireman-dissasembling-air-conditioner.jpg'

export default function Hero() {
  return (
    <section style={{
      minHeight: '100vh',
      background: 'var(--navy)',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      alignItems: 'center',
      padding: '120px 100px 80px 100px',
      position: 'relative',
      overflow: 'hidden',
      gap: 80
    }}>

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
        style={{ position: 'relative', zIndex: 1 }}
      >
        {/* Badge */}
        <motion.div
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
            letterSpacing: '0.02em'
          }}>
          ⭐ 5.0 Rated · 39 Reviews · Ahmedabad
        </motion.div>

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
        <p style={{
          fontSize: 16,
          color: 'var(--gray-400)',
          lineHeight: 1.8,
          marginBottom: 40,
          maxWidth: 440
        }}>
          Expert AC installation, repair & refrigeration services in Chandkheda, Ahmedabad. Fast response. All brands. Open till 11:30 PM.
        </p>

        {/* Buttons */}
        <div style={{
          display: 'flex', gap: 14,
          flexWrap: 'wrap', marginBottom: 52
        }}>
          <a href="tel:+917617002071" className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            📞 Call Now
          </a>
          <Link to="/services" className="btn-secondary">
            Our Services →
          </Link>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 0,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 'var(--radius)',
          padding: '16px 24px',
          width: 'fit-content'
        }}>
          {[
            { num: '5.0★', label: 'Google Rating' },
            { num: '39+', label: 'Happy Clients' },
            { num: '11:30 PM', label: 'Open Till' }
          ].map((stat, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              {i > 0 && (
                <div style={{
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
        style={{
          position: 'relative', zIndex: 1,
          display: 'flex', justifyContent: 'flex-end'
        }}
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
            style={{
              width: '100%',
              height: 540,
              objectFit: 'cover',
              objectPosition: 'center 20%',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
              position: 'relative',
              zIndex: 1
            }}
          />

          {/* Same Day Service Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            style={{
              position: 'absolute',
              bottom: -24, left: -28,
              background: 'var(--white)',
              borderRadius: 'var(--radius)',
              padding: '14px 20px',
              display: 'flex', alignItems: 'center', gap: 14,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              minWidth: 220,
              zIndex: 2
            }}
          >
            <div style={{
              width: 40, height: 40,
              background: '#fff7ed',
              borderRadius: 10,
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 20,
              flexShrink: 0
            }}>⚡</div>
            <div>
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

          {/* 5 Star Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
            style={{
              position: 'absolute',
              top: -20, right: -20,
              background: 'var(--blue)',
              borderRadius: 'var(--radius)',
              padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: 10,
              boxShadow: '0 8px 32px rgba(26,86,219,0.4)',
              zIndex: 2
            }}
          >
            <span style={{ fontSize: 20 }}>⭐</span>
            <div>
              <strong style={{
                display: 'block', color: 'white',
                fontFamily: 'var(--font-display)',
                fontSize: 13, fontWeight: 700
              }}>5.0 Rating</strong>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                39 Google Reviews
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 900px) {
          section {
            grid-template-columns: 1fr !important;
            padding: 100px 24px 80px !important;
            gap: 48px !important;
            text-align: center;
          }
          section > div:nth-child(2) { justify-content: center !important; }
          section > div:nth-child(3) { justify-content: center !important; }
        }
      `}</style>
    </section>
  )
}