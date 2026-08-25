/**
 * Document registry for the investor data room.
 *
 * The files themselves live in Vercel Blob, NEVER in this repo
 * (arklight-site is a PUBLIC GitHub repo — committing them would expose them).
 *
 * `tier: 2` documents require an email listed in TIER2_ALLOWLIST.
 * Everything else is available to any signed-in investor.
 */
const BLOB_PREFIX = 'investor-room/';

const DOCS = {
  deck:   { file: 'arklight-investor-deck.pdf',              title: 'Arklight - Pitch Deck',          tier: 1 },
  cert:   { file: 'arklight-certificate-of-incorporation.pdf', title: 'Certificate of Incorporation',    tier: 1 },
  bylaws: { file: 'arklight-bylaws.pdf',                     title: 'Bylaws',                            tier: 1 },
  plan:   { file: 'arklight-equity-incentive-plan.pdf',      title: '2026 Equity Incentive Plan',        tier: 1 },
  bios:   { file: 'arklight-team-bios.pdf',                  title: 'Team Bios',                         tier: 1 },
  market: { file: 'arklight-market-analysis.pdf',            title: 'Market Size & Analysis',            tier: 1 },
  comp:   { file: 'arklight-competitive-landscape.pdf',      title: 'Competitor Landscape & Analysis',   tier: 1 },
  funds:  { file: 'arklight-use-of-funds.pdf',               title: 'Use of Funds',                      tier: 1 },
  valinor:{ file: 'arklight-valinor-mou.pdf',                title: 'Valinor Talent MOU (signed)',       tier: 1 },
  oracle: { file: 'arklight-oracle-proposal.pdf',            title: 'Oracle Proposal',                   tier: 1 }

  // When the financial model is ready, add it behind the second wall:
  // model: { file:'arklight-financial-model.pdf', title:'Financial Model & Projections', tier: 2 },
};

/**
 * Exact Blob pathname for a document.
 * The store is PRIVATE, so reads require the token — the pathname can be
 * deterministic and does not need an unguessable suffix.
 */
function blobPath(doc) {
  return BLOB_PREFIX + doc.file;
}

module.exports = { DOCS, BLOB_PREFIX, blobPath };
