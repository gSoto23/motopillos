import { Scale, ShieldAlert, FileText } from 'lucide-react';

export const metadata = {
  title: 'Términos y Condiciones | Motopillos',
  description: 'Términos legales y aclaraciones comerciales de importación.',
};

export default function TerminosPage() {
  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem', minHeight: '60vh', color: 'var(--text-primary)', lineHeight: '1.7' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Scale size={40} color="var(--accent-red)" />
        <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Términos y Condiciones</h1>
      </div>

      <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '1.1rem' }}>
        Al utilizar los servicios de la plataforma Motopillos para originar una orden o proforma, usted comprende y acepta la naturaleza comercial estipulada en los siguientes apartados:
      </p>

      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          <ShieldAlert size={22} color="var(--accent-red)" /> 1. Naturaleza Jurídica y Comercial (Agente Importador)
        </h2>
        <div style={{ background: 'rgba(225, 37, 27, 0.05)', borderLeft: '4px solid var(--accent-red)', padding: '1.5rem', borderRadius: '4px', marginBottom: '1.5rem' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>Aclaración Fundamental:</p>
          <p style={{ margin: '0.5rem 0 0 0' }}>
            <strong>Motopillos NO es un distribuidor oficial, franquicia, agente de marca ni filial o representante legal</strong> de las corporaciones Honda, Yamaha, Kawasaki, Suzuki, CFMoto, ni de ninguna otra marca automotriz mencionada en nuestra plataforma dentro del territorio de Costa Rica.
          </p>
        </div>
        <p style={{ color: 'var(--text-muted)' }}>
          Nuestra actividad comercial se limita estrictamente a brindar un <strong>servicio logístico de localización e importación</strong>. Motopillos funge exclusivamente como un facilitador independiente para particulares. Todas las piezas y repuestos ofertados en nuestro catálogo son adquiridos de manera legítima en Estados Unidos mediante proveedores y distribuidores autorizados en dicho territorio, para luego ser trasladados e importados a Costa Rica a nombre y conveniencia del cliente final.
        </p>
      </div>

      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          <FileText size={22} color="var(--text-primary)" /> 2. Garantías y Responsabilidad Limitada
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Motopillos vela por la integridad física de los paquetes durante la cadena logística desde Estados Unidos hasta su arribo final. No obstante, al fungir como <em>Agente Gestor de Importación</em>, nuestra responsabilidad caduca en el momento de la entrega funcional de las piezas o cajas selladas.
        </p>
        <ul style={{ color: 'var(--text-muted)', paddingLeft: '1.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>Toda garantía técnica sobre el funcionamiento, deficiencias de fábrica, instalación incorrecta o compatibilidad del repuesto (aun cuando se hubiese verificado mediante diagramas) depende de la emisión de la casa matriz o del proveedor en EE.UU.</li>
          <li style={{ marginBottom: '0.5rem' }}>Cualquier reclamo o ejecución de garantía internacional hacia EE.UU. podría incurrir en costos logísticos y aduaneros de retorno, los cuales corren por cuenta y cargo exclusivo del cliente, sin obligación legal imputable a Motopillos.</li>
        </ul>
      </div>

      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          <FileText size={22} color="var(--text-primary)" /> 3. Modificaciones y Retrasos
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Las operaciones de comercio internacional están permanentemente sujetas a contingencias que escapan del dominio directo de nuestra empresa.
        </p>
        <p style={{ color: 'var(--text-muted)' }}>
          Motopillos no asume responsabilidad civil, contractual ni indemnizatoria por demoras imprevistas atribuidas a contingencias en aerolíneas de carga, inspecciones rigurosas de la Dirección General de Aduanas de Costa Rica (DGA), paros de transporte, desastres naturales o atrasos originados por el distribuidor internacional primario.
        </p>
      </div>

    </main>
  );
}
