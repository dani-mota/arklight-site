// Vercel Edge Middleware — typed-password gate for /mission (and its assets).
//
// Flow:
//   • No / bad cookie  -> render an Arklight-branded password page.
//   • Correct password submitted -> set a signed cookie, redirect into /mission.
//   • Valid cookie     -> pass through to the static files.
//
// Configure in Vercel → Project Settings → Environment Variables:
//   MISSION_PASSWORD = <the password>   (required; gate stays locked until set)
// Changing the password automatically invalidates existing cookies.

export const config = {
  matcher: ['/mission', '/mission/:path*'],
};

const COOKIE = 'mission_auth';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Deterministic, non-reversible token derived from the password.
async function tokenFor(password) {
  const data = new TextEncoder().encode('arklight-mission|v1|' + password);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function loginPage(error) {
  const msg = error
    ? `<p class="err">${error}</p>`
    : `<p class="hint">This page is private.</p>`;
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Protected · Arklight</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; display: grid; place-items: center;
    background: #0a0a0a; color: #ededed;
    font: 16px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    padding: 24px;
  }
  .card {
    width: 100%; max-width: 360px; padding: 32px;
    background: #141414; border: 1px solid #262626; border-radius: 14px;
    box-shadow: 0 20px 60px rgba(0,0,0,.45);
  }
  h1 { margin: 0 0 4px; font-size: 18px; letter-spacing: .2px; }
  .hint, .err { margin: 0 0 20px; font-size: 13px; }
  .hint { color: #8f8f8f; }
  .err { color: #ff6b6b; }
  label { display: block; font-size: 12px; color: #a3a3a3; margin: 0 0 6px; }
  input[type=password] {
    width: 100%; padding: 11px 12px; font-size: 15px;
    background: #0a0a0a; color: #ededed;
    border: 1px solid #2e2e2e; border-radius: 9px; outline: none;
  }
  input[type=password]:focus { border-color: #5b8def; }
  button {
    margin-top: 16px; width: 100%; padding: 11px 12px; font-size: 15px; font-weight: 600;
    color: #0a0a0a; background: #ededed; border: 0; border-radius: 9px; cursor: pointer;
  }
  button:hover { background: #fff; }
  .brand { margin-top: 22px; text-align: center; font-size: 11px; color: #5a5a5a; letter-spacing: .3px; }
</style>
</head>
<body>
  <form class="card" method="POST" action="/mission" autocomplete="off">
    <h1>Enter password</h1>
    ${msg}
    <label for="password">Password</label>
    <input id="password" name="password" type="password" autofocus required>
    <button type="submit">Unlock</button>
    <div class="brand">ARKLIGHT</div>
  </form>
</body>
</html>`;
  return new Response(html, {
    status: error ? 401 : 200,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  });
}

export default async function middleware(request) {
  const expected = process.env.MISSION_PASSWORD;
  if (!expected) {
    return new Response(
      'Mission gate is not configured: set the MISSION_PASSWORD environment variable in Vercel, then redeploy.',
      { status: 503, headers: { 'cache-control': 'no-store' } }
    );
  }
  const expectedToken = await tokenFor(expected);

  // 1. Already authenticated?
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/(?:^|;\s*)mission_auth=([^;]+)/);
  if (match && safeEqual(match[1], expectedToken)) {
    return undefined; // pass through to the static file
  }

  // 2. Password submission.
  if (request.method === 'POST') {
    let pw = '';
    try {
      const form = await request.formData();
      pw = String(form.get('password') || '');
    } catch {
      /* fall through to login page */
    }
    if (safeEqual(pw, expected)) {
      const headers = new Headers();
      headers.set(
        'Set-Cookie',
        `${COOKIE}=${expectedToken}; Path=/mission; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}`
      );
      headers.set('Location', '/mission');
      headers.set('Cache-Control', 'no-store');
      return new Response(null, { status: 303, headers });
    }
    return loginPage('Incorrect password. Try again.');
  }

  // 3. Show the password page.
  return loginPage('');
}
