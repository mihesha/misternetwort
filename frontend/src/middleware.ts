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

  // If it's the main domain or a local environment without subdomain, skip redirect
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
  let baseHost = MAIN_DOMAIN;
  
  if (hostWithoutPort.endsWith(`.${MAIN_DOMAIN}`)) {
    domain = hostWithoutPort.replace(`.${MAIN_DOMAIN}`, '');
  } else if (hostWithoutPort.endsWith('.localhost')) {
    domain = hostWithoutPort.replace('.localhost', '');
    // Keep port for localhost
    baseHost = hostname.replace(`${domain}.`, '');
  }
  
  // Prevent redirecting if it's already an API or static files
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/_next') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Redirect to the unified domain with the network path
  const protocol = request.headers.get('x-forwarded-proto') || 'https';
  const targetUrl = new URL(`/n/${domain}${url.pathname === '/' ? '' : url.pathname}${url.search}`, `${protocol}://${baseHost}`);
  
  return NextResponse.redirect(targetUrl);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
