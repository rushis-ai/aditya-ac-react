import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function CTABanner() {
  return (
    <section style={{
      background: 'linear-gradient(135deg, var(--blue) 0%, var(--navy) 100%)',
      padding: '80px 0', textAlign: 'center'
    }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(24px, 4vw, 38px)',
            fontWeight: 700, color: 'var(--white)',
            marginBottom: 12
          }}>AC Not Cooling? Call Us Right Now.</h2>
          <p style={{
            fontSize: 16, color: 'rgba(255,255,255,0.7)',
            marginBottom: 36
          }}>Same-day service · Open till 11:30 PM · Chandkheda, Ahmedabad</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="tel:+919999999999" className="btn-primary">📞 Call Now</a>
            <Link to="/contact" className="btn-outline">Book a Service</Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}