# Arklight GEO → Leads Engine — Operating Plan (B2B / DIB)
*Canonical operating plan as of 2026-07. Supersedes the pre-pivot framing in `geo-strategy.md` for anything B2B. Companions: `icp-buyer-personas.md`, `atp-seed-strategy.md`, `measurement-handoff.md`.*

## ★ Overarching goal
Turn GEO/SEO into a **repeatable engine that converts DIB-employer demand into qualified inbound leads** — by owning the exact questions the two buyer personas ask, answering them with more genuine value than anyone else, and capturing them the moment they arrive.

**North star:** qualified inbound leads from the two personas (Head of Talent, Director of Workforce Development). Traffic and citations are *leading indicators*, not the goal.

## The engine in one line
**Seeds** (their questions) → **Content** (value-first answers) → **Visibility** (AI citations + search) → **Capture** (traceable) → **Leads** (Notion, source-tagged) → **Learn** (which clusters convert) → repeat, pouring effort into whatever produces leads.

## Where we are (state, 2026-07)
- **Visibility engine:** mostly built — 33 pages, schema everywhere, open dataset, entity standardized. Now refocused B2B-only.
- **Seed strategy:** done — ICP + ATP seed map, value-first, apprenticeship-registration cut and reframed.
- **Measurement:** baseline live — 0/10 citations (clean "before"), GA4 enterprise-referrer tripwire armed, `buyer_contact_click` key event.
- **Conversion:** **BROKEN** — a lead today is an untracked email to dani@; the money pages (briefs, `/hire`) have weak/no capture; no source attribution; nothing lands in Notion.
- **Traffic:** pre-traffic (~124 sessions, ~6 weeks of data, a third bots).

---

## The plan — phases with objectives

### Phase 1 — Run the seeds, lock the target map *(this week)* · owner: Domingo runs ATP + me
**Objective:** a ranked content backlog grounded in the buyers' real questions and words.
- Run the **Tier 1 seeds** (from `atp-seed-strategy.md`) in ATP, per persona. Harvest **questions + language, not volume.**
- I filter the output through the two personas → a ranked **question → content** map (sharpen vs build), tagged by persona / funnel stage / emotional payload.
- **Done when:** a prioritized backlog exists in the buyers' own words.

### Phase 2 — Close the conversion spine *(this week, in parallel)* · owner: me + Domingo (Notion token)
**Objective:** every hand-raise becomes a **named, source-attributed lead in Notion.** Nothing else converts or is measurable without this.
- `/api/contact` → write to **Notion** + capture `source_page` / UTM (keep the email ping).
- Put a **real, intent-matched capture** on the money pages — briefs + `/hire` — buyer CTA or booking link, not a 2-click detour.
- Turn the **fake subscribe** into a real email capture → Notion (the mid-funnel net).
- Fire a **GA4 key event on submit**; stand up a **visitor-ID tool** (RB2B / Vector / Leadfeeder) so anonymous B2B traffic becomes *named companies*.
- **Done when:** a test submission on the submarine brief shows up in Notion tagged to that page, and GA4 logs the submit.

### Phase 3 — Sharpen what we already own *(weeks 2-4)* · owner: me
**Objective:** get cited fast on questions where a page already exists.
- Tier 1 sharpen to the exact ATP questions (H2s / FAQ / schema): `measuring-competency`, `build-buy-rent-industrial-workforce`, `clearable-manufacturing-talent`, `manufacturing-workforce-development`, `/hire`, and the shortage briefs.
- **Reframe** `build-manufacturing-apprenticeship-program` → employer-run training, lead with "skip the DOL paperwork."
- **Done when:** each Tier 1 page answers its target question in the buyer's words, schema-valid, with capture attached.

### Phase 4 — Build the high-conversion gaps *(weeks 3-6)* · owner: me
**Objective:** own the two personas' highest-intent, zero-competition questions.
- **Persona A (Head of Talent):** *"The real cost of not staffing your ramp"* (board ammunition) · *"How to de-risk building your workforce pipeline"* (removes the block on their yes).
- **Persona B (Dir. WFD):** *"Apprenticeship vs. in-house training program — which do you actually need?"* (skip the paperwork) · *"Time to competency: how fast can you really train a machinist?"* · *"Capturing tribal knowledge before it retires."*
- Each ships with the Phase-2 capture built in.
- **Done when:** the gap pages are live, schema'd, captured, and in the tracker.

### Phase 5 — Run the loop *(ongoing; monthly measure, weekly produce)* · owner: Domingo triggers, me executes
**Objective:** the system self-steers toward lead-producing clusters.
- **Measure:** citations (tracker) + GA4 (visits / enterprise referrals / submits) + Notion (leads by source).
- **Diagnose** per cluster: Win (produced a lead) / Flat (traffic, no lead) / Fail (no traction). Form one hypothesis, set next action.
- **Decide** the next batch by value: effort flows to clusters producing leads.
- **Score** on citations + enterprise referrals now; graduate the score to **qualified leads** once volume allows.
- **Done when:** it's a standing rhythm and the Ledger drives the backlog.

---

## The disciplines (guardrails on everything)
1. **Value-first:** every asset passes *"does this help them do their job, make their case, or reduce their risk?"* If it only sells Arklight, cut it.
2. **Register:** peer, evidence-first, no hype — the only voice that survives their earned skepticism.
3. **Judge at the cluster level** over multi-week windows; **respect latency** (monthly clock, not hourly); **kill vanity** (leads are the score, not impressions).
4. **Persona A gets evidence + de-risking; Persona B gets method + speed.** Never sell B on "why build."
5. **Avoid the registered-apprenticeship frame** — own the "skip the DOL paperwork" answer instead.

## The one input that upgrades everything
Verbatim **fear-language from real discovery calls** → feed into `icp-buyer-personas.md` → re-tune the seeds. ATP gets ~70% of their vocabulary; the calls get the rest.

## Immediate next 3 moves
1. **Domingo:** run the Tier 1 seeds in ATP, and get me a Notion integration token + Leads DB (or I spec the schema first).
2. **Me:** build the conversion spine (contact → Notion + source attribution) — the thing that makes leads real and measurable.
3. **Me (no dependency, can start now):** reframe the apprenticeship page + draft the two Persona-A gap pages (cost-of-not-staffing, de-risk-the-build).
