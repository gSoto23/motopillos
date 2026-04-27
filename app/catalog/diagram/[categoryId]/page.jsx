import { getDiagramAndParts } from '@/app/actions/catalogActions';
import { getAdminConfig } from '@/app/actions/adminActions';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import ZoomableImage from '@/app/components/ZoomableImage';
import DiagramPartsList from '@/app/components/DiagramPartsList';
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

      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{diagram.name}</h1>

      <div style={{ 
        background: 'var(--bg-secondary)', 
        border: '1px solid var(--border-color)', 
        borderLeft: '4px solid var(--accent-red)', 
        padding: '1rem', 
        borderRadius: '6px', 
        marginBottom: '2rem', 
        fontSize: '0.95rem',
        lineHeight: '1.5',
        color: 'var(--text-muted)'
      }}>
        <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.2rem' }}>⚠️ Verificar Cantidades</strong>
        Revisa el diagrama cuidadosamente. Si tu ensamble requiere múltiples unidades de un mismo número (ej: 6 tornillos idénticos), asegúrate de ajustar la cantidad de piezas manualmente antes de añadirlas al carrito.
      </div>

      <div className={styles.gridContainer}>
        
        <div className={styles.diagramSide}>
          {diagram.diagram_image_path || diagram.original_diagram_url ? (
            <ZoomableImage 
              src={diagram.diagram_image_path || diagram.original_diagram_url} 
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
          
          <DiagramPartsList parts={parts} config={config} vehicleMeta={vehicleMeta} />
        </div>

      </div>
    </div>
  );
}
