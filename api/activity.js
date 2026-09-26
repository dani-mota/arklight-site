/**
 * POST /api/activity   { session_id, doc, event, page, dwell_ms }
 *   Session required. Email is taken from the cookie, never from the body.
 *
 * GET  /api/activity            recent sessions (operators only)
 * GET  /api/activity?email=...  one investor's sessions (operators only)
 *
 * Non-operators who are signed in get 404 so the route is not confirmed.
 * Unsigned-in requests get 401.
 */
const { getSession } = require('./_auth');
const { isOperator, record, recentSessions, sessionsForEmail } = require('./_activity');

function sameSite(req) {
  const site = req.headers['sec-fetch-site'];
  return !site || site === 'same-origin' || site === 'none';
}

function readBody(req) {
  const raw = req.body;
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try { return JSON.parse(String(raw)); } catch (e) { return {}; }
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const session = getSession(req);

  if (req.method === 'POST') {
    if (!sameSite(req)) return res.status(403).json({ error: 'Forbidden' });
    if (!session) return res.status(401).json({ error: 'Not signed in.' });
    const body = readBody(req);
    try {
      await record(session.email, body);
    } catch (e) {
      console.log(JSON.stringify({ event: 'activity_store_failed', err: String(e && e.message) }));
    }
    // Always 204 to the client: a store miss must not surface in the viewer.
    return res.status(204).end();
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!session) return res.status(401).json({ ok: false });
  if (!isOperator(session.email)) return res.status(404).json({ error: 'Not found.' });

  const email = String((req.query && req.query.email) || '').trim().toLowerCase();
  try {
    const data = email
      ? await sessionsForEmail(email)
      : await recentSessions(200);
    return res.status(200).json({
      ok: true,
      operator: session.email,
      store: data.store,
      email: email || null,
      sessions: data.sessions
    });
  } catch (e) {
    console.log(JSON.stringify({ event: 'activity_query_failed', err: String(e && e.message) }));
    return res.status(200).json({ ok: true, operator: session.email, store: false, sessions: [] });
  }
};
