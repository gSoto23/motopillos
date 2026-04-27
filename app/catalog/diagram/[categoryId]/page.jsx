import { getDiagramAndParts } from '@/app/actions/catalogActions';
import { getAdminConfig } from '@/app/actions/adminActions';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import ZoomableImage from '@/app/components/ZoomableImage';
import PartItemCard from '@/app/components/PartItemCard';
import styles from './Diagram.module.css';

export default async function DiagramView({ params }) {
  const resolvedParams = await params;
  const categoryId = parseInt(resolvedParams.categoryId, 10);
  const { diagram, parts } = await getDiagramAndParts(categoryId);
  const config = await getAdminConfig();

  if (!diagram) {
    return <div style={{ padding: '2rem' }}>Diagrama no encontrado.</div>;
  }

  const vehicle = await prisma.vehicles.findUnique({
    where: { id: diagram.vehicle_id },
    include: { brands: true }
  });
  
  const vehicleMeta = vehicle ? `${vehicle.brands.name} ${vehicle.year} ${vehicle.model_name}` : '';

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link 
          href={`/catalog/vehicle/${diagram.vehicle_id}`} 
          style={{ color: 'var(--accent-red)', textDecoration: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}
        >
          ← Volver atrás
        </Link>
      </div>

      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>{diagram.name}</h1>

      <div className={styles.gridContainer}>
        
        <div className={styles.diagramSide}>
          {diagram.original_diagram_url || diagram.diagram_image_path ? (
            <ZoomableImage 
              src={diagram.original_diagram_url || diagram.diagram_image_path} 
              alt={`Diagrama de ${diagram.name}`}
            />
          ) : (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#6b7280' }}>
              Imagen del diagrama no disponible
            </div>
          )}
        </div>

        {/* Lado de los Repuestos */}
        <div className={styles.partsSide}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Repuestos
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {parts.length === 0 && <p>No hay repuestos indexados.</p>}
            {parts.map((part, index) => {
              const basePrice = part.price || 0;
              const finalPriceUSD = basePrice * (config.marginMultiplier || 1.0);
              const finalPriceCRC = finalPriceUSD * (config.exchangeRate || 515.0);

              return (
                <PartItemCard 
                  key={`${part.sku}-${index}`} 
                  part={part} 
                  finalPriceUSD={finalPriceUSD} 
                  finalPriceCRC={finalPriceCRC} 
                  vehicleMeta={vehicleMeta}
                />
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
