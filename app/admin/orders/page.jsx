import Link from 'next/link';
import { Settings, ArrowLeft, Activity, Database, Package, CheckCircle, Clock, XCircle } from 'lucide-react';
import styles from '../AdminDashboard.module.css';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function OrdersDashboard() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className={styles.adminContainer}>
      <aside className={`${styles.sidebar} glass-panel`}>
        <div className={styles.brand}>
          <h2>MOTOPILLOS</h2>
          <span className={styles.badge}>ADMIN</span>
        </div>
        
        <nav className={styles.navLinks}>
          <Link href="/admin" className={styles.navBtn}><Settings size={20}/> Configuración</Link>
          <Link href="/admin/orders" className={styles.activeLink}><Package size={20}/> Órdenes</Link>
        </nav>
        
        <div className={styles.sidebarBottom}>
          <Link href="/" className={styles.backBtn}><ArrowLeft size={16}/> Volver a la Tienda</Link>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1>Control de Órdenes</h1>
          <p>Supervisa las compras realizadas y aprueba manualmente los pagos por transferencia o SINPE.</p>
        </header>

        <div className={styles.tableContainer}>
          <table className={styles.ordersTable}>
            <thead>
              <tr>
                <th>Hash</th>
                <th>Cliente</th>
                <th>Método</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className={styles.emptyState}>No hay órdenes registradas aún.</td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order.id}>
                    <td className={styles.mono}>{order.id.split('-')[0]}</td>
                    <td>
                      <div className={styles.clientName}>{order.customerName}</div>
                      <div className={styles.clientContact}>{order.customerPhone}</div>
                    </td>
                    <td><span className={styles.methodBadge}>{order.paymentMethod}</span></td>
                    <td className={styles.priceCell}>${order.totalAmount.toFixed(2)}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[order.status.toLowerCase()]}`}>
                        {order.status === 'APPROVED' ? <CheckCircle size={14}/> : order.status === 'PENDING' ? <Clock size={14}/> : <XCircle size={14}/>}
                        {order.status}
                      </span>
                    </td>
                    <td className={styles.dateCell}>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className={styles.actionBtn}>Ver / Aprobar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
