import Link from 'next/link';
import { Settings, ArrowLeft, Activity, Database, Package, CheckCircle, Clock, XCircle } from 'lucide-react';
import styles from '../AdminDashboard.module.css';
import { prisma } from '@/lib/prisma';
import { getAdminConfig } from '@/app/actions/adminActions';
import OrdersTableClient from './OrdersTableClient';

export const dynamic = 'force-dynamic';

export default async function OrdersDashboard() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' }
  });
  const adminConfig = await getAdminConfig();

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

        <OrdersTableClient initialOrders={orders} adminConfig={adminConfig} />
      </main>
    </div>
  );
}
