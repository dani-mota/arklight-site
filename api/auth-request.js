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

  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const base = 'https://' + host;
  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

  if (isAllowed(clean)) {
    const token = sign({ k: 'magic', email: clean }, TOKEN_TTL_MIN * 60 * 1000);
    const link = base + '/api/auth-verify?token=' + encodeURIComponent(token);

    if (resend) {
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
      } catch (e) {
        return res.status(500).json({ error: 'Could not send the email. Please try again.' });
      }
    }
    await notify(
      'Investor room: link sent to ' + clean,
      clean + ' requested an access link at ' + new Date().toISOString() + '.'
    );
  } else {
    // Not invited: tell Dani, grant nothing.
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
