"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAdminConfig, saveAdminConfig } from '@/app/actions/adminActions';
import { Settings, Save, ArrowLeft, TrendingUp, Package, Activity, Database, Loader2 } from 'lucide-react';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const [margin, setMargin] = useState(1.25);
  const [shipping, setShipping] = useState(15.00);
  const [sinpePhone, setSinpePhone] = useState('8888-8888');
  const [sinpeName, setSinpeName] = useState('Motopillos');
  const [transferAccount, setTransferAccount] = useState('CR123456789');
  const [transferName, setTransferName] = useState('Motopillos S.A.');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const config = await getAdminConfig();
      setMargin(config.marginMultiplier);
      setShipping(config.baseShippingCost);
      if (config.sinpePhone) setSinpePhone(config.sinpePhone);
      if (config.sinpeName) setSinpeName(config.sinpeName);
      if (config.transferAccount) setTransferAccount(config.transferAccount);
      if (config.transferName) setTransferName(config.transferName);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const result = await saveAdminConfig(margin, shipping, sinpePhone, sinpeName, transferAccount, transferName);
    setIsSaving(false);
    
    if (result.success) {
      alert('Configuraciones guardadas exitosamente en la Base de Datos SQLite.');
    } else {
      alert('Error: ' + result.error);
    }
  };

  return (
    <div className={styles.adminContainer}>
      <aside className={`${styles.sidebar} glass-panel`}>
        <div className={styles.brand}>
          <h2>MOTOPILLOS</h2>
          <span className={styles.badge}>ADMIN</span>
        </div>
        
        <nav className={styles.navLinks}>
          <Link href="/admin" className={styles.activeLink}><Settings size={20}/> Configuración</Link>
          <Link href="/admin/orders" className={styles.navBtn}><Package size={20}/> Órdenes</Link>
          <button className={styles.navBtn}><Activity size={20}/> Bot Scraper (Python)</button>
          <button className={styles.navBtn}><Database size={20}/> Catálogo DB</button>
        </nav>
        
        <div className={styles.sidebarBottom}>
          <Link href="/" className={styles.backBtn}><ArrowLeft size={16}/> Volver a la Tienda</Link>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1>Panel de Control de Tarifas</h1>
          <p>Define las reglas de negocio que se aplicarán automáticamente a los precios extraídos de Partzilla.</p>
        </header>

        {isLoading ? (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', color: 'var(--text-secondary)' }}>
            <Loader2 className="animate-spin" /> Cargando datos de Prisma...
          </div>
        ) : (
          <div className={styles.dashboardGrid}>
          <section className={`${styles.configCard} glass-panel`}>
            <div className={styles.cardHeader}>
              <TrendingUp className={styles.cardIcon} />
              <h3>Margen de Ganancia Global</h3>
            </div>
            <div className={styles.cardBody}>
              <p className={styles.helpText}>
                Multiplicador aplicado al costo MSRP base. Ejemplo: 1.25 añade un 25% de ganancia operativa.
              </p>
              <div className={styles.inputGroup}>
                <label>Multiplicador Actual</label>
                <div className={styles.inputWrapper}>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={margin} 
                    onChange={(e) => setMargin(Number(e.target.value))} 
                    className={styles.numInput}
                  />
                  <span className={styles.preview}>
                    {((margin - 1) * 100).toFixed(0)}% Ganancia
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className={`${styles.configCard} glass-panel`}>
            <div className={styles.cardHeader}>
              <Package className={styles.cardIcon} />
              <h3>Costo Base de Envío (Nacional)</h3>
            </div>
            <div className={styles.cardBody}>
              <p className={styles.helpText}>
                Tarifa plana agregada automáticamente al carrito del cliente para cubrir costos logísticos de importación y despacho.
              </p>
              <div className={styles.inputGroup}>
                <label>Tarifa Plana (USD)</label>
                <div className={styles.inputWrapper}>
                  <span className={styles.currencyPrefix}>$</span>
                  <input 
                    type="number" 
                    step="0.50" 
                    value={shipping} 
                    onChange={(e) => setShipping(Number(e.target.value))} 
                    className={styles.numInputWithPrefix}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className={`${styles.configCard} glass-panel`}>
            <div className={styles.cardHeader}>
              <TrendingUp className={styles.cardIcon} />
              <h3>Instrucciones SINPE Móvil</h3>
            </div>
            <div className={styles.cardBody}>
              <p className={styles.helpText}>
                Este número y nombre se mostrarán dinámicamente en el Checkout si el cliente elige pagar con SINPE MÓVIL.
              </p>
              <div className={styles.inputGroup} style={{ marginBottom: '1rem' }}>
                <label>Número de Teléfono</label>
                <input 
                  type="text" 
                  value={sinpePhone} 
                  onChange={(e) => setSinpePhone(e.target.value)} 
                  className={styles.numInputWithPrefix}
                  style={{ width: '100%', paddingLeft: '1rem' }}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>A nombre de</label>
                <input 
                  type="text" 
                  value={sinpeName} 
                  onChange={(e) => setSinpeName(e.target.value)} 
                  className={styles.numInputWithPrefix}
                  style={{ width: '100%', paddingLeft: '1rem' }}
                />
              </div>
            </div>
          </section>

          <section className={`${styles.configCard} glass-panel`}>
            <div className={styles.cardHeader}>
              <Package className={styles.cardIcon} />
              <h3>Datos de Transferencia Bancaria</h3>
            </div>
            <div className={styles.cardBody}>
              <p className={styles.helpText}>
                Esta cuenta bancaria se mostrará dinámicamente si el cliente elige pagar con TRANSFERENCIA.
              </p>
              <div className={styles.inputGroup} style={{ marginBottom: '1rem' }}>
                <label>IBAN / Cuenta Cliente</label>
                <input 
                  type="text" 
                  value={transferAccount} 
                  onChange={(e) => setTransferAccount(e.target.value)} 
                  className={styles.numInputWithPrefix}
                  style={{ width: '100%', paddingLeft: '1rem' }}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>A nombre de</label>
                <input 
                  type="text" 
                  value={transferName} 
                  onChange={(e) => setTransferName(e.target.value)} 
                  className={styles.numInputWithPrefix}
                  style={{ width: '100%', paddingLeft: '1rem' }}
                />
              </div>
            </div>
          </section>

          <div className={styles.actionRow}>
            <button 
              className={styles.saveBtn} 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Aplicando Reglas...' : <><Save size={20} /> Guardar Configuración en Base de Datos</>}
            </button>
          </div>
        </div>
        )}
      </main>
    </div>
  );
}
