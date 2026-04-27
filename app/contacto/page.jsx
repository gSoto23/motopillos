import { getAdminConfig } from '@/app/actions/adminActions';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import styles from './Contacto.module.css';

export const metadata = {
  title: 'Contacto | Motopillos',
  description: 'Comunícate con Motopillos para consultas de repuestos y órdenes.',
};

export default async function ContactoPage() {
  const config = await getAdminConfig();
  const whatsappNumberRaw = config?.sinpePhone || '';
  // Limpiar numero para el link de API Wa.me (quitar guiones y espacios)
  const whatsappClean = whatsappNumberRaw.replace(/\D/g, '');
  const waLink = whatsappClean ? `https://wa.me/506${whatsappClean}` : '#';

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Contáctanos</h1>
      <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '3rem', lineHeight: '1.6' }}>
        Alineados con la eficiencia y rapidez, nuestro principal canal de atención es vía WhatsApp. También puedes escribirnos por correo electrónico para consultas formales o corporativas.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Tarjeta WhatsApp */}
        <a 
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.card} ${styles.whatsappCard}`}
        >
          <div style={{ background: '#25D366', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem', color: 'white' }}>
            <MessageCircle size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>WhatsApp</h2>
          <p style={{ color: '#25D366', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '1rem' }}>
            +506 {whatsappNumberRaw || 'No num. configurado'}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Nuestro canal preferido. Respuesta rápida de Lunes a Sábado.
          </p>
        </a>

        {/* Tarjeta Correo */}
        <a 
          href="mailto:motopillos@gmail.com"
          className={`${styles.card} ${styles.emailCard}`}
        >
          <div style={{ background: 'var(--accent-red)', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem', color: 'white' }}>
            <Mail size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Correo Electrónico</h2>
          <p style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '1rem' }}>
            motopillos@gmail.com
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
             Consultas detalladas, estado de facturación o importaciones de alto volumen.
          </p>
        </a>

      </div>
    </main>
  );
}
