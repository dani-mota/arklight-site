/**
 * GET /api/auth-verify?token=...
 *
 * Validates the magic link, sets a signed HttpOnly session cookie,
 * and redirects into the room. Emails Dani on every successful sign-in
 * (this is the audit trail).
 */
const { verify, sign, sessionCookie, notify, SESSION_TTL_DAYS } = require('./_auth');

module.exports = async function handler(req, res) {
  // GET only, and only as a real navigation. Without this, an attacker who is
  // themselves on the allowlist could force a victim's browser to adopt THEIR
  // session via <img src="/api/auth-verify?token=...">, which would silently
  // misattribute every subsequent document open in the audit log.
  if (req.method !== 'GET') return res.status(405).end();
  const dest = req.headers['sec-fetch-dest'];
  if (dest && dest !== 'document') return res.status(403).end();

  const token = (req.query && req.query.token) || '';
  const payload = verify(token);

  if (!payload || payload.k !== 'magic' || !payload.email) {
    // Expired, tampered with, or already stale.
    res.setHeader('Location', '/data-room?err=link');
    return res.status(302).end();
  }

  const session = sign({ k: 'sess', email: payload.email }, SESSION_TTL_DAYS * 24 * 3600 * 1000);
  res.setHeader('Set-Cookie', sessionCookie(session));

  // The console line is the durable audit record. The email must be awaited:
  // the function is frozen once it returns, so an un-awaited send never fires.
  // notify() swallows its own errors, so this cannot break sign-in.
  console.log(JSON.stringify({
    event: 'sign_in', email: payload.email, ts: new Date().toISOString(),
    ip: req.headers['x-forwarded-for'] || null
  }));
  await notify(
    'Investor room SIGN-IN: ' + payload.email,
    payload.email + ' signed in to the investor data room at ' + new Date().toISOString() + '.\n\n' +
    'IP: ' + (req.headers['x-forwarded-for'] || 'unknown') + '\n' +
    'Agent: ' + (req.headers['user-agent'] || 'unknown')
  );

  res.setHeader('Location', '/data-room');
  return res.status(302).end();
};
