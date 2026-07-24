/**
 * GET /api/auth-verify?token=...
 *
 * Validates the magic link, sets a signed HttpOnly session cookie,
 * and redirects into the room. Emails Dani on every successful sign-in
 * (this is the audit trail).
 */
const { verify, sign, sessionCookie, notify, SESSION_TTL_DAYS } = require('./_auth');

module.exports = async function handler(req, res) {
  const token = (req.query && req.query.token) || '';
  const payload = verify(token);

  if (!payload || payload.k !== 'magic' || !payload.email) {
    // Expired, tampered with, or already stale.
    res.setHeader('Location', '/data-room?err=link');
    return res.status(302).end();
  }

  const session = sign({ k: 'sess', email: payload.email }, SESSION_TTL_DAYS * 24 * 3600 * 1000);
  res.setHeader('Set-Cookie', sessionCookie(session));

  await notify(
    'Investor room SIGN-IN: ' + payload.email,
    payload.email + ' signed in to the investor data room at ' + new Date().toISOString() + '.\n\n' +
    'IP: ' + (req.headers['x-forwarded-for'] || 'unknown') + '\n' +
    'Agent: ' + (req.headers['user-agent'] || 'unknown')
  );

  res.setHeader('Location', '/data-room');
  return res.status(302).end();
};
