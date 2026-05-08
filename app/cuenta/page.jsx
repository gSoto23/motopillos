import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Package, MapPin, Phone, Mail, User, Clock, CheckCircle, PackageCheck, XCircle, ShoppingCart } from 'lucide-react';
import ProfileEditor from './ProfileEditor';

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

  const getStatusBadge = (status) => {
    switch(status) {
      case 'APPROVED': return <span style={{ padding: '4px 10px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}><CheckCircle size={14}/> APROBADO</span>;
      case 'PURCHASED': return <span style={{ padding: '4px 10px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}><ShoppingCart size={14}/> PROCESANDO</span>;
      case 'DELIVERED': return <span style={{ padding: '4px 10px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}><PackageCheck size={14}/> ENTREGADO</span>;
      case 'PENDING': return <span style={{ padding: '4px 10px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}><Clock size={14}/> PENDIENTE</span>;
      default: return <span style={{ padding: '4px 10px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}><XCircle size={14}/> CANCELADO</span>;
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

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
          
          {user.orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
              <Package size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
              <p>Aún no tienes compras registradas.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {user.orders.map(order => (
                <div key={order.id} style={{ border: '1px solid var(--border-focus)', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontFamily: 'monospace' }}>#{order.id.split('-')[0].toUpperCase()}</strong>
                    {getStatusBadge(order.status)}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <span>{formatDate(order.createdAt)}</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>${order.totalAmount.toFixed(2)} USD</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Método: {order.paymentMethod}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
