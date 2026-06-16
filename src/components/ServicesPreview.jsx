import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const services = [
  {
    icon: '❄️',
    title: 'AC Installation',
    desc: 'Split, window & cassette AC installation for homes and offices. All brands.',
    featured: false
  },
  {
    icon: '🔧',
    title: 'AC Repair & Service',
    desc: 'Gas refill, deep cleaning, PCB repair, compressor service and more.',
    featured: true
  },
  {
    icon: '🧊',
    title: 'Refrigeration',
    desc: 'Commercial & domestic fridge repair, cold storage maintenance.',
    featured: false
  },
]

export default function ServicesPreview() {
  return (
    <section className="section" style={{ background: 'var(--gray-50)' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag">What We Do</span>
          <h2>Our Services</h2>
          <p className="section-sub">From installation to annual maintenance — we handle everything AC & refrigeration.</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24, marginBottom: 40
        }}>
          {services.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              style={{
                background: s.featured
                  ? 'linear-gradient(135deg, #f0f7ff 0%, #fff 100%)'
                  : 'var(--white)',
                borderRadius: 'var(--radius-lg)',
                padding: '36px 28px',
                border: s.featured
                  ? '1.5px solid var(--blue)'
                  : '1.5px solid var(--gray-100)',
                boxShadow: s.featured ? 'var(--shadow)' : 'none',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 16 }}>{s.icon}</div>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 20, fontWeight: 700,
                color: 'var(--navy)', marginBottom: 10
              }}>{s.title}</h3>
              <p style={{
                fontSize: 15, color: 'var(--gray-600)',
                marginBottom: 20, lineHeight: 1.7
              }}>{s.desc}</p>
              <Link to="/services" style={{
                fontSize: 14, fontWeight: 600, color: 'var(--blue)'
              }}>Learn more →</Link>
            </motion.div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link to="/services" className="btn-primary">View All Services</Link>
        </div>
      </div>
    </section>
  )
}