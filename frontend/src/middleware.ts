import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  
  // Get hostname of request (e.g. barraq.localhost:3000 -> barraq.localhost)
  const hostname = request.headers.get('host') || '';

  // Remove port if exists
  const hostWithoutPort = hostname.split(':')[0];

  // The main platform domain
  const MAIN_DOMAIN = 'cardbox.basmasoft.com';

  // If it's the main domain or a local environment without subdomain, skip rewrite
  if (
    hostWithoutPort === MAIN_DOMAIN ||
    hostWithoutPort === 'localhost' ||
    hostWithoutPort === '127.0.0.1' ||
    hostWithoutPort === '95.217.43.157' ||
    !hostWithoutPort.includes('.')
  ) {
    return NextResponse.next();
  }

  // Otherwise, it's a subdomain. We need to extract the network code (the subdomain part)
  // e.g. 8123.cardbox.basmasoft.com -> 8123
  let domain = hostWithoutPort;
  if (hostWithoutPort.endsWith(`.${MAIN_DOMAIN}`)) {
    domain = hostWithoutPort.replace(`.${MAIN_DOMAIN}`, '');
  } else if (hostWithoutPort.endsWith('.localhost')) {
    domain = hostWithoutPort.replace('.localhost', '');
  }
  
  // Prevent rewriting if it's already a /[domain] route or API or static files
  if (
    url.pathname.startsWith(`/${domain}`) ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/_next') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Rewrite to /[domain]/path
  return NextResponse.rewrite(new URL(`/${domain}${url.pathname}${url.search}`, request.url));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
