import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';

const COOKIE_NAME = 'sazan_site_access';
const TOKEN_MESSAGE = 'sazan-coast-authorized';

function matchesPassword(value, expected) {
  const submitted = Buffer.from(value);
  const configured = Buffer.from(expected);
  return submitted.length === configured.length && timingSafeEqual(submitted, configured);
}

export async function POST(request) {
  const formData = await request.formData();
  const password = String(formData.get('password') || '');
  const requestedPath = String(formData.get('next') || '/');
  const destination = requestedPath.startsWith('/') && !requestedPath.startsWith('//')
    ? requestedPath
    : '/';
  const expectedPassword = process.env.SITE_PASSWORD || 'Joshua2026';

  if (!matchesPassword(password, expectedPassword)) {
    const accessUrl = new URL('/access', request.url);
    accessUrl.searchParams.set('error', '1');
    accessUrl.searchParams.set('next', destination);
    return NextResponse.redirect(accessUrl, 303);
  }

  const secret = process.env.SITE_ACCESS_SECRET || expectedPassword;
  const token = createHmac('sha256', secret).update(TOKEN_MESSAGE).digest('hex');
  const response = NextResponse.redirect(new URL(destination, request.url), 303);
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
