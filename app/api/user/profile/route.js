import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySessionToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function PUT(request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('motopillos_session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const session = await verifySessionToken(sessionToken);

    if (!session) {
      return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, address } = body;

    const updatedUser = await prisma.user.update({
      where: { id: session.id },
      data: {
        name,
        phone,
        address
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
