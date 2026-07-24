/**
 * POST /api/auth-request   { email }
 *
 * If the email is on the invite list, emails them a magic link.
 * If it is not, emails Dani an access request and grants nothing.
 *
 * The response is identical either way, so the endpoint never reveals
 * who is on the list.
 */
const { Resend } = require('resend');
const {
  sign, isAllowed, isValidEmail, normalizeEmail, notify,
  TOKEN_TTL_MIN, MAIL_FROM
} = require('./_auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, company_website } = req.body || {};

  // Honeypot: hidden field no human fills in. Pretend success, do nothing.
  if (company_website) return res.status(200).json({ ok: true });

  const clean = normalizeEmail(email);
  if (!isValidEmail(clean)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  if (!process.env.AUTH_SECRET) {
    return res.status(500).json({ error: 'Access is not configured yet. Please contact dani@arklight.us.' });
  }

  // Pinned, never derived from request headers. A Host / X-Forwarded-Host value
  // is attacker-influencable on most stacks, and a poisoned one would send the
  // investor a genuine, correctly-signed email whose link points at the attacker.
  const base = process.env.PUBLIC_BASE_URL || 'https://www.arklight.us';
  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

  if (isAllowed(clean)) {
    const token = sign({ k: 'magic', email: clean }, TOKEN_TTL_MIN * 60 * 1000);
    const link = base + '/api/auth-verify?token=' + encodeURIComponent(token);

    if (resend) {
      // MUST be awaited: a serverless function is frozen the moment it returns,
      // so a fire-and-forget send simply never happens.
      // The oracle is closed a different way: failures are swallowed (never
      // surfaced to the client), and BOTH branches now perform exactly one
      // awaited email call, so the response is identical in body and in timing.
      try {
        await resend.emails.send({
          from: MAIL_FROM,
          to: clean,
          subject: 'Your Project Arklight investor access link',
          text:
            'You requested access to the Project Arklight investor data room.\n\n' +
            'Confirm it is you by opening this link:\n' + link + '\n\n' +
            'This link expires in ' + TOKEN_TTL_MIN + ' minutes and is meant for you only. ' +
            'Please do not forward it.\n\n' +
            'If you did not request this, you can ignore this email.\n\n' +
            'Project Arklight',
          html:
            '<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;font-size:15px;line-height:1.55;color:#1a1a1a;max-width:520px">' +
            '<p>You requested access to the <strong>Project Arklight</strong> investor data room.</p>' +
            '<p>Confirm it is you:</p>' +
            '<p><a href="' + link + '" style="display:inline-block;background:#244A6D;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:3px;font-weight:600">Open the data room</a></p>' +
            '<p style="color:#666;font-size:13px">This link expires in ' + TOKEN_TTL_MIN + ' minutes and is meant for you only. Please do not forward it.</p>' +
            '<p style="color:#666;font-size:13px">If you did not request this, you can ignore this email.</p>' +
            '<p style="color:#999;font-size:12px;word-break:break-all">Or paste this into your browser:<br>' + link + '</p>' +
            '</div>'
        });
        console.log(JSON.stringify({ event: 'magic_link_sent', email: clean, ts: new Date().toISOString() }));
      } catch (e) {
        // Swallowed on purpose: telling the client the send failed would reveal
        // that this address is on the invite list.
        console.log(JSON.stringify({ event: 'magic_link_send_failed', email: clean, err: String(e && e.message) }));
      }
    }
    // No second email here: the sign-in notification already covers the follow-up,
    // and one send per request keeps both branches symmetrical.
  } else {
    // Not invited: tell Dani, grant nothing. One awaited send, mirroring the
    // allowlisted branch so the two are indistinguishable by timing.
    await notify(
      'Investor room ACCESS REQUEST: ' + clean,
      clean + ' tried to access the investor data room at ' + new Date().toISOString() + '.\n\n' +
      'They are NOT on the invite list, so no link was sent.\n\n' +
      'To approve them, add their email to INVESTOR_ALLOWLIST in the Vercel project settings, ' +
      'then tell them to request a link again.'
    );
  }

  // Same answer whether or not they were on the list.
  return res.status(200).json({ ok: true });
};
