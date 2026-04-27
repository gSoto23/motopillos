import { getVehiclesByYear } from '@/app/actions/catalogActions';
import Link from 'next/link';

export default async function YearModels({ params }) {
  const resolvedParams = await params;
  const brandId = parseInt(resolvedParams.brandId, 10);
  const year = parseInt(resolvedParams.year, 10);
  const vehicles = await getVehiclesByYear(brandId, year);

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href={`/catalog/brand/${brandId}`} style={{ color: 'var(--accent-red)', textDecoration: 'none', fontWeight: 'bold' }}>← Volver a Años</Link>
      </div>
      
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Modelos del {year}</h1>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1rem',
        marginTop: '2rem'
      }}>
        {vehicles.map(vehicle => (
          <Link 
            key={vehicle.id} 
            href={`/catalog/vehicle/${vehicle.id}`}
            style={{
              padding: '1.5rem',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '500',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            {vehicle.model_name.toUpperCase()}
          </Link>
        ))}
      </div>
    </div>
  );
}
