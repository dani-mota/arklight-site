const { Resend } = require('resend');

// Notion database created for homeschool-program demand inquiries.
// Override with NOTION_INTEREST_DB env if the DB is ever recreated.
const NOTION_DB = process.env.NOTION_INTEREST_DB || 'f0f3e39492d4402fb89c62369542b467';

function asArray(v) {
  if (Array.isArray(v)) return v.filter(Boolean).map(String);
  if (v == null || v === '') return [];
  return [String(v)];
}
function truthy(v) {
  return v === true || v === 'true' || v === 'on' || v === '1' || v === 'yes';
}

async function writeToNotion(fields) {
  const token = process.env.NOTION_TOKEN;
  if (!token) return { skipped: true };

  const P = {};
  const setSelect = (name, val) => { if (val) P[name] = { select: { name: String(val) } }; };
  const setMulti = (name, arr) => { if (arr.length) P[name] = { multi_select: arr.map((n) => ({ name: n })) }; };
  const setText = (name, val) => { if (val) P[name] = { rich_text: [{ text: { content: String(val).slice(0, 1900) } }] }; };
  const setCheck = (name, val) => { P[name] = { checkbox: !!val }; };

  P['Name'] = { title: [{ text: { content: fields.name } }] };
  P['Email'] = { email: fields.email };
  setSelect('Role', fields.role);
  setSelect('Students', fields.students);
  setMulti('Ages', fields.ages);
  setMulti('Interests', fields.interests);
  setSelect('Would pay', fields.pay);
  setSelect('Price range', fields.price);
  setSelect('Timing', fields.timing);
  setText('Location', fields.location);
  setText('Why', fields.why);
  setCheck('Founding cohort', fields.founding);
  setCheck('Open to call', fields.call);
  setCheck('Knows others', fields.others);
  setText('Ref code', fields.ref_code);
  setText('Referred by', fields.referred_by);
  setSelect('Status', 'New');

  const resp = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({ parent: { database_id: NOTION_DB }, properties: P }),
  });
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Notion ${resp.status}: ${body.slice(0, 300)}`);
  }
  return { ok: true };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const b = req.body || {};
  const f = {
    name: (b.name || '').toString().trim(),
    email: (b.email || '').toString().trim(),
    role: (b.role || '').toString().trim(),
    students: (b.students || '').toString().trim(),
    ages: asArray(b.ages),
    interests: asArray(b.interests),
    pay: (b.pay || '').toString().trim(),
    price: (b.price || '').toString().trim(),
    timing: (b.timing || '').toString().trim(),
    location: (b.location || '').toString().trim(),
    why: (b.why || '').toString().trim(),
    founding: truthy(b.founding),
    call: truthy(b.call),
    others: truthy(b.others),
    ref_code: (b.ref_code || '').toString().trim().slice(0, 24),
    referred_by: (b.referred_by || '').toString().trim().slice(0, 24),
  };

  if (!f.name || !f.email) {
    return res.status(400).json({ error: 'Please include your name and email.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  // 1) Write to Notion (best-effort; never blocks the response).
  let notion = { skipped: true };
  try {
    notion = await writeToNotion(f);
  } catch (err) {
    notion = { error: err.message };
  }

  // 2) Email notification / fallback.
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const flags = [
        f.founding && 'Founding cohort',
        f.call && 'Open to a call',
        f.others && 'Knows others',
      ].filter(Boolean).join(', ') || '—';
      await resend.emails.send({
        from: 'Arklight <share@arklight.us>',
        to: 'dani@arklight.us',
        replyTo: f.email,
        subject: `Homeschool interest — ${f.name}${f.role ? ` · ${f.role}` : ''}`,
        text:
          `New homeschool-program interest submission:\n\n` +
          `Name: ${f.name}\nEmail: ${f.email}\n` +
          `Role: ${f.role || '—'}\nStudents: ${f.students || '—'}\n` +
          `Ages: ${f.ages.join(', ') || '—'}\nInterests: ${f.interests.join(', ') || '—'}\n` +
          `Would pay: ${f.pay || '—'}\nPrice range: ${f.price || '—'}\nTiming: ${f.timing || '—'}\n` +
          `Location: ${f.location || '—'}\nFlags: ${flags}\n` +
          `Ref code: ${f.ref_code || '—'}\nReferred by: ${f.referred_by || '(none)'}\n\n` +
          `Why: ${f.why || '—'}\n\n` +
          `Notion: ${notion.ok ? 'saved' : notion.skipped ? 'skipped (no NOTION_TOKEN)' : 'error — ' + notion.error}\n`,
      });
    } catch (err) {
      // If Notion also failed, the lead is lost — report an error so the user can retry.
      if (!notion.ok) {
        return res.status(500).json({ error: 'Could not submit. Please email dani@arklight.us directly.' });
      }
    }
  }

  return res.status(200).json({ ok: true });
};
