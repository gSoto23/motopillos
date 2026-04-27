import styles from "./page.module.css";
import Link from 'next/link';
import { ChevronRight, Settings, Wrench, Navigation, Bike, Compass, Crosshair, Box, PackageCheck } from 'lucide-react';

import { getBrands } from '@/app/actions/catalogActions';

export default async function Home() {
  const brands = await getBrands();

  const brandMetadata = {
    'HONDA': { color: '#E1251B', logo: '/brands/honda.png' },
    'YAMAHA': { color: '#0b1a50', logo: '/brands/yamaha.png' },
    'KAWASAKI': { color: '#51af42', logo: '/brands/kawasaki.png' },
    'SUZUKI': { color: '#FFCC00', logo: '/brands/suzuki.png' },
    'CFMOTO': { color: '#3a9ca0', logo: '/brands/cfmoto.png' },
  };

  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Encuentra repuestos 100% originales exactos para tu <span className={styles.highlight}>moto.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            La mayor variedad de marcas, años y modelos
          </p>
        </div>
        
        <div className={styles.heroGridContainer}>
          <div className={styles.grid}>
            {brands.map((brand) => {
              const meta = brandMetadata[brand.name.toUpperCase()] || { color: 'var(--accent-red)', logo: null };
              
              return (
                <Link 
                  href={`/catalog/brand/${brand.id}`} 
                  key={brand.id} 
                  className={`${styles.card} glass-panel`}
                  style={{ '--brand-color': meta.color }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {meta.logo ? (
                      <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img 
                          src={meta.logo} 
                          alt={`Logo ${brand.name}`} 
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} 
                        />
                      </div>
                    ) : (
                      <div className={styles.cardIcon}>
                        <Bike size={24} />
                      </div>
                    )}
                    <h3 style={{ textTransform: 'uppercase', fontSize: '1.25rem', fontWeight: 'bold' }}>{brand.name}</h3>
                  </div>
                  <div className={styles.cardArrow}>
                    <ChevronRight size={24} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className={styles.heroBackground}>
          <div className={styles.gradientOrb1}></div>
          <div className={styles.gradientOrb2}></div>
        </div>
      </header>

      {/* Informative Section - How it Works */}
      <section className={styles.infoSection}>
        <h2>¿Cómo funciona Motopillos?</h2>
        <div className={styles.infoGrid}>
          
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <Crosshair size={48} strokeWidth={1.5} />
            </div>
            <h3>1. Precisión Absoluta</h3>
            <p>Selecciona tu marca, año y modelo exacto. Navega por los diagramas de despiece originales directamente de fábrica.</p>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <Box size={48} strokeWidth={1.5} />
            </div>
            <h3>2. Piezas 100% Originales</h3>
            <p>Trabajamos exclusivamente con números de parte OEM. Garantizamos que el repuesto ajustará perfectamente en tu moto.</p>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <PackageCheck size={48} strokeWidth={1.5} />
            </div>
            <h3>3. Importación Directa</h3>
            <p>Importamos tu pieza directamente desde USA hasta la puerta de tu casa. Paga seguro y relájate mientras el repuesto llega.</p>
          </div>
          
        </div>
      </section>
    </div>
  );
}
