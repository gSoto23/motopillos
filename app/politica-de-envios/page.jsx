import { Truck, MapPin, Package, Calendar } from 'lucide-react';

export const metadata = {
  title: 'Política de Envíos | Motopillos',
  description: 'Tiempos de entrega logísticos, envíos nacionales e internacionales.',
};

export default function PoliticaEnviosPage() {
  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem', minHeight: '60vh', color: 'var(--text-primary)', lineHeight: '1.7' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Truck size={40} color="var(--accent-red)" />
        <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Política de Envíos</h1>
      </div>

      <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--accent-red)' }}>
          <Calendar size={24} /> Tiempo de Importación
        </h2>
        <p style={{ marginBottom: '1rem' }}>
          En Motopillos operamos bajo un modelo ágil de importación contínua. El tiempo estimado de entrega para la mayoría de los repuestos es de <strong>2 semanas (aproximadamente 10 a 14 días hábiles)</strong>.
        </p>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Este tiempo es un estimado general, ya que dependemos de la logística de almacenes en Estados Unidos, procesos aduanales y el servicio de Courier de transporte internacional de paquetería de terceros.
        </p>
      </div>

      <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.4rem', marginBottom: '1rem' }}>
          <MapPin size={24} color="var(--accent-red)" /> Entrega Local en Costa Rica
        </h2>
        <p style={{ marginBottom: '1rem' }}>
          Una vez que los repuestos ingresan a nuestro centro logístico en el país y son nacionalizados, despachamos tu orden hasta la puerta de tu casa o taller.
        </p>
        <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)' }}>
          <li style={{ marginBottom: '0.5rem' }}>Utilizamos servicios de <strong>Mensajería Privada</strong> para la GAM (Gran Área Metropolitana).</li>
          <li style={{ marginBottom: '0.5rem' }}>Utilizamos <strong>Correos de Costa Rica</strong> para zonas rurales o extendidas.</li>
        </ul>
      </div>

      <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.4rem', marginBottom: '1rem' }}>
          <Package size={24} color="var(--accent-red)" /> Recolección en Sitio
        </h2>
        <p style={{ marginBottom: 0 }}>
          Existe la opción de recoger tus piezas personalmente de manera presencial una vez que notifiquemos que la importación está lista. 
          <br /><br />
          <strong>Nota importante:</strong> La recolección debe ser <u>programada con anticipación</u> coordinando vía WhatsApp con nuestro equipo. No somos una tienda de exhibición, por lo que requerimos alistar tu orden previo a tu llegada.
        </p>
      </div>

    </main>
  );
}
