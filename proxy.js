import { createHmac } from 'node:crypto';
import { NextResponse } from 'next/server';

const COOKIE_NAME = 'sazan_site_access';
const TOKEN_MESSAGE = 'sazan-coast-authorized';

function accessToken() {
  const password = process.env.SITE_PASSWORD || 'Joshua2026';
  const secret = process.env.SITE_ACCESS_SECRET || password;
  return createHmac('sha256', secret).update(TOKEN_MESSAGE).digest('hex');
}

export function proxy(request) {
  const { pathname, search } = request.nextUrl;
  const authorized = request.cookies.get(COOKIE_NAME)?.value === accessToken();

  if (pathname === '/access') {
    return authorized
      ? NextResponse.redirect(new URL('/', request.url))
      : NextResponse.next();
  }

  if (!authorized) {
    const accessUrl = new URL('/access', request.url);
    accessUrl.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(accessUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/access|_next/static|_next/image|favicon.ico|.*\\.[^/]+$).*)'],
};
