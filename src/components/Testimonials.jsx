import { motion } from 'framer-motion'

const reviews = [
  {
    stars: '⭐⭐⭐⭐⭐',
    text: 'Very professional and fast service. My AC was fixed within an hour of calling. Highly recommend!',
    name: 'Rajesh P.'
  },
  {
    stars: '⭐⭐⭐⭐⭐',
    text: 'Best AC service in Chandkheda. Honest pricing and genuine parts. Won\'t go anywhere else.',
    name: 'Priya M.'
  },
  {
    stars: '⭐⭐⭐⭐⭐',
    text: 'Called late evening and they still came and serviced my AC. Great work and very polite staff.',
    name: 'Suresh K.'
  },
]

export default function Testimonials() {
  return (
    <section className="section" style={{ background: 'var(--white)' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Google Reviews</span>
          <h2>What Customers Say</h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24, marginBottom: 32
        }}>
          {reviews.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              viewport={{ once: true }}
              style={{
                background: 'var(--white)',
                border: '1.5px solid var(--gray-100)',
                borderRadius: 'var(--radius-lg)',
                padding: 28,
                boxShadow: 'var(--shadow)'
              }}
            >
              <div style={{ fontSize: 16, marginBottom: 14 }}>{r.stars}</div>
              <p style={{
                fontSize: 15, color: 'var(--gray-600)',
                lineHeight: 1.7, marginBottom: 16,
                fontStyle: 'italic'
              }}>"{r.text}"</p>
              <div style={{
                fontSize: 13, fontWeight: 600,
                color: 'var(--navy)'
              }}>— {r.name}</div>
            </motion.div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 18, fontWeight: 700,
            color: 'var(--navy)'
          }}>
            ⭐ 5.0 on Google · 39 Reviews
          </span>
        </div>
      </div>
    </section>
  )
}