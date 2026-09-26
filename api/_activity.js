/**
 * Investor reading-activity store.
 *
 * Events are stamped with the session email on the server. Redis is required
 * to query them; if it is not configured, ingest still 204s after a console
 * line so a missing store never breaks the viewer.
 *
 * Keys (TTL 180 days):
 *   act:e:{email}          list of event JSON (capped at 2000)
 *   act:s:{session_id}     hash: email, started, last, total_ms, docs
 *   act:recent             zset of session ids by last-seen ms
 *   act:doc:{id}           hash page -> total focused ms
 *   act:rl:{email}         per-minute ingest counter
 */
const { Redis } = require('@upstash/redis');
const { DOCS } = require('./_docs');

const TTL_SEC = 180 * 24 * 3600;
const EVENT_CAP = 2000;
const DWELL_MIN = 1000;
const DWELL_MAX = 20000;
const RATE_PER_MIN = 40;
const EVENTS = { open: 1, page: 1, heartbeat: 1, hidden: 1, close: 1 };

function redis() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function isOperator(email) {
  const e = String(email || '').trim().toLowerCase();
  if (!e) return false;
  const raw = process.env.OPERATOR_ALLOWLIST || process.env.ALERT_EMAIL || 'dani@arklight.us';
  return raw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean).some(entry => entry === e);
}

function knownDoc(id) {
  return Object.prototype.hasOwnProperty.call(DOCS, id) && typeof DOCS[id].file === 'string';
}

function clampDwell(ms) {
  const n = Number(ms) || 0;
  if (n < DWELL_MIN) return 0;
  return Math.min(Math.floor(n), DWELL_MAX);
}

function parseDocs(raw) {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try { return JSON.parse(raw); } catch (e) { return {}; }
}

async function record(email, payload) {
  const doc = String(payload.doc || '');
  const event = String(payload.event || '');
  const sessionId = String(payload.session_id || '').slice(0, 80);
  const page = Math.max(1, Math.floor(Number(payload.page) || 1));
  if (!knownDoc(doc) || !EVENTS[event] || !sessionId) return false;

  const dwell = event === 'open' ? 0 : clampDwell(payload.dwell_ms);
  const now = Date.now();
  const row = {
    ts: new Date(now).toISOString(),
    event, doc, page, dwell_ms: dwell, session_id: sessionId
  };

  console.log(JSON.stringify({
    event: 'activity', email, doc, kind: event, page, dwell_ms: dwell, ts: row.ts
  }));

  const r = redis();
  if (!r) return true;

  const rlKey = 'act:rl:' + email;
  const n = await r.incr(rlKey);
  if (n === 1) await r.expire(rlKey, 60);
  if (n > RATE_PER_MIN) return true;

  const eKey = 'act:e:' + email;
  const sKey = 'act:s:' + sessionId;
  const dKey = 'act:doc:' + doc;

  const pipe = r.pipeline();
  pipe.lpush(eKey, JSON.stringify(row));
  pipe.ltrim(eKey, 0, EVENT_CAP - 1);
  pipe.expire(eKey, TTL_SEC);
  pipe.zadd('act:recent', { score: now, member: sessionId });
  pipe.expire('act:recent', TTL_SEC);
  if (dwell) pipe.hincrby(dKey, String(page), dwell);
  pipe.expire(dKey, TTL_SEC);
  await pipe.exec();

  const prev = await r.hgetall(sKey) || {};
  const docs = parseDocs(prev.docs);
  if (!docs[doc]) docs[doc] = { pages: {}, total_ms: 0 };
  if (dwell) {
    docs[doc].pages[page] = (docs[doc].pages[page] || 0) + dwell;
    docs[doc].total_ms += dwell;
  }
  const total = (Number(prev.total_ms) || 0) + dwell;
  await r.hset(sKey, {
    email,
    started: prev.started || row.ts,
    last: row.ts,
    total_ms: String(total),
    docs: JSON.stringify(docs)
  });
  await r.expire(sKey, TTL_SEC);
  return true;
}

function sessionView(id, hash) {
  if (!hash || !hash.email) return null;
  const docs = parseDocs(hash.docs);
  const items = Object.keys(docs).map(function (docId) {
    const d = docs[docId];
    const title = (DOCS[docId] && DOCS[docId].title) || docId;
    return { id: docId, title, pages: d.pages || {}, total_ms: d.total_ms || 0 };
  }).sort(function (a, b) { return b.total_ms - a.total_ms; });
  return {
    id,
    email: hash.email,
    started: hash.started || null,
    last: hash.last || null,
    total_ms: Number(hash.total_ms) || 0,
    docs: items
  };
}

async function recentSessions(limit) {
  const r = redis();
  if (!r) return { store: false, sessions: [] };
  const ids = await r.zrange('act:recent', 0, Math.max(1, limit) - 1, { rev: true });
  if (!ids || !ids.length) return { store: true, sessions: [] };
  const sessions = [];
  for (let i = 0; i < ids.length; i++) {
    const hash = await r.hgetall('act:s:' + ids[i]);
    const view = sessionView(ids[i], hash);
    if (view) sessions.push(view);
  }
  return { store: true, sessions };
}

async function sessionsForEmail(email) {
  const r = redis();
  if (!r) return { store: false, sessions: [] };
  const raw = await r.lrange('act:e:' + email, 0, EVENT_CAP - 1);
  const byId = {};
  (raw || []).forEach(function (item) {
    let row = item;
    if (typeof row === 'string') {
      try { row = JSON.parse(row); } catch (e) { return; }
    }
    if (!row || !row.session_id) return;
    const id = row.session_id;
    if (!byId[id]) {
      byId[id] = {
        id, email,
        started: row.ts, last: row.ts, total_ms: 0, docs: {}
      };
    }
    const s = byId[id];
    if (row.ts < s.started) s.started = row.ts;
    if (row.ts > s.last) s.last = row.ts;
    const dwell = Number(row.dwell_ms) || 0;
    s.total_ms += dwell;
    if (!s.docs[row.doc]) s.docs[row.doc] = { pages: {}, total_ms: 0 };
    if (dwell) {
      s.docs[row.doc].pages[row.page] = (s.docs[row.doc].pages[row.page] || 0) + dwell;
      s.docs[row.doc].total_ms += dwell;
    }
  });
  const sessions = Object.keys(byId).map(function (id) {
    return sessionView(id, {
      email: byId[id].email,
      started: byId[id].started,
      last: byId[id].last,
      total_ms: byId[id].total_ms,
      docs: JSON.stringify(byId[id].docs)
    });
  }).sort(function (a, b) { return String(b.last).localeCompare(String(a.last)); });
  return { store: true, sessions };
}

module.exports = {
  redis, isOperator, knownDoc, record, recentSessions, sessionsForEmail
};
