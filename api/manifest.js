/**
 * GET /api/manifest
 *
 * Returns the data room's contents: document manifest, round stats, and the
 * live pipeline board. Requires a valid session — this data is confidential
 * (named prospects, deal stages, round terms) and must never ship in the
 * public HTML.
 */
const { getSession } = require('./_auth');

// Which manifest rows map to a real gated document (/api/doc?id=...).
const SRC = {
  'Arklight - Investor Deck.pdf': 'deck',
  'Market Size & Analysis': 'market',
  'Competitor Landscape & Analysis': 'comp',
  'Use of Funds': 'funds',
  'Valinor MOU - Signed': 'valinor'
};

const TIERS = [
  { idx: '01', name: 'Pitch & Summary', sub: 'Deck', status: 'cleared', docs: [
    { n: 'Arklight - Investor Deck.pdf', t: 'SYNC 07-08' }]},
  { idx: '02', name: 'Product & Market', sub: 'Demos · market · competitive', status: 'cleared', docs: [
    { n: 'Arklight OS Product Demo - Student', t: 'LOOM', kind: 'video',
      src: 'https://www.loom.com/embed/dfbb6c5e59cf4376b9dce541f82f0ec0' },
    { n: 'Talent Factory Product Demo - Employer', t: 'LOOM', kind: 'video',
      src: 'https://www.loom.com/embed/fda93ccf13824da9aecd118685f3617a' },
    { n: 'Market Size & Analysis', t: 'SYNC' },
    { n: 'Competitor Landscape & Analysis', t: 'SYNC' }]},
  { idx: '03', name: 'Traction', sub: 'MOU · live pipeline', status: 'cleared', docs: [
    { n: 'Valinor MOU - Signed', t: 'SIGNED 06-15' },
    { n: 'Pipeline CRM Tracker', t: 'LIVE', board: true }]},
  { idx: '04', name: 'Financials', sub: 'Use of funds', status: 'cleared', docs: [
    { n: 'Use of Funds', t: 'SYNC' }]}
];

// Tier-2 / Restricted block is hidden: there is nothing behind it yet, and
// listing documents we cannot serve only advertises what we hold. To re-enable,
// restore an object here and add tier: 2 entries to api/_docs.js.
const WALL = null;

const STATS = [
  { k: 'STAGE', v: 'PRE-SEED' },
  { k: 'INSTRUMENT', v: 'SAFE' },
  { k: 'CAP', v: '$3.0M' }
];

const PIPELINE = [
  { stage: 'Identified', accent: 'idle', count: 292, summary: 'prospects mapped<br>18 now engaged' },
  { stage: 'In Conversation', accent: 'steel', cards: [
    { co: 'AstroForge' }, { co: 'Varda Space Industries' },
    { co: 'Impulse Space' }, { co: 'Armada' }, { co: 'General Matter' },
    { co: 'Valar Atomics' }, { co: 'Nominal' }, { co: 'Neros Technologies' },
    { co: 'Northwood Space' }]},
  // bleed:true cards straddle Advanced and Signed - the same deal appears in
  // both columns with a bridging (amber->green) treatment.
  { stage: 'Advanced Conversation + Negotiation', accent: 'amber', cards: [
    { co: 'SpaceX', contact: 'In signing', bleed: true },
    { co: 'Anduril Industries', contact: 'In signing', bleed: true },
    { co: 'Mariana Minerals', contact: 'In signing', bleed: true },
    { co: 'Tesla', contact: 'Executive buy-in' },
    { co: 'Oracle', contact: 'Executive buy-in' },
    { co: 'Hadrian', contact: 'Executive buy-in' },
    { co: 'AMCA', contact: 'Executive buy-in' },
    { co: 'Gecko Robotics', contact: 'Executive buy-in' }]},
  { stage: 'Pilot / MOU Signed', accent: 'verify', cards: [
    { co: 'Valinor', contact: 'Signed MOU · 06-15' },
    { co: 'SpaceX', contact: 'In signing', bleed: true },
    { co: 'Anduril Industries', contact: 'In signing', bleed: true },
    { co: 'Mariana Minerals', contact: 'In signing', bleed: true }]}
];

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = getSession(req);
  if (!session) return res.status(401).json({ ok: false });

  // Attach the gated source for every row that maps to a real document.
  const tiers = TIERS.map(t => Object.assign({}, t, {
    docs: t.docs.map(d => {
      const id = SRC[d.n];
      return id ? Object.assign({}, d, { src: '/api/doc?id=' + id }) : d;
    })
  }));

  const docCount = tiers.reduce((n, t) => n + t.docs.length, 0) + (WALL ? WALL.docs.length : 0);

  return res.status(200).json({
    ok: true,
    email: session.email,
    stats: STATS.concat([{ k: 'DOCS', v: String(docCount), num: true }]),
    tiers,
    wall: WALL,
    pipeline: PIPELINE,
    pipelineMeta: '18 active · 292 identified'
  });
};
