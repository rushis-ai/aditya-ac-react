import { motion } from 'framer-motion'

const SHEET_URL = 'https://script.google.com/macros/s/XXXXXXXXXX/exec'

export default function Contact() {
  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = e.target
    const data = {
      name: form.name.value,
      phone: form.phone.value,
      service: form.service.value,
      message: form.message.value
    }
    try {
      await fetch(SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      form.reset()
      alert('Request sent! We will call you back shortly.')
    } catch {
      alert('Something went wrong. Please call us directly.')
    }
  }

  return (
    <div style={{ paddingTop: 64 }}>
      {/* Page Header */}
      <section style={{
        background: 'var(--navy)', padding: '80px 24px 64px',
        textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="section-tag" style={{ color: 'var(--accent)' }}>Get In Touch</span>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 5vw, 58px)',
            fontWeight: 700, color: 'var(--white)', marginBottom: 14
          }}>Contact Us</h1>
          <p style={{ fontSize: 17, color: 'var(--gray-400)', maxWidth: 480, margin: '0 auto' }}>
            Call, WhatsApp, or fill in the form — we'll get back to you quickly.
          </p>
        </motion.div>
      </section>

      {/* Quick Contact Cards */}
      <section className="section" style={{ background: 'var(--gray-50)' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 20
          }}>
            {[
              { icon: '📞', title: 'Call Us', info: '+91 XXXXXXXXXX', action: 'Tap to Call', href: 'tel:+919999999999' },
              { icon: '💬', title: 'WhatsApp', info: '+91 XXXXXXXXXX', action: 'Chat Now', href: 'https://wa.me/919999999999' },
              { icon: '🕐', title: 'Business Hours', info: 'Open Every Day', action: 'Closes 11:30 PM', href: null },
            ].map((card, i) => (
              <motion.a
                key={i}
                href={card.href || undefined}
                target={card.href?.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -3 }}
                style={{
                  background: 'var(--white)',
                  border: '1.5px solid var(--gray-100)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '28px 24px',
                  textAlign: 'center',
                  display: 'block',
                  cursor: card.href ? 'pointer' : 'default',
                  textDecoration: 'none'
                }}
              >
                <span style={{ fontSize: 32, display: 'block', marginBottom: 12 }}>{card.icon}</span>
                <h4 style={{
                  fontFamily: 'var(--font-display)', fontSize: 16,
                  fontWeight: 700, color: 'var(--navy)', marginBottom: 6
                }}>{card.title}</h4>
                <p style={{ fontSize: 15, color: 'var(--gray-600)', marginBottom: 10 }}>{card.info}</p>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--blue)' }}>{card.action}</span>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Form + Info */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 56, alignItems: 'start'
          }}>
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 style={{
                fontFamily: 'var(--font-display)', fontSize: 28,
                fontWeight: 700, color: 'var(--navy)', marginBottom: 8
              }}>Book a Service</h2>
              <p style={{ fontSize: 15, color: 'var(--gray-600)', marginBottom: 32 }}>
                Fill in the details and we'll contact you to confirm your appointment.
              </p>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { label: 'Your Name', id: 'name', type: 'text', placeholder: 'e.g. Rahul Shah' },
                  { label: 'Phone Number', id: 'phone', type: 'text', placeholder: 'e.g. +91 98765 43210' },
                ].map(field => (
                  <div key={field.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)' }}>{field.label}</label>
                    <input
                      type={field.type}
                      id={field.id}
                      name={field.id}
                      placeholder={field.placeholder}
                      required
                      style={{
                        fontFamily: 'var(--font-body)', fontSize: 15,
                        color: 'var(--gray-800)', background: 'var(--white)',
                        border: '1.5px solid var(--gray-100)',
                        borderRadius: 'var(--radius)', padding: '12px 16px',
                        outline: 'none', width: '100%'
                      }}
                    />
                  </div>
                ))}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)' }}>Service Required</label>
                  <select name="service" required style={{
                    fontFamily: 'var(--font-body)', fontSize: 15,
                    color: 'var(--gray-800)', background: 'var(--white)',
                    border: '1.5px solid var(--gray-100)',
                    borderRadius: 'var(--radius)', padding: '12px 16px',
                    outline: 'none', width: '100%'
                  }}>
                    <option value="" disabled>Select a service</option>
                    <option value="ac-installation">AC Installation</option>
                    <option value="ac-repair">AC Repair</option>
                    <option value="ac-cleaning">AC Deep Cleaning</option>
                    <option value="gas-refill">Gas Refill</option>
                    <option value="refrigeration">Refrigeration Repair</option>
                    <option value="amc">Annual Maintenance (AMC)</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)' }}>
                    Additional Details <span style={{ fontWeight: 400, color: 'var(--gray-400)' }}>(optional)</span>
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    placeholder="AC brand, model, problem description..."
                    style={{
                      fontFamily: 'var(--font-body)', fontSize: 15,
                      color: 'var(--gray-800)', background: 'var(--white)',
                      border: '1.5px solid var(--gray-100)',
                      borderRadius: 'var(--radius)', padding: '12px 16px',
                      outline: 'none', width: '100%', resize: 'vertical'
                    }}
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', padding: 15, fontSize: 16 }}>
                  Send Request
                </button>
              </form>
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              style={{ display: 'flex', flexDirection: 'column', gap: 28 }}
            >
              {[
                { title: '📍 Our Location', content: 'Shop no.10, Vitthal Mall, New CG Rd, near ONGC Circle, Chandkheda, Ahmedabad 380005' },
                { title: '⏰ Working Hours', content: 'Open Every Day · Closes 11:30 PM' },
              ].map((block, i) => (
                <div key={i}>
                  <h4 style={{
                    fontFamily: 'var(--font-display)', fontSize: 15,
                    fontWeight: 700, color: 'var(--navy)', marginBottom: 8
                  }}>{block.title}</h4>
                  <p style={{ fontSize: 15, color: 'var(--gray-600)', lineHeight: 1.7 }}>{block.content}</p>
                </div>
              ))}

              {/* Map */}
              <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1.5px solid var(--gray-100)' }}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3669.5!2d72.5945!3d23.0927!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDA1JzMzLjciTiA3MsKwMzUnMzQuMiJF!5e0!3m2!1sen!2sin!4v1234567890"
                  width="100%" height="240"
                  style={{ border: 0, display: 'block' }}
                  allowFullScreen loading="lazy"
                  title="Aditya AC Location"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}