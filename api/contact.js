const { Resend } = require('resend');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, org, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Please fill in your name, email, and message.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'Email service not configured' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const safeOrg = org && String(org).trim() ? String(org).trim() : null;

  try {
    await resend.emails.send({
      from: 'Arklight Mission <share@arklight.us>',
      to: 'dani@arklight.us',
      replyTo: String(email).trim(),
      subject: `New contact — ${String(name).trim()}${safeOrg ? ` · ${safeOrg}` : ''}`,
      text:
        `New message from the Mission page contact form:\n\n` +
        `Name: ${String(name).trim()}\n` +
        `Email: ${String(email).trim()}\n` +
        `Organization: ${safeOrg || '—'}\n\n` +
        `${String(message).trim()}\n`,
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to send. Please email dani@arklight.us directly.' });
  }
};
