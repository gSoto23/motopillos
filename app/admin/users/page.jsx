import { prisma } from '@/lib/prisma';
import CreateAdminClient from './CreateAdminClient';
import { Users, Shield, User } from 'lucide-react';
import styles from '../AdminDashboard.module.css';

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const getRoleBadge = (role) => {
    switch (role) {
      case 'MASTER_ADMIN': return <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', fontSize: '0.8rem', fontWeight: 'bold' }}>MASTER</span>;
      case 'ADMIN': return <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', fontSize: '0.8rem', fontWeight: 'bold' }}>ADMIN</span>;
      default: return <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(156, 163, 175, 0.15)', color: '#9ca3af', fontSize: '0.8rem', fontWeight: 'bold' }}>USER</span>;
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <Users size={28} color="var(--accent-red)" />
        <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', margin: 0 }}>Gestión de Usuarios</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        {/* Users Table Section */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.ordersTable} style={{ width: '100%', minWidth: '700px' }}>
              <thead>
                <tr>
                  <th>USUARIO</th>
                  <th>CORREO</th>
                  <th>TELÉFONO</th>
                  <th>ROL</th>
                  <th>REGISTRO</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={16} color="var(--text-secondary)" />
                        </div>
                        <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{user.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{user.phone || '-'}</td>
                    <td>{getRoleBadge(user.role)}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Admin Form Section */}
        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
          <CreateAdminClient />
        </div>

      </div>
    </div>
  );
}
