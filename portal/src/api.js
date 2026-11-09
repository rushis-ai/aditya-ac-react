export class AuthError extends Error {}

// All API calls. Writes carry X-Requested-With, which the server requires (CSRF guard).
export async function call(path, { method = 'GET', body } = {}) {
  const headers = { 'X-Requested-With': 'portal' }
  if (body) headers['Content-Type'] = 'application/json'
  let r
  try {
    r = await fetch('/api/' + path, { method, headers, credentials: 'same-origin', body: body && JSON.stringify(body) })
  } catch {
    throw new Error('No connection. Check your internet and try again.')
  }
  const d = await r.json().catch(() => ({}))
  if (r.status === 401 && path !== 'login') throw new AuthError(d.error || 'Please log in.')
  if (!r.ok) throw new Error(d.error || `Request failed (${r.status})`)
  return d
}
