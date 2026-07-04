# Agent brief: ATP + question-landscape harvest for Project Arklight GEO

Give this whole file to the Claude coworker/agent. It is self-contained.

---

## Your role
You are a research agent helping **Project Arklight** win **Generative Engine Optimization
(GEO)** — getting Arklight's pages cited when people ask AI assistants (ChatGPT, Perplexity,
Google AI Overviews, Gemini, Claude) about skilled-trades workforce topics. Answer engines
answer *questions*, so your job is to harvest the real questions people ask and map each one
to the page that should answer it.

## About Arklight (context you need to map correctly)
Arklight trains and deploys production-ready industrial operators (machinists, welders,
fabricators, technicians) and publishes original research on the U.S. skilled-labor shortage.
Its program is **"Trade School 2.0."** There are **two audiences**:
- **Candidate** — individuals researching careers, pay, and training ("how much do machinists
  make," "trade school worth it").
- **Employer / Defense-Industrial-Base buyer** — VP Manufacturing, skilled-trades talent
  acquisition, and workforce-development leads at primes, fabs, and shipyards (SpaceX,
  Anduril, Electric Boat/HII, TI/Coherent). They buy **production-ready, clearable, US-person
  talent at volume, fast.** This is the revenue side and is a priority.

## The objective your output serves
For every question, we need to know: which page should be the cited answer, is that page
built yet, and how important is it. So your deliverable is a **mapped, prioritized question
set**, not a raw list.

## Task
1. If you have access to **AnswerThePublic** (answerthepublic.com, Arklight account), run each
   seed and pull its **Questions** and **Comparisons** wheels. First, in ATP → Keyword
   Coverage, add the sitemap `https://www.arklight.us/sitemap.xml` so it flags only gaps.
2. If you do NOT have ATP access, harvest the equivalent from Google "People Also Ask,"
   autocomplete, Reddit (r/manufacturing, r/machinists, r/skilledtrades, r/AskEngineers),
   Quora, and industry forums. State which sources you used.
3. Dedupe, then map and prioritize per the output spec below.

## Seed keywords (by group)
- **G1 Careers (candidate, high pri):** industrial operator, machine operator, machinist, CNC machinist, welder, metal fabricator, electrician apprentice
- **G2 Money (candidate, high pri):** machinist salary, welder salary, manufacturing jobs no degree, highest paying trades
- **G3 Employer (buyer, high pri):** hire machinists, hire manufacturing workers, industrial talent pipeline
- **G4 Training/school (candidate):** trade school, apprenticeship, trade school vs community college
- **G5 Themes:** skilled labor shortage, reshoring jobs, veteran manufacturing jobs
- **G6 Workforce development / DIB (buyer, high pri):** manufacturing workforce development, workforce development program, defense industrial base workforce, apprenticeship program for manufacturers, how to scale manufacturing hiring, skilled trades staffing, clearable manufacturing talent, ITAR manufacturing jobs

## Existing Arklight pages (map questions to these URLs)
- `/` home · `/trade-school` (Trade School 2.0 definition + program) · `/hire` (employer) · `/content-research` (hub)
- Salary: `/content/industrial-operator-salary`
- Guides/essays: `/content/apprenticeship-vs-college`, `/content/are-skilled-trades-ai-proof`, `/content/build-buy-rent-industrial-workforce`, `/content/build-manufacturing-apprenticeship-program`, `/content/measuring-competency`, `/content/trades-arent-alternative`, `/content/trade-school-needed`, `/content/universities-cant-produce`, `/content/education-decay`, `/content/iran-war-workforce`, `/content/china-weaponized-classrooms`
- Research briefs: `/research/electrician-shortage`, `/research/machinist-shortage`, `/research/metal-fab-shortage`, `/research/nuclear-shortage`, `/research/coherent-sherman-fab`, `/research/methodology` (the "Arklight Demand Model")
- Known planned pages (map to these if they fit): `/content/veteran-transition-manufacturing`, `/content/how-to-become-industrial-operator`, a workforce-development page, a clearable/DIB-talent brief.

If a cluster of real questions has **no good home** above, propose a NEW page.

## Output format (return exactly this)
**Section 1 — Mapped questions**, one table per cluster:

| # | Question (verbatim) | Audience | Intent | Target page | Priority |
|---|---|---|---|---|---|

- Audience: `Candidate` or `Employer`
- Intent: `Info` / `Commercial` / `Comparison` / `Definitional`
- Target page: an existing URL above, or `NEW: /proposed-slug`
- Priority: `High` / `Med` / `Low` (High = clear intent + we're weak/absent on it; flag any ATP "AI visibility"/"Opportunity" badges as High)

**Section 2 — Proposed new pages:** for each, `slug`, one-line rationale, audience, and the 5–10 questions it would answer.

**Section 3 — Top 20 to build first:** the 20 highest-priority questions overall (mix of both audiences), each with its target page — this is what Arklight builds next.

**Section 4 — Notes:** sources used, any surprising demand, and gaps you couldn't map.

## Done when
All six seed groups are harvested, deduped, mapped to a page (existing or proposed), and the
Top-20 list is produced. Keep questions in the **user's real wording** — that wording is what
matches AI prompts, so don't paraphrase them.

Return the four sections as markdown. That output goes straight into building the pages.
