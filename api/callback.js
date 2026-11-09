// Step 2 of "Sign in with GitHub" for the CMS at /admin.
// Exchanges GitHub's one-time code for an access token and hands it to the CMS
// window that opened this popup (Decap/Sveltia postMessage protocol).

function reply(res, status, payload) {
  const message = `authorization:github:${status}:${JSON.stringify(payload)}`
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Set-Cookie', 'cms_oauth_state=; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=0')
  res.status(200).send(`<!doctype html><html><body><p>Signing in…</p><script>
(function () {
  var message = ${JSON.stringify(message).replace(/</g, '\\u003c')};
  // Only hand the token to this site (apex or www), never to another origin
  var host = location.host.replace(/^www\\./, '');
  var allowed = [location.protocol + '//' + host, location.protocol + '//www.' + host];
  function receive(e) {
    if (allowed.indexOf(e.origin) === -1) return;
    window.opener.postMessage(message, e.origin);
    window.removeEventListener('message', receive);
    setTimeout(function () { window.close(); }, 300);
  }
  window.addEventListener('message', receive);
  // Handshake ping carries no secret; the token is only sent after an allowed origin answers
  window.opener.postMessage('authorizing:github', '*');
})();
</script></body></html>`)
}

function readCookie(req, name) {
  const m = (req.headers.cookie || '').match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return m ? m[1] : null
}

export default async function handler(req, res) {
  const { code, state } = req.query
  const expected = readCookie(req, 'cms_oauth_state')

  if (!code || !state || !expected || state !== expected) {
    reply(res, 'error', { message: 'Sign-in expired or was tampered with. Please try again.' })
    return
  }

  try {
    const r = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    })
    const data = await r.json()
    if (!data.access_token) {
      reply(res, 'error', { message: data.error_description || 'GitHub did not return a token.' })
      return
    }
    reply(res, 'success', { token: data.access_token, provider: 'github' })
  } catch {
    reply(res, 'error', { message: 'Could not reach GitHub. Please try again.' })
  }
}
