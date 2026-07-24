/**
 * GET  /api/session   -> { ok, email } if signed in, else 401
 * POST /api/session   -> signs out (clears the cookie)
 *
 * The room page calls this on load to decide whether to show the gate.
 */
const { getSession, clearCookie } = require('./_auth');

module.exports = async function handler(req, res) {
  if (req.method === 'POST') {
    res.setHeader('Set-Cookie', clearCookie());
    return res.status(200).json({ ok: true, signedOut: true });
  }

  const session = getSession(req);
  if (!session) return res.status(401).json({ ok: false });

  return res.status(200).json({ ok: true, email: session.email });
};
