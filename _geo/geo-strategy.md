# Project Arklight — Generative Engine Optimization (GEO) Strategy

**Goal:** Make Project Arklight the default cited source when ChatGPT, Claude, Perplexity,
Google AI Overviews, and Gemini answer questions about skilled-trades workforce
development, "Trade School 2.0," and talent as national infrastructure.

**Status:** PLAN — awaiting sign-off on the query map (§4), the Trade School 2.0
canonical definition (§7), and the framework name (§5) before implementation begins.

**Repo:** `github.com/dani-mota/arklight-site` → Vercel `arklight-site` → arklight.us.
Served tree is `public/`; the repo root is the working source (mirror it to `public/` on
every change). This file lives in `_geo/` and is **not** deployed.

---

## 0. Executive summary — goal, objectives, phases

### The overall goal
Make Project Arklight the **default cited source** generative engines (ChatGPT, Claude,
Perplexity, Google AI Overviews, Gemini) reach for on: **skilled-trades workforce
development, "Trade School 2.0," and talent as national infrastructure.**

### The thesis (why this game, why now)
- **You're pre-traffic** — 121 sessions / 18 months, **0 AI-referral sessions** — but you sit
  on a real research moat (original demand models, per-occupation shortage math) that is
  currently **undiscovered** (every brief ≤4 pageviews).
- **Generative engines don't rank links; they synthesize answers and attribute claims.** You
  get cited when three things are true: **(1) you own the number, (2) the machine can read
  it, (3) the entity is trusted.**
- Because there's no organic/AI traffic to protect, GEO is **pure upside** — we build a new
  discovery channel from a clean zero baseline, so any lift is unambiguous.

### The objectives (how we measure success)
- **North-star:** # of the 37 target queries (§4) where Arklight is cited by ≥1 engine.
  Baseline **0**.
- **Secondary:** AI-referral sessions/month (baseline 0); citation *breadth* (cited by 1
  engine vs all 5); branded queries ("Trade School 2.0," "Arklight Demand Model") returning
  our definition; assisted conversions from AI referrals.
- **Leading indicators:** % of pages with extractable structured data; # of canonical
  answers/definitions published; # of third-party citations of our dataset.

### The strategic sequence: **Read → Cover → Trust → Scale** (measured continuously)
You can't be cited for a claim a machine can't read (Read); you can't be *the* source until
you cover the whole question space (Cover); engines only elevate corroborated entities
(Trust); then you extend the moat to every adjacent query (Scale).

