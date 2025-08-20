import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ ok: true });

  // Clear cookies set by loginAction
  res.cookies.set('token', '', { path: '/', maxAge: 0 });
  res.cookies.set('hotel', '', { path: '/', maxAge: 0 });
  res.cookies.set('userName', '', { path: '/', maxAge: 0 });
  res.cookies.set('userEmail', '', { path: '/', maxAge: 0 });
  res.cookies.set('user_approved', '', { path: '/', maxAge: 0 });
  res.cookies.set('isApproved', '', { path: '/', maxAge: 0 });

  return res;
}
