# Analytics Diagnosis — GA4 + Search Console (2026-07-23)
*Data: GA4 property 541282584, last 30 days. GSC `sc-domain:arklight.us`, Jun 23 – Jul 21 (28d). Code audit of both trees. Companion to `geo-lead-engine-plan.md`, `employer-question-map.md`.*

## The headline
**The buyer has no door.** `/hire` is not linked from the home page or `/trade-school` — the two pages that carry 96% of all traffic. It received **1 pageview in 30 days**. The site's entire employer argument sits behind a page nobody can reach.

Everything else below is secondary to that.

---

## What the numbers actually say

### Search: effectively zero, and too early to judge
| Metric | Last 28d | Prior 28d |
|---|---|---|
| Clicks | **1** | no data (property too new) |
| Impressions | 215 | no data |
| CTR | 0.5% | — |
| Avg position | 10.4 | — |

- **~88% of impressions are brand** ("arklight" variants). Only **~24 non-brand impressions in 28 days**.
- GA4 agrees: **Organic Search = 3 sessions** out of 158.
- No prior-period data exists, so **the shortage-page sharpen cannot be measured yet**. Judge it in September, not now.

### The one page earning search impressions
`/research/skilled-labor-shortage` = **108 impressions (half the entire site), 0 clicks, avg pos 12.4**.
Its target query `manufacturing labor shortage` sits at **position 25.3** — page 3. Zero CTR at position 25 is normal, not a failure. The page is indexed and matching. It is simply not high enough to be clicked yet.

### Traffic is direct and social, not search
| Channel | Sessions | Engagement | Key events |
|---|---|---|---|
| Direct | 118 | 38% | **17** |
| Referral | 18 | 0% | 0 |
| Organic Social | 13 | 54% | 2 |
| Organic Search | **3** | 33% | 0 |

**~27 of the 158 sessions are bots** — Outlook / Defender link scanners hitting `/?anonymous=&ismsaljsauthenabled=&ep=…`. Real traffic is closer to **130 sessions**, nearly all of it Domingo's own network.

### Desktop converts nothing
| Device | Sessions | Engagement | Avg duration | Key events |
|---|---|---|---|---|
| Desktop | 119 | 25% | 98s | **0** |
| Mobile | 37 | 68% | 179s | **19** |

**Every single key event came from mobile. Desktop is 0 for 119.** Bots inflate desktop, but even discounting them, ~90 real desktop sessions produced nothing.

### The funnel breaks at the form
```
buyer_contact_click   19
form_start             1     ← 95% drop
generate_lead          0     ← nothing completed
```
17 of those 19 clicks came from one mobile path (`/trade-school?from=…/hire`, 16 sessions, 100% engagement). **That is almost certainly our own testing during the pipeline build**, not market signal. Treat it as instrumentation proof, not demand.

`generate_lead` has never fired. The tag *is* deployed correctly on both pages (verified live), and our CRM tests were server-side curl calls that bypass the browser. So **0 leads means 0 real browser submissions**, not a broken tag. It remains unproven in a live browser.

### Where attention actually goes
| Page | Views | Total engagement | Key events |
|---|---|---|---|
| `/` | 123 | 731s | **0** |
| `/trade-school` | 51 | **1262s** | 0 (from direct landings) |
| `/content-research` | 11 | 251s | 0 |
| `/hire` | **1** | 127s | 1 |

`/trade-school` holds attention ~4x better per view than home. Home is 78% of traffic and converts nobody.

---

## Root causes (confirmed in code, ranked)

**1. `/hire` is orphaned.** Nav on both `/` and `/trade-school` is only: `/`, `/trade-school`, `/content-research`, `#contact`. Only 5 deep content pages link to `/hire`. A Head of Talent at Anduril landing on arklight.us has no employer path.

**2. The home page does not speak to the buyer.** Word counts on `public/index.html`: "hire" **0**, "employer" **1**. Title = *"Project Arklight | Building American talent."* Description = *"Building the talent to rebuild America's industrial base."* Both are mission-coded. Nothing an employer, or an LLM answering "who can staff my production ramp," would match.

**3. Contact is buried.** First `#contact` link appears at **30%** of the home DOM; the form itself at **55%**. On mobile that is a long scroll before any way to reach out exists.

**4. `/hire` has no form.** It routes to `/trade-school#contact`, adding a page hop at the exact moment of intent. The one `/hire` visitor spent 127s and fired 1 key event, then nothing.

**5. Bare domain redirect is a 307 (temporary).**
```
https://arklight.us/  →  307  →  https://www.arklight.us/
```
GSC indexes the bare domain as a **separate URL: 38 impressions, position 4.2, 0 clicks** (it cannot be clicked, it redirects). A 307 tells Google "do not consolidate, this is temporary." The canonical tag is correct and doing most of the work, but this splits ranking signal for free. Should be **308 or 301**.

---

## What to change (ranked by leverage)

### Tier 1 — do now, high confidence
1. **Add "For Employers" to the global nav** on `/` and `/trade-school`, pointing to `/hire`. Single highest-leverage change on the site. Fixes the orphan and puts the buyer door on 96% of traffic.
2. **Put a form directly on `/hire`.** Same component as `/trade-school#contact`, with `source_page=/hire`. Remove the page hop at peak intent.
3. **Add an above-the-fold employer CTA on home** — a secondary button next to the primary one ("Hiring operators? Talk to us" → `/hire`). Currently nothing employer-facing exists in the first 30% of the page.
4. **Change the bare-domain redirect to 308** in Vercel → Domains → redirect status code. Two minutes, permanent signal consolidation.

### Tier 2 — conversion mechanics
5. **Shorten the form.** Four required fields at the moment of intent is where 19 clicks became 1 start. Name + email + one message field; make `org` optional or drop it.
6. **Fix the desktop zero.** 119 sessions, 0 events. Before redesigning anything, confirm this is real and not bot-skewed by checking whether the desktop CTA is visible without scrolling at 1440px. This is a measurement question first, a design question second.
7. **Rewrite the home title and description** to carry buyer language:
   - Title: `Project Arklight | Train and deploy production-ready industrial operators`
   - Description: lead with staffing a production ramp, not the mission.
   Keeps brand rankings (brand queries match on the name regardless) and gives non-brand search and LLMs something to match.

### Tier 3 — search, on a realistic clock
8. **Do not judge the shortage page until September.** It is at position 25 with 108 impressions after a few weeks. That is a page working correctly and early.
9. **Build the flagship pillar** `/content/staff-your-production-ramp` (already specced in `employer-question-map.md`). It is the category page for the convergent buyer question and the natural link target from a new "For Employers" nav item.

---

## The honest strategic read
Search is not a channel yet and will not be one for months. **130 real sessions came almost entirely from Domingo's own network** — direct and LinkedIn. That is the channel that works right now.

Which makes the orphaned `/hire` page the whole ballgame: every person he sends to the site lands on a page that never mentions hiring, has no employer nav item, and buries contact 30% down. Fixing the door matters more this quarter than any amount of new content or keyword work.

## Caveats
- No GSC prior period exists, so **no trend claims are possible** in this report.
- The 16-session mobile converting path is almost certainly our own testing. Not counted as demand.
- Bot traffic (~27 sessions) inflates desktop and home; all desktop conclusions are directional until a filtered view exists.
- `generate_lead` is deployed but has never fired in a real browser. Verify with one manual submission before trusting it as the conversion metric.
