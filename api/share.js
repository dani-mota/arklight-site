const { Resend } = require('resend');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { firstName, lastName, company, emails } = req.body;

  if (!firstName || !lastName || !company || !Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (emails.length > 10) {
    return res.status(400).json({ error: 'Maximum 10 recipients per request' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const invalidEmails = emails.filter(e => !emailRegex.test(e));
  if (invalidEmails.length > 0) {
    return res.status(400).json({ error: 'Invalid email address: ' + invalidEmails[0] });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'Email service not configured' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const senderName = `${firstName.trim()} ${lastName.trim()}`;
  const companyName = company.trim();

  try {
    const results = await Promise.allSettled(
      emails.map(email =>
        resend.emails.send({
          from: 'Project Arklight <share@arklight.us>',
          to: email,
          subject: `${senderName} wants you to check out Project Arklight`,
          text: `Dear colleague,\n\n${senderName} from ${companyName} recently viewed our pitch deck and wanted to share Project Arklight with you, as they thought it might be of interest.\n\nThis is an automated message sent on their behalf.\n\nFor more information about Project Arklight, please visit arklight.us or reach out to dani@arklight.us.\n\n—\nProject Arklight\narklight.us`,
          html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a; line-height: 1.7;">
  <p>Dear colleague,</p>
  <p><strong>${senderName}</strong> from <strong>${companyName}</strong> recently viewed our pitch deck and wanted to share Project Arklight with you, as they thought it might be of interest.</p>
  <p style="color: #737373; font-size: 14px;">This is an automated message sent on their behalf.</p>
  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;">
  <p>For more information about Project Arklight, please visit <a href="https://arklight.us" style="color: #d62839; text-decoration: none;">arklight.us</a> or reach out to <a href="mailto:dani@arklight.us" style="color: #d62839; text-decoration: none;">dani@arklight.us</a>.</p>
  <p style="color: #a3a3a3; font-size: 13px; margin-top: 32px;">— Project Arklight</p>
</div>`,
        })
      )
    );

    const sent = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    if (failed > 0 && sent === 0) {
      return res.status(500).json({ error: 'Failed to send emails' });
    }

    return res.status(200).json({ success: true, sent, failed });
  } catch (err) {
    return res.status(500).json({ error: 'Email service error' });
  }
};
