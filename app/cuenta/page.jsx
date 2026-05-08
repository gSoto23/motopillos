import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Package, MapPin, Phone, Mail, User, Clock, CheckCircle, PackageCheck, XCircle, ShoppingCart } from 'lucide-react';
import ProfileEditor from './ProfileEditor';
import OrderHistoryClient from './OrderHistoryClient';
import { getAdminConfig } from '@/app/actions/adminActions';

export default async function CuentaPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('motopillos_session')?.value;
  const session = sessionToken ? await verifySessionToken(sessionToken) : null;

  if (!session) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      orders: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!user) {
    redirect('/login');
  }

  const adminConfig = await getAdminConfig();
  const exchangeRate = adminConfig?.exchangeRate || 515;

  // The status badges and date formats are now handled within OrderHistoryClient

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>Mi Cuenta</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* User Info Section */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.2rem' }}>
            <User size={20} color="var(--accent-red)" />
            Datos Personales
          </h2>
          
          <ProfileEditor user={user} />
        </div>

        {/* Order History Section */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.2rem' }}>
            <Package size={20} color="var(--accent-red)" />
            Historial de Compras
          </h2>
          
          <OrderHistoryClient orders={user.orders} exchangeRate={exchangeRate} />
        </div>

      </div>
    </div>
  );
}
