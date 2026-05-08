import { NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('motopillos_session')?.value;

  if (!sessionToken) {
    return NextResponse.json({ user: null });
  }

  const session = await verifySessionToken(sessionToken);

  if (!session) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ user: session });
}
