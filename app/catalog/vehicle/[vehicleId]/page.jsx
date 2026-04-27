import { getCategoriesByVehicle, getVehicle } from '@/app/actions/catalogActions';
import Link from 'next/link';

export default async function VehicleCategories({ params }) {
  const resolvedParams = await params;
  const vehicleId = parseInt(resolvedParams.vehicleId, 10);
  const categories = await getCategoriesByVehicle(vehicleId);
  const vehicle = await getVehicle(vehicleId);

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link 
          href={`/catalog/brand/${vehicle.brand_id}/year/${vehicle.year}`}
          style={{ color: 'var(--accent-red)', textDecoration: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}
        >
          ← Volver a Modelos
        </Link>
      </div>
      
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Selecciona el Diagrama</h1>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '1rem'
      }}>
        {categories.map(category => (
          <Link 
            key={category.id} 
            href={`/catalog/diagram/${category.id}`}
            style={{
              padding: '1.5rem',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '600',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <span>{category.name}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '1.5rem' }}>→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
