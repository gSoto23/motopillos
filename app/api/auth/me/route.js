import { NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
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

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, email: true, name: true, role: true, phone: true, address: true }
  });

  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ user });
}
