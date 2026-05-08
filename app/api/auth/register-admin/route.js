import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySessionToken, hashPassword } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('motopillos_session')?.value;
    const session = sessionToken ? await verifySessionToken(sessionToken) : null;

    if (!session || session.role !== 'MASTER_ADMIN') {
      return NextResponse.json({ error: 'No autorizado. Solo el MASTER_ADMIN puede crear administradores.' }, { status: 403 });
    }

    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'El correo ya está en uso' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'ADMIN'
      }
    });

    return NextResponse.json({ success: true, user: { email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
