import { motion } from 'framer-motion'
import { Zap, Wrench, Moon, MapPin, ShieldCheck } from 'lucide-react'

const items = [
  { icon: Zap, label: 'Same Day Service' },
  { icon: Wrench, label: 'All AC Brands' },
  { icon: Moon, label: 'Open Till 11:30 PM' },
  { icon: MapPin, label: 'Chandkheda, Ahmedabad' },
  { icon: ShieldCheck, label: 'Genuine Parts Used' },
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
            <item.icon size={18} strokeWidth={2.2} aria-hidden="true" style={{ opacity: 0.9 }} />
            <span>{item.label}</span>
          </motion.div>
        ))}
      </div>
    </section>
  )
}