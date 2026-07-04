# Measurement Handoff — Project Arklight GEO

**Owner: Dani.** These three tasks require a logged-in human (Search Console, live AI engines, GA4 UI). None can be done from the codebase. Do them in order. Total time: ~60-90 min for the first pass, then ~30 min/month for the recurring citation test.

**Why now:** The full content build (33 pages, all schema-backed, Dataset published, entity standardized) shipped to production on 2026-07-04. Today the site is effectively invisible to generative engines. Running the baseline *before* engines crawl and index the new content gives you a clean "before" to prove lift against. Expect a near-zero baseline. That is the point.

---

## Task 1 — Resubmit the sitemap in Google Search Console (~10 min)

The sitemap now lists 36 URLs including all new briefs and the dataset. Search Console is how you tell Google (and, indirectly, Gemini + AI Overviews) to crawl them.

1. Go to **search.google.com/search-console** and select the `arklight.us` property.
   - If the property doesn't exist yet: **Add property → Domain → `arklight.us`**, then verify via DNS TXT record (add the record at your domain registrar). This is a one-time setup.
2. Left sidebar → **Sitemaps**.
3. Under "Add a new sitemap," enter `sitemap.xml` and click **Submit**.
4. Confirm it reads **Success** with **36 discovered URLs** (may take a few minutes).
5. Optional but useful: **URL Inspection** (top search bar) on your two priority pages — `https://www.arklight.us/research/demand-model-dataset` and `https://www.arklight.us/research/skilled-labor-shortage` — then **Request Indexing** on each to jump the queue.

**Done when:** Sitemaps panel shows Success / 36 URLs.

---

## Task 2 — Run the baseline citation test (~45 min, then monthly)

This is the north-star metric: of the 42 tracked queries, how many does each engine cite Arklight for? Baseline is almost certainly 0/42. You re-run it monthly to watch the number climb.

**The tracker:** `_geo/geo-tracking-template.csv` (42 queries across clusters A-K). Open it in a spreadsheet.

**Setup:** First, duplicate the file to `_geo/citations-2026-07.csv` (one snapshot per month), and set the `check_month` column to `2026-07`.

**For each query row**, ask the exact `target_query` text in all five engines, fresh chat each time:

| Engine | Where | Note |
|---|---|---|
| ChatGPT | chatgpt.com | Use a model with web browsing on |
| Perplexity | perplexity.ai | Shows sources inline — easiest to score |
| Google AI Overviews | google.com | Search the query; look for the AI Overview box at the top |
| Gemini | gemini.google.com | |
| Claude | claude.ai | Turn on web search |

**Scoring each cell** (`chatgpt_cited`, `perplexity_cited`, `google_aio_cited`, `gemini_cited`, `claude_cited`):
- `Y` = Arklight is named, linked, or its figure is quoted in the answer.
- `N` = not present.
- Also fill `arklight_prominence` (1 = top/primary source, 2 = mentioned, 3 = buried), `competitors_cited` (who got cited instead — this is the gold), and `answer_snippet_notes` (paste the relevant sentence).

**Don't test all 42 the first time if you're short on time.** Test these 10 highest-value queries first — they're where Arklight has zero competition and should convert first:

1. `what is Trade School 2.0` (q1)
2. `how many electricians is the US short` (q7)
3. `machinist shortage numbers` (q8)
4. `defense industrial base labor shortage` (q11)
5. `CHIPS semiconductor fab workforce shortage` (q12)
6. `build vs buy vs rent your workforce` (q17)
7. `how much do industrial operators make without a college degree` (q26)
8. `submarine industrial base worker shortage` (q38)
9. `how many welders is the US short` (q41)
10. `US skilled trades shortage dataset` (q42)

**Done when:** you have one scored monthly snapshot saved. The single number that matters: **count of queries where any engine returned Y.** Track that number month over month.

---

## Task 3 — Set the GA4 enterprise-referrer alert + buyer events (~20 min)

The whole B2B thesis rests on one signal: a buyer at a company like SpaceX finding the site and sharing it internally (the `jira.spacex.corp` referral you already caught). This alert makes sure you never miss the next one.

**Property:** GA4 `541282584` (measurement ID `G-XH6JFV56FJ`).

### 3a. Custom insight (alert) for enterprise referrers
1. In **GA4 → Admin (or the Insights panel) → Custom insights → Create**.
2. **Evaluation frequency:** Daily.
3. **Segment:** All users.
4. **Metric/condition:** `Sessions` where **Session source** matches a corporate/DIB pattern. GA4 custom insights are limited on regex, so create it as: condition where `Session source` *contains* `.corp` OR *contains* `jira` OR *contains* `atlassian` OR *contains* `okta`. (These are the internal-tool domains buyers share links through.) Set threshold: greater than 0.
5. **Notification:** enter your email. Name it "Enterprise referrer hit."
6. Save. Optionally create a second one for known primes: source contains any of `spacex`, `anduril`, `lockheed`, `rtx`, `boeing`, `northrop`, `hii`, `gd`.

> Note: GA4's built-in anomaly detection won't catch a single new-domain visit (too low-volume to be "anomalous"). The threshold-based custom insight above is the right tool for catching a one-visit needle.

### 3b. Buyer-page conversion events
Mark intent on the buyer funnel so you can measure it, not just eyeball it.
1. **GA4 → Admin → Events → Create event.**
2. Create `buyer_contact_click`: fires when `event_name` = `click` and the click URL contains `/trade-school#contact` **or** the page_location contains `/hire`.
3. **Admin → Key events (formerly Conversions)** → toggle `buyer_contact_click` on as a key event.
4. (If the contact CTA is a `mailto:` or form, mark that submit as a key event too.)

**Done when:** the custom insight is saved with your email, and `buyer_contact_click` shows as a key event.

---

## After all three

- You now have: a crawlable site (Task 1), a repeatable citation scoreboard (Task 2), and an early-warning system for buyer interest (Task 3).
- **Cadence:** re-run Task 2 monthly (30 min). Glance at GA4's AI-Assistants channel + the enterprise alert weekly. Re-submit the sitemap only when new pages ship.
- **The one number to report up:** queries-cited (Task 2) for authority, enterprise-referrer count (Task 3) for revenue. One qualified prime referral outweighs thousands of anonymous visits.
