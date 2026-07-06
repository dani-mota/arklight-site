# Lead Pipeline — Final Setup (Domingo, ~10 min)

The website now captures every reach-out and is ready to save leads straight into your **🏦 CRM**, stamped with the page they came from. The code is live. It just needs your Notion key so the website is allowed to write. Until you do this, leads still email you (nothing is broken) — they just don't land in the CRM yet.

## What's already done (live now)
- The contact form saves the **source page** (which brief/page brought them), plus a spam trap.
- The Hire page, every research brief, and every article now send people to the form **carrying their page** (206 links).
- The two broken forms (Partners page + the "Subscribe" box) are fixed — they used to throw leads away silently; now they save.
- Two new CRM columns added: **Source Page** and **Inbound Message**.
- A `generate_lead` event fires in GA4 on every submission.

## Your 3 steps to turn on CRM saving

### 1. Create a Notion key (internal integration)
- Go to **notion.so/my-integrations** → **New integration**.
- Name it **Arklight Website**, associated workspace = **Daniel Mota's Space**.
- Capabilities: make sure **Insert content** is checked (it needs to add rows).
- Click **Save**, then copy the **Internal Integration Secret** — a long string starting with `ntn_` (or `secret_`). This is `NOTION_TOKEN`.

### 2. Give that key access to the CRM
- Open the **🏦 CRM** database in Notion.
- Top-right **•••** menu → **Connections** (or "Add connections") → search **Arklight Website** → confirm.
- (Without this, the website has the key but no permission to write to that database.)

### 3. Add two settings to the website (Vercel)
- Vercel → project **arklight-site** → **Settings → Environment Variables** → add both (Production):
  - `NOTION_TOKEN` = *(the secret from step 1)*
  - `NOTION_CRM_DB` = `3479fad3bf2247f7b55d7f690a7b1e10`

### 4. Tell me
Environment settings only take effect on a fresh deploy, so once you've done steps 1–3, tell me and I'll **redeploy and run a live test** — I'll submit a test on the submarine brief and confirm a new row appears in your CRM with **Source Page = that brief**, Source = Inbound, Status = Lead, Stage = Not Contacted.

### Optional
- In GA4, mark **`generate_lead`** as a key event so form submissions count as conversions.

## How a lead will look in the CRM
- **Full Name / First Name / Email** — from the form.
- **Inbound Message** — what they wrote.
- **Source Page** — the exact page they reached out from (e.g. the submarine brief). ← the attribution.
- **Source** = Inbound · **Status** = Lead · **Stage** = Not Contacted · **Type** = Prospect.
- Their organization + where they came from → appended to **Notes**.
- You then set **Persona** (e.g. HR / Talent) and **Audience** (e.g. Defense Prime) and work it down the pipeline.

## Notes
- **Nothing is lost if a service is down:** the website emails you AND saves to the CRM independently. If Notion ever hiccups, the email still goes; if email hiccups, the CRM row still saves.
- **Spam:** a hidden honeypot field silently drops bots before they reach your CRM.
- The website database id is `3479fad3bf2247f7b55d7f690a7b1e10`; the CRM data source is `collection://2e09fbfe-5e11-4741-98a8-e130bddf1165`.
