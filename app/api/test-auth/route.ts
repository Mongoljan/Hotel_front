import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'Test auth API working',
    timestamp: new Date().toISOString(),
    env: {
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasBackendUrl: !!process.env.NEXT_PUBLIC_BACKEND_URL
    }
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ 
    message: 'Test auth API POST working',
    received: body,
    timestamp: new Date().toISOString()
  });
} 