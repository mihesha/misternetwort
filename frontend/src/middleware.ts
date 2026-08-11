import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  
  // Get hostname of request (e.g. barraq.localhost:3000 -> barraq.localhost)
  const hostname = request.headers.get('host') || '';

  // Remove port if exists and handle localhost
  const cleanHostname = hostname.split(':')[0].replace('.localhost', '');

  // If the hostname is exactly 'localhost' or your main domain (e.g. 'cardbox.com'), 
  // do not rewrite, let it go to the main platform pages (Admin/Owner).
  if (cleanHostname === 'localhost' || cleanHostname === '127.0.0.1' || cleanHostname === '95.217.43.157' || !hostname.includes('.')) {
    return NextResponse.next();
  }

  // Otherwise, it's a subdomain (like 'barraq'). Rewrite to our dynamic route /[domain]
  const domain = cleanHostname;
  
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