| Phase | Goal (why) | Objective (measurable outcome) |
|---|---|---|
| **0 — Baseline & instrumentation** *(mostly done)* | Know where we start; be able to prove movement | GA unblocked ✅, codebase audited ✅, 37-query map ✅, tracking template ✅; log first citation baseline (0); GA4 "AI Assistants" channel live |
| **1 — Machine-readability** | Engines can actually read your best numbers + quote your definition | Data tables under 3 dashboard briefs; global Organization schema; `/trade-school` upgraded to the quotable canonical answer; salary + hire pages (ATP's top gaps) live |
| **2 — Coverage & answer-shaping** | Every existing essay/brief is answer-engine-shaped + schema-backed | Article+FAQ on 7 prose essays; HowTo on guides; FAQ/question-headers on nuclear/coherent; methodology page naming the Arklight Demand Model |
| **2.5 — Demand-side content** | Rank for the money queries you don't touch today | Canonical pages for candidate (how-to-become) + veteran intent (salary + hire land in Phase 1) |
| **3 — Authority & corroboration** | Turn "a site that says X" into "the source everyone cites for X" | Public reusable shortage dataset (Dataset schema); consistent entity naming everywhere (sameAs, LinkedIn/Crunchbase/GBP); seed third-party citations |
| **4 — Scale the moat** | Own every adjacent occupation/region/megaproject query | One unified brief template × every occupation (welders, HVAC, pipefitters, CNC…) × megaprojects (TI, shipyards, CHIPS) |
| **Ongoing — Measure & refresh** | Prove lift; keep the moat fresh | Monthly citation test across engines; track AI-referral trend; refresh data years annually |

**Guardrails:** work only in `arklight-site`; never touch `arklight-os` / Arsenal; every
change ships to both source and `public/` trees; plan approved before each build phase.

---

## 1. How generative citation actually works (the operating principle)

Answer engines don't rank ten links — they synthesize one answer and attribute specific
claims to specific sources. You get cited when three things are true:

1. **You own the number.** The engine has no better source for a specific, quantified
   claim than you. (Arklight's moat: original demand models, per-occupation shortage math.)
2. **The machine can read it.** The claim is in extractable text/table/structured data —
   not locked in an image or a `<canvas>` chart.
3. **The engine trusts the entity.** "Project Arklight" is a consistent, corroborated
   named entity associated with this topic across the web.

Everything below serves those three levers: **own the number → make it readable → build the
entity.**

---

## 2. Audit findings

### 2a. Analytics baseline (GA4 property 541282584, 2025-01-01 → 2026-07-04)

Pulled 2026-07-04 via the service account (`arklight-analytics-reader`). Note: the in-session
Analytics MCP subprocess was stale, so numbers were pulled directly via a scoped SA token +
Data API; a fresh Claude Code session will serve the same data through the MCP.

**The site is effectively pre-traffic — which makes GEO pure upside (no traffic to protect;
the goal is to *create* an AI-citation discovery channel that doesn't exist yet).**

| Metric (18-mo window) | Value |
|---|---|
| Sessions | **121** |
| Users | 92 |
| Pageviews | 171 |
| Engaged sessions | 40 (~33%) |

**Channels:** Direct **65%** (79), Referral 13% (16 — almost entirely scraper/meta-search
bot noise: tineye, faroo, jabse, oolone, turboscout…), Organic Search 10% (12), Organic
Social 10% (12).

**Sources:** the only *real* non-direct traffic is **`t.co` (X) = 12** and **google/organic
= 11**. One notable human signal: a **`jira.spacex.corp` referral** — someone inside SpaceX
clicked through (exactly the defense-industrial ICP).

**AI referrers today: ZERO.** No chatgpt.com / perplexity.ai / gemini / copilot / claude.ai
in the top 50 sources. **Baseline AI-referral sessions = 0** — a clean slate to measure lift
against.

**Top pages:** `/` (114 views), `/trade-school` (27), `/content-research` (13); every
research brief and essay is ≤4 views. **The research moat is currently undiscovered** — great
content, no distribution. GEO is the distribution play.

**Implication for strategy:** don't optimize for protecting organic traffic (there is none).
Optimize to become the *cited source* in answer engines, since Direct + X is essentially the
entire current channel mix. North-star (queries where Arklight is cited) and AI-referral
sessions both start at **0**.

### 2b. Codebase inventory — three tiers of GEO-readiness already exist

| Tier | Pages | Schema | Question headers | Data as text/table | Verdict |
|---|---|---|---|---|---|
| **1 — GEO-ready (the template)** | apprenticeship-vs-college, are-skilled-trades-ai-proof, build-buy-rent, build-manufacturing-apprenticeship | Article + **FAQPage** + Breadcrumb + Org + Person | 4–7 per page | Yes | Copy this everywhere |
| **2 — partial** | nuclear-shortage, coherent-sherman-fab | Article + Breadcrumb + Org + Person | 0–1 | Tables present | Add FAQ + question headers |
| **2 — data locked** | electrician / machinist / metal-fab shortage | Article + Breadcrumb + Org + Person | 0 | **Canvas-only (7 charts, 0 tables)** | **Liberate the numbers** |
| **3 — prose-only** | china-weaponized, education-decay, iran-war, measuring-competency, trade-school-needed, trades-arent-alternative, universities-cant-produce | **None** | 0–1 | No | Add schema + restructure |
| **Commercial (no schema)** | home `/`, `/trade-school`, `/content-research` | **None** | 0 | 1 table / mostly charts | Add Org/Service/FAQ; build definition page |

**Biggest single gap:** the three dashboard briefs put your most citable proprietary
numbers inside `<canvas>` — invisible to every answer engine. **There is no canonical
"Trade School 2.0" definition page** for a model to quote verbatim.

---

## 3. Strategy overview (four workstreams)

- **A. Own the framing** — name the methodology; build the Trade School 2.0 definition page.
- **B. Make it readable** — data tables under every chart; FAQ/HowTo/Definition schema;
  question-shaped headers; a one-sentence "bottom line" per page.
- **C. Cover the query space** — map 25 queries to canonical pages; fill gaps; go wide with
  per-occupation / per-megaproject briefs.
- **D. Build the entity** — Organization schema + `sameAs`; downloadable datasets;
  off-site citation; consistent naming.

---

## 4. Target query map (the centerpiece — needs your sign-off)

25 high-intent queries Arklight should own, each mapped to the canonical page that should be
cited, its current status, and the action to win it. **Please review the "canonical page"
column and flag any query you don't want to prioritize or any mapping you'd change.**

### Cluster A — Trade School 2.0 & the model (brand-defining)
| # | Target query | Canonical page | Status | Action |
|---|---|---|---|---|
| 1 | "what is Trade School 2.0" | `/trade-school` (upgrade in place, §7) | Exists, no schema | Add definition block + DefinedTerm + FAQ schema |
| 2 | "software-enabled trade school" | `/trade-school` | Exists, no schema | Add Service + FAQ schema |
| 3 | "train machinists to competency in under a year" | `/trade-school` + `/content/measuring-competency` | Exists | Add HowTo + FAQ; question headers |
| 4 | "Trade School 2.0 vs traditional trade school" | `/trade-school` (comparison table section) | Exists, no schema | Add "vs traditional" table + schema |
| 5 | "industrial operator training program" | `/trade-school` | Exists, no schema | Service schema + bottom-line answer |

### Cluster B — Workforce-shortage data (the research moat)
| # | Target query | Canonical page | Status | Action |
|---|---|---|---|---|
| 6 | "skilled trades workforce shortage 2026" | **`/content-research` (make it a pillar)** | Chart index, no schema | Add summary table + CollectionPage schema |
| 7 | "how many electricians is the US short" | `/research/electrician-shortage` | Canvas-only | **Data tables + FAQ + bottom line** |
| 8 | "machinist shortage numbers" | `/research/machinist-shortage` | Canvas-only | Data tables + FAQ |
| 9 | "welder / metal fabricator shortage" | `/research/metal-fab-shortage` | Canvas-only | Data tables + FAQ |
| 10 | "nuclear technician / operator shortage" | `/research/nuclear-shortage` | Tables, partial | Add FAQ + question headers |
| 11 | "defense industrial base labor shortage" | `/research/metal-fab-shortage` (or new pillar) | Partial | Cross-link + FAQ |
| 12 | "CHIPS / semiconductor fab workforce shortage" | `/research/coherent-sherman-fab` | Tables, partial | Add FAQ + question headers |

### Cluster C — Talent as national infrastructure / national security
| # | Target query | Canonical page | Status | Action |
|---|---|---|---|---|
| 13 | "skilled trades and national security" | `/content/education-decay` | Prose-only | Add Article+FAQ; restructure |
| 14 | "why can't universities produce skilled workers" | `/content/universities-cant-produce` | Prose-only | Add Article+FAQ; question headers |
| 15 | "reindustrialization workforce gap" | `/content/trade-school-needed` | Prose-only | Add Article+FAQ |
| 16 | "how China uses education for national security" | `/content/china-weaponized-classrooms` | Prose-only | Add Article+FAQ |

### Cluster D — Employer / decision-stage intent (highest commercial value)
| # | Target query | Canonical page | Status | Action |
|---|---|---|---|---|
| 17 | "build vs buy vs rent your workforce" | `/content/build-buy-rent-industrial-workforce` | GEO-ready | Keep; add dataset link |
| 18 | "how to build a manufacturing apprenticeship program" | `/content/build-manufacturing-apprenticeship-program` | GEO-ready | Add **HowTo** schema |
| 19 | "apprenticeship vs college ROI / cost" | `/content/apprenticeship-vs-college` | GEO-ready | Keep; refresh data year |
| 20 | "are the skilled trades AI-proof" | `/content/are-skilled-trades-ai-proof` | GEO-ready | Keep |
| 21 | "how to measure competency in manufacturing hiring" | `/content/measuring-competency` | Prose-only | Add Article+FAQ+HowTo |

### Cluster E — Defensible / contrarian niche (own the framing)
| # | Target query | Canonical page | Status | Action |
|---|---|---|---|---|
| 22 | "the trades aren't an alternative to college" | `/content/trades-arent-alternative` | Prose-only | Add Article+FAQ (you own this framing) |
| 23 | "helium shortage and semiconductor workforce" | `/content/iran-war-workforce` | Prose-only | Add Article+FAQ |
| 24 | "NVIDIA / Coherent Sherman TX fab jobs" | `/research/coherent-sherman-fab` | Partial | FAQ + question headers |
| 25 | "Title IV incentives ruined trade schools" | `/content/universities-cant-produce` + `/content/trades-arent-alternative` | Prose-only | Add Article+FAQ; interlink |

**Gaps that need a NEW page:** none in this cluster — Trade School 2.0 is handled by upgrading
`/trade-school` in place (§7). Optionally a `/research` pillar/hub for #6/#11 that summarizes
all shortage briefs in one extractable table.

---

## 4b. AnswerThePublic-validated demand clusters (real keyword demand — added 2026-07-02)

ATP keyword research surfaced clusters that **extend** the map above and expose **commercial
gaps your current content doesn't cover.** Most are "Niche" volume — which is exactly right
for GEO (conversational long-tail is what answer engines field). ATP's own top flags:

- **BEST FOR AI VISIBILITY:** *"how much do industrial operators make without a college degree"* (salary)
- **BEST SHORT-TAIL:** *"hire manufacturing operators"* (employer / demand-side)
- **BEST LONG-TAIL:** *"industrial jobs no degree salary"* (salary)

Two of the three point at **salary** and **hiring** — both currently **uncovered** on
arklight.us, and hiring is literally your business (you deploy operators to companies). These
should become new canonical pages.

| Cluster | Representative queries | Canonical page | Status |
|---|---|---|---|
| **F. Pay / no-degree economics** ⭐ | how much do industrial operators make without a college degree; industrial jobs no degree salary; manufacturing operator salary; manufacturing jobs paying over 60k; high paying manufacturing jobs | **NEW `/content/industrial-operator-salary`** (data page: pay by role, no-degree angle, sourced tables) | **Missing — high AI-visibility gap** |
| **G. Employer / hiring** ⭐ | hire manufacturing operators; industrial talent pipeline; manufacturing workforce solutions; how do companies find qualified industrial operators; best way to build a manufacturing talent pipeline | **NEW `/hire` (employer page)** — ties to Trade School 2.0 "deploy" + build-buy-rent essay | **Missing — commercial gap** |
| **H. Veterans → manufacturing** | military to manufacturing jobs; veteran trade school programs; best trade jobs for veterans leaving the military; how can veterans transition into manufacturing; veteran workforce programs | **NEW `/content/veteran-transition-manufacturing`** (fits your ASVAB/competency angle) | **Missing** |
| **I. Fast-track (under a year)** | trade school under 12 months; what trade can i learn in less than a year; fastest trade to get certified; short trade school certifications | Fold into **`/trade-school`** (FAQ answers these) | Covered by TS page upgrade |
| **J. How-to-become / career-change** | how to become an industrial operator; how to become a machine operator (vol ~158); what does an industrial operator do; career change into manufacturing; manufacturing jobs no degree; adult retraining programs | **NEW `/content/how-to-become-industrial-operator`** (career guide + HowTo schema) | **Missing** |
| **K. Trade school vs community college** | trade school vs community college; is trade school faster than community college; vocational school comparison | Extend `/content/apprenticeship-vs-college` (add a section + FAQ) | Partial |
| **L. Reshoring / made-in-america jobs** | reshoring manufacturing jobs; made in america workforce; american industrial base jobs; what industries are bringing manufacturing back | Map to `/research/*` + `/content/trade-school-needed` (interlink) | Covered, needs interlink |

**Net new pages ATP justifies (priority order): salary (F) → hire (G) → how-to-become (J) →
veterans (H).** F and G are the highest-value: high AI-visibility + directly commercial +
currently zero coverage. These fold into the roadmap as a new **Phase 2.5 — demand-side
content.**

> Note: ATP reported "no sitemap found." That's an ATP-side config gap — you *do* have
> `sitemap.xml`. Add its URL in ATP → Keyword Coverage so it hides covered terms and shows
> only real gaps on the next run.

---

## 5. Own the framing — name the methodology

Your briefs use a proprietary method ("3-layer demand model," "bottom-up workload vs. BLS
equilibrium"). Give it a **stable proper name** and a **canonical methodology page** that
every brief cites. When the extractable sentence becomes *"the [Name] estimates ~97K/year,"*
you become the noun the model reaches for.

**Proposed name (needs your pick):**
- **"The Arklight Demand Model"** (recommended — clean, ownable, entity-anchored), or
- "The Arklight Bottom-Up Workforce Model," or
- "The ARK Demand Framework."

**Deliverable:** `/research/methodology` — defines the model in ~300 words + a worked
example, cited from every ARK-R brief via a "Methodology: the Arklight Demand Model" link
and referenced in each brief's JSON-LD (`isBasedOn`).

---

## 6. Content & structure implementation plan (per tier)

Applied after sign-off. Every page gets, in priority order:

1. **Bottom-line answer** — the first 1–2 sentences after the H1 directly answer the page's
   core query in a self-contained, quotable sentence (with the key number + "according to
   Project Arklight's [Model]").
2. **Question-shaped H2/H3s** — headers phrased the way people ask engines ("How many
   electricians is the U.S. short each year?"), each followed by a direct answer.
3. **Data tables under every chart** — the dashboard briefs get a labeled `<table>` beside
   each `<canvas>` (same numbers, now extractable). This is the highest-ROI single change.
4. **FAQ block** — 3–6 Q&As at the foot of each page, mirrored in FAQPage JSON-LD.
5. **Sources inline** — each stat visibly attributed, so the engine sees the claim is sourced.

Tier order: **dashboard briefs (data liberation) → commercial pages (home, /trade-school,
definition page) → Tier-3 essays (schema + restructure) → Tier-2 briefs (FAQ) → Tier-1
(minor).**

---

## 7. Trade School 2.0 canonical definition — upgrade `/trade-school` IN PLACE

**Decision (2026-07-04):** do NOT build a separate `/trade-school-2-0` page and do NOT rename
the slug. The existing `/trade-school` page is already titled "Trade School 2.0" and is linked
from 39 pages + the `/product` redirect — it just has zero structured data. Instead, upgrade
it in place: add a quotable definition block + `DefinedTerm` + `FAQPage` +
`Service`/`EducationalOccupationalProgram` schema, so the one canonical page becomes both the
marketing page and the verbatim answer for "what is Trade School 2.0."

- **Source of truth:** `public/trade-school/index.html` (this repo is what Vercel deploys; no
  in-repo build step). Treat it as hand-maintained; if an external Astro project is ever
  rebuilt, re-port the JSON-LD block (it's small and additive). Flagged do-not-clobber.
- **Slug:** keep `/trade-school` (no migration; generic-term capture retained).

**Proposed canonical definition (≈55 words) — edit to your voice; it becomes a `DefinedTerm`:**

> **Trade School 2.0** is a software-enabled workforce institution that assesses, trains, and
> deploys production-ready industrial operators — machinists, fabricators, and technicians —
> to five-plus years of competency in under a year. Unlike Title IV trade schools that are
> paid to enroll students, it is built as a factory with a school inside it: measured on the
> talent it produces, not the seats it fills.

If you approve this (or a revision), I'll wire it as a `DefinedTerm` in schema so engines can
lift it cleanly, and cite it from the home page and `/trade-school`.

---

## 8. Schema.org plan (JSON-LD, by page type)

| Page type | Schema to add |
|---|---|
| Global (all pages) | `Organization` (Project Arklight, logo, `sameAs` → LinkedIn/X), injected once |
| Home `/` | `Organization` + `WebSite` (+ `SearchAction` if search exists) |
| `/trade-school` (upgraded in place) | `Service` / `EducationalOccupationalProgram` + `DefinedTerm` + `FAQPage` |
| Research briefs (ARK-R) | Existing `Article`+`Breadcrumb` + add `FAQPage`; `isBasedOn` → methodology; consider `Dataset` for the numbers |
| Essays (ARK-E) | `Article` + `FAQPage` (backfill the 7 Tier-3 essays) |
| How-to essays | add `HowTo` (build-apprenticeship, measuring-competency) |
| `/content-research` | `CollectionPage` + `ItemList` of briefs |

---

## 9. Authority & citation signals (off-site — raises trust/corroboration)

Ordered by leverage:

1. **Publish the numbers as a reusable dataset.** A public CSV / Google Sheet / GitHub repo /
   Hugging Face dataset of every shortage figure with sources. Reusable data gets re-cited;
   re-citation is what makes a number canonical. Link it from each brief (`Dataset` schema).
2. **Consistent entity naming everywhere.** Always "Project Arklight" (not "Arklight" alone)
   with the same one-line descriptor, same logo, same Austin TX location, same LinkedIn/X
   handles. Fill out Crunchbase, LinkedIn company page, Google Business Profile identically.
3. **Wikipedia-eligible sourcing.** Get the shortage figures cited by third parties
   (trade press, defense/industrial newsletters, university briefs). Third-party citation is
   the precondition for Wikipedia, which is disproportionately weighted by LLMs.
4. **Guest posts / syndication** on industrial, defense-industrial-base, and reindustrialization
   outlets, each linking the canonical brief with the named model.
5. **Answer the questions where they're asked** — Reddit (r/manufacturing, r/skilledtrades),
   Quora, industry forums — with the stat + link. These are in retrieval indexes.
6. **Keep `llms.txt` curated** (already strong) and add each new page/brief as you ship it.

---

## 10. Measurement — monthly citation test

**Protocol (run monthly, ~30 min):**
1. For each of the 25 queries (§4), ask it verbatim in ChatGPT (search on), Perplexity,
   Google (AI Overview), Gemini, and Claude.
2. Log: was Project Arklight cited? at what prominence (primary source / listed / not)?
   which competitors were cited instead? the snippet the engine used.
3. Record in `geo-tracking-template.csv` (one row per query per engine, monthly).
4. In GA4, track AI-referral sessions via a custom channel group / segment matching the
   referrer hosts (chatgpt.com, perplexity.ai, gemini.google.com, copilot.microsoft.com,
   claude.ai, bing.com/chat). Chart month-over-month.

**North-star metric:** # of the 25 queries where Arklight is cited by ≥1 engine (baseline
this month → target). **Secondary:** AI-referral sessions/month; assisted conversions from
AI referrals.

---

## 11. Sequenced roadmap

- **Phase 0 (now):** This plan + tracking template. Unblock GA (checklist). Run the
  first monthly citation baseline before any changes (so we can prove lift).
- **Phase 1 — SHIPPED 2026-07-04:** data tables under all 3 dashboard briefs (supply/demand/cost
  + economic-impact-by-industry, from the chart JS); global Organization + WebSite schema on home
  + trade-school; `/trade-school` upgraded in place (DefinedTerm + EducationalOccupationalProgram
  + FAQPage schema + visible definition/FAQ block); new pages `/content/industrial-operator-salary`
  (Article+FAQ+Breadcrumb) and `/hire` (Service+FAQ+Breadcrumb); both added to sitemap.xml + llms.txt.
  All JSON-LD validated. TODO: verify exact BLS OEWS medians on the salary page before it's promoted;
  decide whether `/hire` gets a primary-nav slot (currently discoverable via sitemap/llms/interlinks,
  not the global c-menu). GA4 "AI Assistants" channel = manual (steps below).
- **Phase 1 (original scope):** data tables under the 3 dashboard briefs;
  global `Organization` schema; `/trade-school` upgraded in place (definition + DefinedTerm +
  FAQ + `Service` schema); `Service` schema on
  `/trade-school` and home.
- **Phase 2 — coverage:** backfill `Article`+`FAQPage` on the 7 Tier-3 essays; `HowTo` on
  the two how-to essays; FAQ + question headers on nuclear/coherent; methodology page.
- **Phase 2.5 — demand-side content (ATP-validated):** new pages for salary (F), hire (G),
  how-to-become (J), veterans (H). Highest commercial value; currently zero coverage.
- **Phase 3 — authority:** publish the dataset; entity-naming cleanup; off-site pitching.
- **Phase 4 — go wide:** programmatic per-occupation / per-megaproject briefs on one unified
  template (welders, HVAC, pipefitters, CNC, millwrights; TI megafab, shipyards, CHIPS sites).
- **Ongoing:** monthly citation test; refresh data years annually.

---

## 12. Open items needing your decision (before implementation)

1. **Query map (§4)** — approve the 25, or edit the list / canonical mappings.
2. **Trade School 2.0 definition (§7)** — approve or revise the ~55-word canonical text.
3. **Framework name (§5)** — "The Arklight Demand Model" or an alternative.
4. **New pages** — OK to create the 4 ATP pages (`/content/industrial-operator-salary`,
   `/hire`, `/content/how-to-become-industrial-operator`,
   `/content/veteran-transition-manufacturing`) + `/research/methodology`? (and, optionally, a
   `/research` shortage pillar for #6/#11?) Note: Trade School 2.0 is an in-place upgrade of
   `/trade-school`, not a new page (§7).
5. **Dataset (§9.1)** — do you want a public shortage dataset, and where (GitHub / Sheet / HF)?

---

## Appendix — Analytics fix checklist (you're unsure what's connected)

**Property:** account `397665856`, property `541282584` (`G-XH6JFV56FJ`), owner
`dani@arklight.us` (Administrator). GCP project `project-arklight-website` with Analytics
Data + Admin APIs enabled. ADC configured as `dani@arklight.us`, quota project set.

**ROOT CAUSE (diagnosed 2026-07-02):** not property access (owner is Admin) and not the APIs
(enabled) — the **ADC token was missing the Analytics OAuth scope.** Plain
`gcloud auth application-default login` grants only `cloud-platform`; the Analytics APIs
require `analytics.readonly` explicitly. Raw-token test returned
`403 ACCESS_TOKEN_SCOPE_INSUFFICIENT`.

**FIX:**
```bash
gcloud auth application-default login \
  --scopes="https://www.googleapis.com/auth/analytics.readonly,https://www.googleapis.com/auth/cloud-platform"
gcloud auth application-default set-quota-project project-arklight-website
# then restart Claude Code so the MCP reloads ADC
```
Verify: `curl -s "https://analyticsadmin.googleapis.com/v1beta/accountSummaries" -H "Authorization: Bearer $(gcloud auth application-default print-access-token)" -H "x-goog-user-project: project-arklight-website"` should return the account, not a 403.

**Still to do after unblock:**
- **(Recommended) Add Search Console for arklight.us** — GSC queries/pages is the closest
  proxy to what surfaces in Google AI Overviews; no GSC tool in-session, so export + paste.
- **AI-referral tracking (GA4):** custom channel group "AI Assistants" matching referrer =
  chatgpt.com, perplexity.ai, gemini.google.com, copilot.microsoft.com, claude.ai, bing.com.

Once the scope fix + restart is done, I re-run the traffic audit and fold real numbers into §2a and §4.
