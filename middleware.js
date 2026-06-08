// Vercel Edge Middleware — HTTP Basic Auth gate for the /mission page.
// Protects the page AND its assets (everything under /mission/...).
//
// Configure in Vercel:  Project Settings → Environment Variables
//   MISSION_PASSWORD  = <the password>        (required)
//   MISSION_USER      = <the username>        (optional, defaults to "arklight")
// If MISSION_PASSWORD is unset, the route fails closed (always denied).

export const config = {
  matcher: ['/mission', '/mission/:path*'],
};

function unauthorized() {
  return new Response('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Arklight — Mission", charset="UTF-8"',
      'Cache-Control': 'no-store',
    },
  });
}

// Constant-time-ish string comparison to avoid trivial timing leaks.
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export default function middleware(request) {
  const expectedPass = process.env.MISSION_PASSWORD;
  if (!expectedPass) return unauthorized(); // fail closed if not configured

  const expectedUser = process.env.MISSION_USER || 'arklight';

  const header = request.headers.get('authorization') || '';
  const [scheme, encoded] = header.split(' ');
  if (scheme !== 'Basic' || !encoded) return unauthorized();

  let decoded;
  try {
    decoded = atob(encoded);
  } catch {
    return unauthorized();
  }

  const idx = decoded.indexOf(':');
  const user = decoded.slice(0, idx);
  const pass = decoded.slice(idx + 1);

  if (safeEqual(user, expectedUser) && safeEqual(pass, expectedPass)) {
    return undefined; // authorized → continue to the static file
  }
  return unauthorized();
}
