import { getYearsByBrand } from '@/app/actions/catalogActions';
import Link from 'next/link';

export default async function BrandYears({ params }) {
  const resolvedParams = await params;
  const brandId = parseInt(resolvedParams.brandId, 10);
  const years = await getYearsByBrand(brandId);

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/" style={{ color: 'var(--accent-red)', textDecoration: 'none', fontWeight: 'bold' }}>← Volver a Marcas</Link>
      </div>
      
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Selecciona el Año</h1>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1rem',
        marginTop: '2rem'
      }}>
        {years.map(year => (
          <Link 
            key={year} 
            href={`/catalog/brand/${brandId}/year/${year}`}
            style={{
              padding: '1.5rem',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '1.25rem',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            {year}
          </Link>
        ))}
      </div>
    </div>
  );
}
