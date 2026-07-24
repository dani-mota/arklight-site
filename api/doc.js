/**
 * GET /api/doc?id=deck
 *
 * The ONLY way to read an investor document.
 *   1. Requires a valid signed session cookie (else 401).
 *   2. Tier-2 documents additionally require TIER2_ALLOWLIST membership (else 403 + you get an email).
 *   3. Writes an audit line to the Vercel runtime log.
 *   4. Streams the file from Vercel Blob. The Blob URL is resolved server-side
 *      and never sent to the browser.
 *
 * Responses are marked no-store so no CDN or proxy can cache gated content.
 */
const { getSession, notify } = require('./_auth');
const { DOCS, blobPath } = require('./_docs');

function inList(envVar, email) {
  const list = (process.env[envVar] || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  const e = String(email || '').toLowerCase();
  return list.some(entry => entry.startsWith('@') ? e.endsWith(entry) : entry === e);
}

module.exports = async function handler(req, res) {
  // Never let a gated document be cached anywhere.
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const session = getSession(req);
  if (!session) return res.status(401).json({ error: 'Not signed in.' });

  const id = String((req.query && req.query.id) || '');
  const doc = DOCS[id];
  if (!doc) return res.status(404).json({ error: 'Not found.' });

  // Second wall: restricted documents need an explicit grant.
  if (doc.tier === 2 && !inList('TIER2_ALLOWLIST', session.email)) {
    console.log(JSON.stringify({
      event: 'doc_denied', email: session.email, doc: id, ts: new Date().toISOString()
    }));
    await notify(
      'Investor room TIER-2 REQUEST: ' + session.email,
      session.email + ' tried to open a restricted document ("' + doc.title + '") at ' +
      new Date().toISOString() + '.\n\nTo grant access, add their email to TIER2_ALLOWLIST in Vercel.'
    );
    return res.status(403).json({ error: 'This document requires additional clearance. Your request has been sent.' });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return res.status(503).json({ error: 'Document storage is not configured yet.' });

  // Read the PRIVATE blob by pathname. There is no public URL: the bytes come
  // back over an authenticated call and are streamed straight to the investor.
  let result;
  try {
    const { get } = require('@vercel/blob');
    result = await get(blobPath(doc), { access: 'private', token });
  } catch (e) {
    return res.status(500).json({ error: 'Storage error.' });
  }
  if (!result || result.statusCode !== 200 || !result.stream) {
    return res.status(404).json({ error: 'Document has not been uploaded yet.' });
  }

  // Audit trail -> visible in Vercel > Project > Logs
  console.log(JSON.stringify({
    event: 'doc_open',
    email: session.email,
    doc: id,
    title: doc.title,
    ts: new Date().toISOString(),
    ip: req.headers['x-forwarded-for'] || null,
    ua: req.headers['user-agent'] || null
  }));

  let buf;
  try {
    buf = Buffer.from(await new Response(result.stream).arrayBuffer());
  } catch (e) {
    return res.status(502).json({ error: 'Could not read document.' });
  }

  res.setHeader('Content-Type', 'application/pdf');
  // "inline" = view in the browser viewer, not a download prompt.
  res.setHeader('Content-Disposition', 'inline; filename="' + doc.file + '"');
  res.setHeader('Content-Length', String(buf.length));
  return res.status(200).send(buf);
};
