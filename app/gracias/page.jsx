"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle } from 'lucide-react';
import { Suspense, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { cancelOrder } from '@/app/actions/checkoutActions';

function GraciasContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const isCancel = searchParams.get('wp_cancel') === 'yes';
  const { clearCart } = useCart();

  useEffect(() => {
    if (isCancel && orderId) {
      cancelOrder(orderId).catch(console.error);
    } else if (!isCancel) {
      clearCart();
    }
  }, [isCancel, orderId]);

  if (isCancel) {
    return (
      <div style={{ maxWidth: '600px', margin: '100px auto', textAlign: 'center', padding: '40px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <XCircle size={80} color="#ef4444" style={{ margin: '0 auto 20px' }} />
        <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Pago Cancelado</h1>
        <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '20px' }}>
          Has cancelado el proceso de pago. Tus productos siguen en el carrito y tu orden fue anulada.
        </p>
        <button 
          onClick={() => router.push('/checkout')}
          style={{ padding: '12px 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Volver al Checkout
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '100px auto', textAlign: 'center', padding: '40px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <CheckCircle size={80} color="#10b981" style={{ margin: '0 auto 20px' }} />
      <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>¡Pago Exitoso!</h1>
      <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '20px' }}>
        Tu transacción con Tilopay ha sido procesada correctamente.
      </p>
      {orderId && (
        <div style={{ backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '8px', marginBottom: '30px' }}>
          <strong>Orden ID:</strong> #{orderId.split('-')[0].toUpperCase()}
        </div>
      )}
      <p style={{ marginBottom: '30px' }}>Te hemos enviado un correo electrónico con la confirmación de tu compra y los detalles de envío.</p>
      
      <button 
        onClick={() => router.push('/')}
        style={{ padding: '12px 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}
      >
        Volver a la Tienda
      </button>
    </div>
  );
}

export default function GraciasPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <GraciasContent />
    </Suspense>
  );
}
