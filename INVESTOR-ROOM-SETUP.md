# Investor Data Room — setup

Email magic-link sign-in plus gated document delivery for `/data-room`.
No database required.

> **This GitHub repo is PUBLIC.** The investor documents must never be committed to it.
> They live in Vercel Blob and are excluded by both `.gitignore` and `.vercelignore`.

## How sign-in works

1. Investor enters their email on `/data-room`.
2. `POST /api/auth-request`
   - **On the invite list** → emailed a secure link (expires in 20 minutes).
   - **Not on the list** → gets nothing; **you** get an email with their address.
   - The response is identical either way, so the endpoint never reveals who is on the list.
3. They click the link → `GET /api/auth-verify` validates it, sets a signed
   **HttpOnly / Secure / SameSite=Lax** cookie (7 days), redirects into the room,
   and **emails you that they signed in**.
4. `GET /api/session` tells the page who is signed in (returning visitors skip the gate).
   `POST /api/session` signs out.

## How documents are protected

`GET /api/doc?id=deck` is the **only** way to read a document. It:

1. Requires a valid session cookie — otherwise **401**.
2. Enforces the second wall: `tier: 2` documents require `TIER2_ALLOWLIST`
   membership, otherwise **403** and you get an email about the attempt.
3. Writes an audit line to the Vercel runtime log
   (`{"event":"doc_open","email":…,"doc":…,"ip":…}` — see Vercel → Project → Logs).
4. Streams the bytes from Blob with `Cache-Control: private, no-store` so no CDN
   or proxy can cache gated content, and `Content-Disposition: inline` so it opens
   in the viewer rather than downloading.

The Blob URL is resolved server-side and **never reaches the browser**.

## Required environment variables

Vercel → Project → Settings → Environment Variables:

| Variable | Value |
|---|---|
| `AUTH_SECRET` | Long random string: `openssl rand -base64 48` |
| `INVESTOR_ALLOWLIST` | Comma-separated emails. `@domain.com` allows a whole domain.<br>e.g. `jane@sequoia.com, bob@a16z.com, @arklight.us` |
| `BLOB_READ_WRITE_TOKEN` | From Vercel → Storage → Blob (auto-added when you connect the store) |
| `TIER2_ALLOWLIST` | Optional. Who may open restricted (`tier: 2`) documents |
| `RESEND_API_KEY` | Already set |
| `ALERT_EMAIL` | Optional. Defaults to `dani@arklight.us` |
| `OPERATOR_ALLOWLIST` | Who can open `/data-room/activity`. Comma-separated. Defaults to `ALERT_EMAIL` / `dani@arklight.us` |
| `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` | Vercel → Storage → Create Redis (Upstash). Auto-injected. Without these, documents still open; the reading tape stays empty. |

## One-time: publish the documents

```bash
# 1. In Vercel: Storage > Create Database > Blob, connect it to arklight-site
# 2. Copy BLOB_READ_WRITE_TOKEN, then:
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxx node scripts/upload-investor-docs.js
```

Re-run that any time you update a PDF — it replaces the previous copy.
Source files are read from `data-room-assets/` (local only, never deployed).

## Managing access

- **Approve someone:** add their email to `INVESTOR_ALLOWLIST`, redeploy, tell them to request a link.
- **Grant restricted docs:** add them to `TIER2_ALLOWLIST`.
- **Revoke someone:** remove them from the allowlist. Their existing cookie stays valid
  until it expires (7 days) — to kill **all** sessions instantly, change `AUTH_SECRET`.

## Adding a document

1. Put the PDF in `data-room-assets/`.
2. Add an entry to `api/_docs.js` (set `tier: 2` to hide it behind the second wall).
3. Point the manifest at it in `public/data-room.html`: `docSrc("yourId")`.
4. Re-run the upload script.

## Reading tape (page + dwell)

The room renders PDFs with a self-hosted PDF.js viewer so we can see which
pages were on screen and for how long (focused tab only). Loom and the
pipeline board are unchanged.

- Investors keep the same overlay. A small `3 / 18` counter is the only new chrome.
- Events POST to `/api/activity`; the server stamps the email from the session cookie.
- You read the tape at `https://www.arklight.us/data-room/activity` (not linked from the room). Signed-in non-operators get 404.

One-time: Vercel → Storage → Create Redis (Upstash) → connect to `arklight-site`. Then add your address to `OPERATOR_ALLOWLIST` if it is not already `dani@arklight.us`.

## After you deploy — verify these three things

1. `https://arklight.us/data-room-assets/arklight-investor-deck.pdf` → **should NOT return the PDF**
2. `https://arklight.us/api/doc?id=deck` in a signed-out browser → **401**
3. Sign in, open a document → works, and a `doc_open` line appears in the Vercel logs

## Files

```
api/_auth.js                     signing / allowlist / cookie helpers
api/_docs.js                     document registry (id -> file, title, tier)
api/auth-request.js              POST  email in, magic link out
api/auth-verify.js               GET   link -> session cookie -> redirect
api/session.js                   GET   who am I  |  POST  sign out
api/doc.js                       GET   gated, logged, streamed document
api/activity.js                  POST  reading events  |  GET  operator tape
api/_activity.js                 Redis helpers
public/vendor/pdfjs/             self-hosted PDF.js (lazy-loaded on first PDF)
public/data-room-activity.html   operator tape at /data-room/activity
scripts/upload-investor-docs.js  publish PDFs to Blob
```

## Local development

`python3 -m http.server 8791` from the repo root, then open
`http://localhost:8791/public/data-room.html`.

Note: `public/` is the deployed web root, so the page lives at `public/data-room.html`
and is served at `/data-room` in production. The `api/` directory stays at the repo
root (that is where Vercel looks for functions).

There is no API locally, so on `localhost` only: the gate opens the room directly and
documents are read straight from `data-room-assets/`. Both bypasses are
hostname-checked and never apply in production.
