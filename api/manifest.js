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
  'Arklight - Investor Memo.pdf': 'memo',
  'Certificate of Incorporation (DE)': 'cert',
  'Bylaws (adopted)': 'bylaws',
  '2026 Equity Incentive Plan': 'plan',
  'Arklight - Team Bios.pdf': 'bios',
  'Market Size & Analysis': 'market',
  'Competitor Landscape & Analysis': 'comp',
  'Use of Funds': 'funds',
  'Valinor MOU - Signed': 'valinor',
  'Oracle Proposal': 'oracle'
};

const TIERS = [
  { idx: '01', name: 'Pitch & Summary', sub: 'Deck · memo', status: 'cleared', docs: [
    { n: 'Arklight - Investor Deck.pdf', t: 'SYNC 07-08' },
    { n: 'Arklight - Investor Memo.pdf', t: 'SYNC 07-11' }]},
  { idx: '02', name: 'Company & Legal', sub: 'Formation · bylaws · equity plan', status: 'cleared', docs: [
    { n: 'Certificate of Incorporation (DE)', t: 'FILED 02-03' },
    { n: 'Bylaws (adopted)', t: '02-03' },
    { n: '2026 Equity Incentive Plan', t: '02-03' }]},
  { idx: '03', name: 'Team', sub: 'Founder & team bios', status: 'cleared', docs: [
    { n: 'Arklight - Team Bios.pdf', t: 'SYNC 07-13' }]},
  { idx: '04', name: 'Product & Market', sub: 'Demos · market · competitive', status: 'cleared', docs: [
    { n: 'Arklight OS Product Demo - Student', t: 'LOOM', kind: 'video',
      src: 'https://www.loom.com/embed/dfbb6c5e59cf4376b9dce541f82f0ec0' },
    { n: 'Employer Portal Product Demo', t: 'DEMO' },
    { n: 'Market Size & Analysis', t: 'SYNC' },
    { n: 'Competitor Landscape & Analysis', t: 'SYNC' }]},
  { idx: '05', name: 'Traction', sub: 'MOU · proposal · live pipeline', status: 'cleared', docs: [
    { n: 'Valinor MOU - Signed', t: 'SIGNED 06-15' },
    { n: 'Oracle Proposal', t: '06-15' },
    { n: 'Pipeline CRM Tracker', t: 'LIVE', board: true }]},
  { idx: '06', name: 'Financials', sub: 'Use of funds', status: 'cleared', docs: [
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
  { stage: 'Identified', accent: 'idle', count: 292, summary: 'prospects mapped<br>15 now engaged' },
  { stage: 'In Conversation', accent: 'steel', cards: [
    { co: 'AstroForge' }, { co: 'Varda Space Industries' },
    { co: 'Impulse Space' }, { co: 'Armada' }, { co: 'General Matter' },
    { co: 'Valar Atomics' }, { co: 'Nominal' }, { co: 'Neros Technologies' },
    { co: 'Northwood Space' }]},
  { stage: 'Advanced Conversation + Negotiation', accent: 'amber', cards: [
    { co: 'SpaceX', contact: 'Executive buy-in' },
    { co: 'Oracle', contact: 'Executive buy-in' },
    { co: 'Hadrian', contact: 'Executive buy-in' },
    { co: 'AMCA', contact: 'Executive buy-in' },
    { co: 'Anduril Industries', contact: 'Executive buy-in' },
    { co: 'Gecko Robotics', contact: 'Executive buy-in' }]},
  { stage: 'Pilot / LOI Signed', accent: 'verify', cards: [
    { co: 'Valinor', contact: 'Signed MOU · 06-15' }]}
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
    pipelineMeta: '15 active · 292 identified · updated 07-23'
  });
};
