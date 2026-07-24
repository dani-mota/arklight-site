/**
 * Shared auth helpers for the investor data room.
 *
 * Stateless by design: magic-link tokens and sessions are HMAC-signed payloads,
 * so there is no database to provision. Add a store later if you want
 * single-use links and a queryable audit log.
 *
 * Required env vars (set in Vercel → Project → Settings → Environment Variables):
 *   AUTH_SECRET          random 32+ byte string  (openssl rand -base64 48)
 *   INVESTOR_ALLOWLIST   comma-separated emails; an entry starting with "@"
 *                        allows a whole domain, e.g.  @arklight.us
 *   RESEND_API_KEY       already set on this project
 *   ALERT_EMAIL          optional, defaults to dani@arklight.us
 */
const crypto = require('crypto');

const SECRET = process.env.AUTH_SECRET || '';
const TOKEN_TTL_MIN = 20;      // magic link lifetime
const SESSION_TTL_DAYS = 7;    // how long a verified session lasts
const COOKIE = 'ark_session';

const ALERT_TO = process.env.ALERT_EMAIL || 'dani@arklight.us';
const MAIL_FROM = 'Project Arklight <share@arklight.us>';

function b64url(buf) { return Buffer.from(buf).toString('base64url'); }

/** Sign a payload with an expiry. Returns "<data>.<sig>". */
function sign(payload, ttlMs) {
  const body = Object.assign({}, payload, { exp: Date.now() + ttlMs });
  const data = b64url(JSON.stringify(body));
  const sig = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  return data + '.' + sig;
}

/** Verify signature + expiry. Returns the payload, or null. */
function verify(token) {
  if (!token || !SECRET) return null;
  const parts = String(token).split('.');
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  const expected = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  let body;
  try { body = JSON.parse(Buffer.from(data, 'base64url').toString()); } catch (e) { return null; }
  if (!body.exp || Date.now() > body.exp) return null;
  return body;
}

function normalizeEmail(email) { return String(email || '').trim().toLowerCase(); }

function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

/** Is this email invited? Supports exact addresses and "@domain.com" entries. */
function isAllowed(email) {
  const e = normalizeEmail(email);
  if (!e) return false;
  const list = (process.env.INVESTOR_ALLOWLIST || '')
    .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  return list.some(entry => entry.startsWith('@') ? e.endsWith(entry) : entry === e);
}

function sessionCookie(token) {
  const maxAge = SESSION_TTL_DAYS * 24 * 3600;
  return COOKIE + '=' + token + '; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=' + maxAge;
}

function clearCookie() {
  return COOKIE + '=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0';
}

function readCookie(req, name) {
  const raw = req.headers.cookie || '';
  const m = raw.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
  return m ? decodeURIComponent(m[1]) : null;
}

/** Returns { email } for a valid signed session, else null. */
function getSession(req) {
  const payload = verify(readCookie(req, COOKIE));
  return payload && payload.k === 'sess' ? payload : null;
}

/** Fire-and-forget notification. Never throws. */
async function notify(subject, text) {
  if (!process.env.RESEND_API_KEY) return;
  try {
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({ from: MAIL_FROM, to: ALERT_TO, subject, text });
  } catch (e) { /* non-fatal */ }
}

module.exports = {
  sign, verify, isAllowed, isValidEmail, normalizeEmail,
  sessionCookie, clearCookie, readCookie, getSession, notify,
  TOKEN_TTL_MIN, SESSION_TTL_DAYS, MAIL_FROM, ALERT_TO, COOKIE
};
