import { useState } from 'react'
import { call } from './api.js'

export default function Login({ onLogin, notice }) {
  const [error, setError] = useState(notice || '')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    const f = e.currentTarget
    setBusy(true)
    setError('')
    try {
      await call('login', { method: 'POST', body: { username: f.username.value, password: f.password.value } })
      onLogin()
    } catch (err) {
      setError(err.message)
      f.password.value = ''
      f.password.focus()
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="login">
      <form className="card login-card" onSubmit={submit}>
        <h1>Lead Desk</h1>
        <p className="muted">Sign in to continue</p>
        <label>
          Username
          <input name="username" autoComplete="username" autoCapitalize="none" spellCheck="false" required autoFocus />
        </label>
        <label>
          Password
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </main>
  )
}
