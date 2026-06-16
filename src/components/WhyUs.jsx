import { motion } from 'framer-motion'

const items = [
  { num: '01', title: 'Fast Response', desc: 'We reach you the same day. No long waiting, no delays.' },
  { num: '02', title: 'Experienced Technicians', desc: 'Years of hands-on experience with all major AC and refrigeration brands.' },
  { num: '03', title: 'Transparent Pricing', desc: 'No hidden charges. You\'ll know the cost before we start any work.' },
  { num: '04', title: 'Open Late', desc: 'Available till 11:30 PM every day. Because AC problems don\'t wait.' },
]

export default function WhyUs() {
  return (
    <section className="section" style={{ background: 'var(--navy)' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag" style={{ color: 'var(--accent)' }}>Why Aditya AC</span>
          <h2 style={{ color: 'var(--white)' }}>The Difference Is in the Details</h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 32
        }}>
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              viewport={{ once: true }}
              style={{
                borderLeft: '2px solid rgba(96,165,250,0.3)',
                paddingLeft: 20
              }}
            >
              <span style={{
                display: 'block',
                fontFamily: 'var(--font-display)',
                fontSize: 13, fontWeight: 700,
                color: 'var(--accent)',
                letterSpacing: '0.1em',
                marginBottom: 10
              }}>{item.num}</span>
              <h4 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 18, fontWeight: 700,
                color: 'var(--white)', marginBottom: 8
              }}>{item.title}</h4>
              <p style={{ fontSize: 14, color: 'var(--gray-400)', lineHeight: 1.7 }}>
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}