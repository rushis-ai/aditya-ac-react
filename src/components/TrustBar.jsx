import { motion } from 'framer-motion'

const items = [
  { icon: '⚡', label: 'Same Day Service' },
  { icon: '🔧', label: 'All AC Brands' },
  { icon: '🌙', label: 'Open Till 11:30 PM' },
  { icon: '📍', label: 'Chandkheda, Ahmedabad' },
  { icon: '✅', label: 'Genuine Parts Used' },
]

export default function TrustBar() {
  return (
    <section style={{ background: 'var(--blue)', padding: '18px 0' }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto', padding: '0 24px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16
      }}>
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            style={{
              display: 'flex', alignItems: 'center',
              gap: 8, color: 'white',
              fontSize: 14, fontWeight: 500
            }}
          >
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            <span>{item.label}</span>
          </motion.div>
        ))}
      </div>
    </section>
  )
}