import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import CTABanner from '../components/CTABanner'

const services = [
  {
    icon: '❄️', title: 'AC Installation',
    desc: 'Professional installation of all types of air conditioners for homes, offices, and commercial spaces.',
    points: ['Split AC installation', 'Window AC installation', 'Cassette & ceiling AC', 'Copper pipe fitting & wiring']
  },
  {
    icon: '🔧', title: 'AC Repair & Service',
    desc: 'Fast diagnosis and repair for all AC problems with genuine spare parts and same-day service.',
    points: ['Gas (refrigerant) refill', 'Compressor repair', 'PCB / circuit board repair', 'Water leakage fix']
  },
  {
    icon: '🧹', title: 'AC Deep Cleaning',
    desc: 'Restore your AC to peak performance and improve air quality with our deep cleaning service.',
    points: ['Filter cleaning', 'Coil & fin cleaning', 'Drain pan flushing', 'Anti-bacterial treatment']
  },
  {
    icon: '🧊', title: 'Refrigeration',
    desc: 'Expert repair and maintenance for domestic and commercial refrigeration systems.',
    points: ['Domestic fridge repair', 'Cold storage maintenance', 'Deep freezer repair', 'Gas charging']
  },
  {
    icon: '📋', title: 'Annual Maintenance (AMC)',
    desc: 'Protect your AC investment with scheduled servicing and priority response plans.',
    points: ['2 or 4 services/year', 'Priority response', 'Parts discount', 'Hassle-free plan']
  },
]

const brands = ['Daikin', 'Voltas', 'LG', 'Blue Star', 'Hitachi', 'Samsung', 'Carrier', 'Lloyd', 'Godrej', 'Whirlpool', 'Panasonic', 'Haier']

export default function Services() {
  return (
    <div style={{ paddingTop: 64 }}>
      {/* Header */}
      <section style={{
        background: 'var(--navy)', padding: '80px 24px 64px',
        textAlign: 'center'
      }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
          <span className="section-tag" style={{ color: 'var(--accent)' }}>What We Offer</span>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 5vw, 58px)',
            fontWeight: 700, color: 'var(--white)', marginBottom: 14
          }}>Our Services</h1>
          <p style={{ fontSize: 17, color: 'var(--gray-400)', maxWidth: 520, margin: '0 auto' }}>
            Complete AC & refrigeration solutions for homes and businesses in Ahmedabad.
          </p>
        </motion.div>
      </section>

      {/* Services List */}
      <section className="section">
        <div className="container">
          {services.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr',
                gap: 32, padding: '48px 0',
                borderBottom: i < services.length - 1 ? '1px solid var(--gray-100)' : 'none'
              }}>
                <div style={{ fontSize: 48 }}>{s.icon}</div>
                <div>
                  <h2 style={{
                    fontFamily: 'var(--font-display)', fontSize: 26,
                    fontWeight: 700, color: 'var(--navy)', marginBottom: 12
                  }}>{s.title}</h2>
                  <p style={{
                    fontSize: 16, color: 'var(--gray-600)',
                    lineHeight: 1.7, marginBottom: 20, maxWidth: 560
                  }}>{s.desc}</p>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '8px 24px', marginBottom: 28
                  }}>
                    {s.points.map((p, j) => (
                      <span key={j} style={{ fontSize: 14, color: 'var(--gray-600)' }}>✔ {p}</span>
                    ))}
                  </div>
                  <Link to="/contact" className="btn-primary">Book Service</Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Brands */}
      <section className="section" style={{ background: 'var(--gray-50)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Compatibility</span>
            <h2>All Brands Serviced</h2>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            {brands.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                style={{
                  background: 'var(--white)',
                  border: '1.5px solid var(--gray-100)',
                  borderRadius: 100, padding: '10px 22px',
                  fontSize: 14, fontWeight: 600,
                  color: 'var(--navy)',
                  fontFamily: 'var(--font-display)'
                }}
              >{b}</motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTABanner />
    </div>
  )
}