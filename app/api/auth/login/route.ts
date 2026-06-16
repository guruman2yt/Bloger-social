import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (password === adminPassword) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid administrator credentials.' }, { status: 401 });
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
