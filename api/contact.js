const { Resend } = require('resend');
const { Client } = require('@notionhq/client');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, org, message, source_page, referrer, company_website } = req.body || {};

  // Honeypot: `company_website` is a hidden field no human sees. Bots fill it.
  // Silently accept and write nothing so the bot thinks it succeeded.
  if (company_website) {
    return res.status(200).json({ ok: true });
  }

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Please fill in your name, email, and message.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const cleanName = String(name).trim();
  const cleanEmail = String(email).trim();
  const cleanMsg = String(message).trim();
  const safeOrg = org && String(org).trim() ? String(org).trim() : null;
  const safeSource = source_page && String(source_page).trim() ? String(source_page).trim() : null;
  const safeReferrer = referrer && String(referrer).trim() ? String(referrer).trim() : null;
  const firstName = cleanName.split(/\s+/)[0] || cleanName;

  let emailOk = false;
  let notionOk = false;
  const errors = [];

  // 1) Email notification (non-fatal) — keeps the existing behaviour.
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'Arklight Mission <share@arklight.us>',
        to: 'dani@arklight.us',
        replyTo: cleanEmail,
        subject: `New contact — ${cleanName}${safeOrg ? ` · ${safeOrg}` : ''}`,
        text:
          `New message from the website contact form:\n\n` +
          `Name: ${cleanName}\n` +
          `Email: ${cleanEmail}\n` +
          `Organization: ${safeOrg || '—'}\n` +
          `Source page: ${safeSource || '—'}\n` +
          `Referrer: ${safeReferrer || '—'}\n\n` +
          `${cleanMsg}\n`,
      });
      emailOk = true;
    } catch (err) {
      errors.push('email:' + (err && err.message ? err.message : 'failed'));
    }
  } else {
    errors.push('email:not_configured');
  }

  // 2) Save to the Notion CRM (non-fatal) — the lead of record.
  if (process.env.NOTION_TOKEN && process.env.NOTION_CRM_DB) {
    try {
      const notion = new Client({ auth: process.env.NOTION_TOKEN, notionVersion: '2022-06-28' });
      const notesParts = [];
      if (safeOrg) notesParts.push(`Org: ${safeOrg}`);
      if (safeReferrer) notesParts.push(`Referrer: ${safeReferrer}`);

      const properties = {
        'Full Name': { title: [{ text: { content: cleanName.slice(0, 200) } }] },
        'First Name': { rich_text: [{ text: { content: firstName.slice(0, 200) } }] },
        'Email': { email: cleanEmail },
        'Inbound Message': { rich_text: [{ text: { content: cleanMsg.slice(0, 1900) } }] },
        'Source': { select: { name: 'Inbound' } },
        'Status': { select: { name: 'Lead' } },
        'Stage': { select: { name: 'Not Contacted' } },
        'Type': { select: { name: 'Prospect' } },
      };
      if (safeSource) properties['Source Page'] = { url: safeSource.slice(0, 700) };
      if (notesParts.length) properties['Notes'] = { rich_text: [{ text: { content: notesParts.join(' · ').slice(0, 1900) } }] };

      await notion.pages.create({
        parent: { database_id: process.env.NOTION_CRM_DB },
        properties,
      });
      notionOk = true;
    } catch (err) {
      errors.push('notion:' + (err && err.message ? err.message : 'failed'));
    }
  } else {
    errors.push('notion:not_configured');
  }

  // Success if the lead landed in at least one place. Never lose a lead to one
  // service being down.
  if (emailOk || notionOk) {
    return res.status(200).json({ ok: true });
  }

  console.error('contact.js: lead not captured —', errors.join(' | '));
  return res.status(500).json({ error: 'Failed to send. Please email dani@arklight.us directly.' });
};
