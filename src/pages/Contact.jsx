<form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
  
  {/* Name */}
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <label style={{
      fontSize: 13, fontWeight: 700,
      color: 'var(--gray-800)', letterSpacing: '0.02em'
    }}>
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
    <label style={{
      fontSize: 13, fontWeight: 700,
      color: 'var(--gray-800)', letterSpacing: '0.02em'
    }}>
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
    <label style={{
      fontSize: 13, fontWeight: 700,
      color: 'var(--gray-800)', letterSpacing: '0.02em'
    }}>
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
      transition: 'background 0.2s, transform 0.15s',
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