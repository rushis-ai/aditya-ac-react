import { motion } from 'framer-motion'
import { useState } from 'react'

const SHEET_URL = 'https://script.google.com/macros/s/AKfycbzeJ9PGrsJvodyor_DA6qA3jg5Qxm97Tle3yl0A3QYI1Zx5p_uXAQh8jdEpp9LA6hSC/exec'

const inputStyle = {
  fontFamily: 'var(--font-body)', fontSize: 15,
  color: 'var(--gray-800)', background: 'var(--white)',
  border: '1.5px solid var(--gray-100)',
  borderRadius: 'var(--radius)', padding: '12px 16px',
  outline: 'none', width: '100%'
}

const labelStyle = {
  fontSize: 13, fontWeight: 600, color: 'var(--gray-800)'
}

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
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
      setSubmitted(true)
      form.reset()
    } catch {
      alert('Something went wrong. Please call us directly.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ paddingTop: 64 }}>

      {/* Page Header */}
      <section style={{
        background: 'var(--navy)',
        padding: '80px 24px 64px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute', width: 400, height: 400,
            background: 'var(--blue)', borderRadius: '50%',
            opacity: 0.06, top: -150, right: -80
          }} />
        </div>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
          <span className="section-tag" style={{ color: 'var(--accent)' }}>Get In Touch</span>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 5vw, 58px)',
            fontWeight: 700, color: 'var(--white)', marginBottom: 14
          }}>Contact Us</h1>
          <p style={{
            fontSize: 17, color: 'var(--gray-400)',
            maxWidth: 480, margin: '0 auto', lineHeight: 1.7
          }}>
            Call, WhatsApp, or fill in the form — we'll get back to you quickly.
          </p>
        </motion.div>
      </section>

      {/* Quick Contact Cards */}
      <section className="section" style={{ background: 'var(--gray-50)' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16
          }}>
            {[
              { icon: '📞', title: 'Call Us', info: '+91 XXXXXXXXXX', action: 'Tap to Call', href: 'tel:+919999999999', color: 'var(--blue)' },
              { icon: '💬', title: 'WhatsApp', info: '+91 XXXXXXXXXX', action: 'Chat Now', href: 'https://wa.me/919999999999', color: '#25D366' },
              { icon: '🕐', title: 'Business Hours', info: 'Open Every Day', action: 'Closes 11:30 PM', href: null, color: '#f59e0b' },
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
                whileHover={card.href ? { y: -3 } : {}}
                style={{
                  background: 'var(--white)',
                  border: '1.5px solid var(--gray-100)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '28px 20px',
                  textAlign: 'center',
                  display: 'block',
                  cursor: card.href ? 'pointer' : 'default',
                  textDecoration: 'none'
                }}
              >
                <div style={{
                  width: 52, height: 52,
                  background: `${card.color}15`,
                  borderRadius: 14,
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24, margin: '0 auto 14px'
                }}>{card.icon}</div>
                <h4 style={{
                  fontFamily: 'var(--font-display)', fontSize: 15,
                  fontWeight: 700, color: 'var(--navy)', marginBottom: 6
                }}>{card.title}</h4>
                <p style={{ fontSize: 14, color: 'var(--gray-600)', marginBottom: 10 }}>{card.info}</p>
                <span style={{ fontSize: 13, fontWeight: 600, color: card.color }}>{card.action}</span>
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
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
              <p style={{ fontSize: 15, color: 'var(--gray-600)', marginBottom: 32, lineHeight: 1.6 }}>
                Fill in the details and we'll contact you to confirm your appointment.
              </p>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    background: '#f0fdf4',
                    border: '1.5px solid #bbf7d0',
                    borderRadius: 'var(--radius-lg)',
                    padding: '40px 24px',
                    textAlign: 'center'
                  }}
                >
                  <span style={{ fontSize: 44, display: 'block', marginBottom: 14 }}>✅</span>
                  <h3 style={{
                    fontFamily: 'var(--font-display)', fontSize: 20,
                    fontWeight: 700, color: 'var(--navy)', marginBottom: 8
                  }}>Request Sent!</h3>
                  <p style={{ fontSize: 15, color: 'var(--gray-600)' }}>
                    We'll contact you shortly to confirm your appointment.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    style={{
                      marginTop: 20, background: 'none',
                      border: 'none', color: 'var(--blue)',
                      fontWeight: 600, cursor: 'pointer', fontSize: 14
                    }}
                  >Submit another request</button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                  {/* Name */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-800)', letterSpacing: '0.02em' }}>
                      Full Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="e.g. Rahul Shah"
                      required
                      style={{
                        fontFamily: 'var(--font-body)', fontSize: 15,
                        color: 'var(--gray-800)', background: 'var(--white)',
                        border: '1.5px solid var(--gray-100)',
                        borderRadius: 'var(--radius)', padding: '14px 16px',
                        outline: 'none', width: '100%',
                        transition: 'border-color 0.2s, box-shadow 0.2s'
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = 'var(--blue)'
                        e.target.style.boxShadow = '0 0 0 3px rgba(26,86,219,0.1)'
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = 'var(--gray-100)'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>

                  {/* Phone */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-800)', letterSpacing: '0.02em' }}>
                      Phone Number <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{
                        position: 'absolute', left: 14, top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: 15, color: 'var(--gray-600)',
                        fontWeight: 500, pointerEvents: 'none'
                      }}>+91</span>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        placeholder="98765 43210"
                        required
                        style={{
                          fontFamily: 'var(--font-body)', fontSize: 15,
                          color: 'var(--gray-800)', background: 'var(--white)',
                          border: '1.5px solid var(--gray-100)',
                          borderRadius: 'var(--radius)', padding: '14px 16px 14px 48px',
                          outline: 'none', width: '100%',
                          transition: 'border-color 0.2s, box-shadow 0.2s'
                        }}
                        onFocus={e => {
                          e.target.style.borderColor = 'var(--blue)'
                          e.target.style.boxShadow = '0 0 0 3px rgba(26,86,219,0.1)'
                        }}
                        onBlur={e => {
                          e.target.style.borderColor = 'var(--gray-100)'
                          e.target.style.boxShadow = 'none'
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                      Also accepts: +91 98765 43210 or 09876543210
                    </span>
                  </div>

                  {/* Service */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-800)', letterSpacing: '0.02em' }}>
                      Service Required <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select
                      name="service"
                      required
                      defaultValue=""
                      style={{
                        fontFamily: 'var(--font-body)', fontSize: 15,
                        color: 'var(--gray-800)', background: 'var(--white)',
                        border: '1.5px solid var(--gray-100)',
                        borderRadius: 'var(--radius)', padding: '14px 16px',
                        outline: 'none', width: '100%',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        appearance: 'none',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394a3b8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 16px center'
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = 'var(--blue)'
                        e.target.style.boxShadow = '0 0 0 3px rgba(26,86,219,0.1)'
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = 'var(--gray-100)'
                        e.target.style.boxShadow = 'none'
                      }}
                    >
                      <option value="" disabled>Select a service...</option>
                      <option value="ac-installation">❄️ AC Installation</option>
                      <option value="ac-repair">🔧 AC Repair</option>
                      <option value="ac-cleaning">🧹 AC Deep Cleaning</option>
                      <option value="gas-refill">💨 Gas Refill</option>
                      <option value="refrigeration">🧊 Refrigeration Repair</option>
                      <option value="amc">📋 Annual Maintenance (AMC)</option>
                      <option value="other">💬 Other</option>
                    </select>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%', padding: '16px',
                      fontSize: 16, fontWeight: 700,
                      fontFamily: 'var(--font-display)',
                      background: loading ? 'var(--gray-400)' : 'var(--blue)',
                      color: 'white', border: 'none',
                      borderRadius: 'var(--radius)',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'background 0.2s',
                      marginTop: 4
                    }}
                    onMouseEnter={e => { if (!loading) e.target.style.background = 'var(--blue-light)' }}
                    onMouseLeave={e => { if (!loading) e.target.style.background = 'var(--blue)' }}
                  >
                    {loading ? '⏳ Sending...' : '📩 Send Request'}
                  </button>

                  <p style={{ fontSize: 13, color: 'var(--gray-400)', textAlign: 'center', marginTop: -8 }}>
                    🔒 Your details are safe with us. We'll call you back shortly.
                  </p>

                </form>
              )}
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
            >
              {[
                { title: '📍 Our Location', content: 'Shop no.10, Vitthal Mall, New CG Rd, near ONGC Circle, Chandkheda, Ahmedabad 380005' },
                { title: '⏰ Working Hours', content: 'Open Every Day · Closes 11:30 PM' },
              ].map((block, i) => (
                <div key={i} style={{
                  background: 'var(--gray-50)',
                  border: '1.5px solid var(--gray-100)',
                  borderRadius: 'var(--radius)',
                  padding: '20px 24px'
                }}>
                  <h4 style={{
                    fontFamily: 'var(--font-display)', fontSize: 15,
                    fontWeight: 700, color: 'var(--navy)', marginBottom: 8
                  }}>{block.title}</h4>
                  <p style={{ fontSize: 15, color: 'var(--gray-600)', lineHeight: 1.7 }}>
                    {block.content}
                  </p>
                </div>
              ))}

              {/* Map */}
              <div style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                border: '1.5px solid var(--gray-100)',
                boxShadow: 'var(--shadow)'
              }}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3669.5!2d72.5945!3d23.0927!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDA1JzMzLjciTiA3MsKwMzUnMzQuMiJF!5e0!3m2!1sen!2sin!4v1234567890"
                  width="100%"
                  height="260"
                  style={{ border: 0, display: 'block' }}
                  allowFullScreen
                  loading="lazy"
                  title="Aditya AC Location"
                />
              </div>

              {/* WhatsApp CTA */}
              <a
                href="https://wa.me/919999999999?text=Hi%2C%20I%20need%20AC%20service"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: 12, background: '#25D366',
                  color: 'white', borderRadius: 'var(--radius)',
                  padding: '14px 20px', textDecoration: 'none',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600, fontSize: 15
                }}
              >
                <span style={{ fontSize: 22 }}>💬</span>
                Chat on WhatsApp Instead
              </a>
            </motion.div>

          </div>
        </div>
      </section>

    </div>
  )
}