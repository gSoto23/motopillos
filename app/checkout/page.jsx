"use client";

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { verifyCartInventory, createOrder } from '@/app/actions/checkoutActions';
import { getAdminConfig } from '@/app/actions/adminActions';
import { useRouter } from 'next/navigation';
import { CheckCircle, AlertCircle, Loader2, CreditCard, Truck } from 'lucide-react';
import styles from './Checkout.module.css';

export default function CheckoutPage() {
  const { items, subtotal, removeFromCart } = useCart();
  const router = useRouter();
  
  const [step, setStep] = useState('verifying'); // verifying | form | success
  const [loadingMsg, setLoadingMsg] = useState('Conectando con bodegas...');
  const [stockStatus, setStockStatus] = useState(null); // { success, outOfStockItems }
  const [adminConfig, setAdminConfig] = useState(null);

  useEffect(() => {
    getAdminConfig().then(conf => setAdminConfig(conf));
  }, []);
  
  useEffect(() => {
    if (!items || (items.length === 0 && step !== 'success')) {
      router.push('/');
      return;
    }
    
    // Ejecutar validacion JIT silente
    if (step === 'verifying') {
      const runVerification = async () => {
        setLoadingMsg('Verificando disponibilidad de piezas...');
        
        try {
          const result = await verifyCartInventory(items);
          
          if (result.success) {
            setLoadingMsg('Inventario confirmado. Preparando checkout...');
            setTimeout(() => setStep('form'), 800);
          } else {
            setStockStatus(result);
            // Si hay problemas, el usuario debe confirmarlos antes de ir al form
          }
        } catch (error) {
          console.error("Error verifying inventory:", error);
          // Failsafe: Continue to checkout regardless to not block sales in MVP
          setTimeout(() => setStep('form'), 1000);
        }
      };
      
      runVerification();
    }
  }, [step, items, router]);

  const handleRemoveOOS = () => {
    if (stockStatus?.outOfStockItems) {
      stockStatus.outOfStockItems.forEach(item => {
        removeFromCart(item.partNumber);
      });
      setStockStatus(null);
      setStep('form');
    }
  };

  const [formData, setFormData] = useState({
    name: '', email: '', address: '', phone: '', paymentMethod: 'TARJETA'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const orderData = {
      customerName: formData.name,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      shippingAddress: formData.address,
      totalAmount: subtotal + 25, // Including global shipping
      paymentMethod: formData.paymentMethod,
      itemsList: items
    };

    const result = await createOrder(orderData);
    
    setIsSubmitting(false);
    
    if (result.success) {
      setStep('success');
    } else {
      alert("Hubo un error procesando tu orden. Por favor intenta de nuevo.");
    }
  };

  return (
    <div className={styles.checkoutContainer}>
      <div className={styles.header}>
        <h1>Finalizar Compra</h1>
        <p>Procesamiento seguro y encriptado</p>
      </div>

      <div className={styles.content}>
        {step === 'verifying' && !stockStatus && (
          <div className={styles.verificationCard}>
            <Loader2 className={styles.spinner} size={48} />
            <h2>{loadingMsg}</h2>
            <p>Por favor espera un momento mientras reservamos tu orden en el sistema.</p>
          </div>
        )}

        {step === 'verifying' && stockStatus && (
          <div className={`${styles.verificationCard} ${styles.errorCard}`}>
            <AlertCircle className={styles.errorIcon} size={48} />
            <h2>Acción Requerida</h2>
            <p>Lamentablemente, las siguientes piezas se han agotado en bodega mientras procesábamos tu orden:</p>
            <ul className={styles.oosList}>
              {stockStatus.outOfStockItems.map(item => (
                <li key={item.partNumber}>
                  <strong>{item.partNumber}</strong> - {item.name}
                </li>
              ))}
            </ul>
            <button className={styles.primaryBtn} onClick={handleRemoveOOS}>
              Remover piezas agotadas y Continuar
            </button>
          </div>
        )}

        {step === 'form' && (
          <div className={styles.checkoutLayout}>
            <div className={styles.formSection}>
              <h2>Información de Envío</h2>
              <form onSubmit={handleCheckoutSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label>Nombre Completo</label>
                  <input required type="text" placeholder="Juan Pérez" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className={styles.inputGroup}>
                  <label>Correo Electrónico</label>
                  <input required type="email" placeholder="juan@ejemplo.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className={styles.inputGroup}>
                  <label>Dirección de Envío</label>
                  <input required type="text" placeholder="Calle Falsa 123" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
                <div className={styles.inputGroup}>
                  <label>Celular</label>
                  <input required type="tel" placeholder="8888-8888" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                
                <div className={styles.paymentMethods}>
                  <h3>Método de Pago</h3>
                  <div className={styles.radioGroup}>
                    <label className={styles.radioLabel}>
                      <input type="radio" name="payment" value="TARJETA" checked={formData.paymentMethod === 'TARJETA'} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} />
                      Tarjeta de Crédito/Débito (Stripe/PayPal)
                    </label>
                    <label className={styles.radioLabel}>
                      <input type="radio" name="payment" value="SINPE" checked={formData.paymentMethod === 'SINPE'} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} />
                      SINPE Móvil (Requiere Aprobación)
                    </label>
                    <label className={styles.radioLabel}>
                      <input type="radio" name="payment" value="TRANSFERENCIA" checked={formData.paymentMethod === 'TRANSFERENCIA'} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} />
                      Transferencia Bancaria (Requiere Aprobación)
                    </label>
                  </div>
                </div>

                <div className={styles.paymentDisclaimer}>
                  <CreditCard size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    {formData.paymentMethod === 'TARJETA' && (
                      <p style={{ margin: 0 }}>El pago se procesará de forma segura mediante pasarela digital.</p>
                    )}
                    {formData.paymentMethod === 'SINPE' && (
                      <>
                        <p style={{ margin: '0 0 0.5rem 0' }}>Por favor, realiza la transferencia SINPE Móvil al siguiente número para confirmar tu orden:</p>
                        <p style={{ margin: 0, fontWeight: 600 }}>{adminConfig?.sinpePhone} - {adminConfig?.sinpeName}</p>
                      </>
                    )}
                    {formData.paymentMethod === 'TRANSFERENCIA' && (
                      <>
                        <p style={{ margin: '0 0 0.5rem 0' }}>Deposita el total en la siguiente cuenta para confirmar tu orden:</p>
                        <p style={{ margin: 0, fontWeight: 600 }}>Cta: {adminConfig?.transferAccount} <br/>Nombre: {adminConfig?.transferName}</p>
                      </>
                    )}
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
                  {isSubmitting ? 'Procesando...' : `Confirmar y Pagar $${(subtotal + 25).toFixed(2)} USD`}
                </button>
              </form>
            </div>

            <div className={styles.orderSummary}>
              <h2>Resumen de Orden</h2>
              <div className={styles.summaryItems}>
                {items.map((item, index) => (
                  <div key={item.partNo || index} className={styles.summaryItem}>
                    <div className={styles.itemDetails}>
                      <span className={styles.itemName}>{item.name.substring(0, 30)}...</span>
                      <span className={styles.itemQty}>Cant: {item.qty}</span>
                    </div>
                    <span className={styles.itemPrice}>${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className={styles.totals}>
                <div className={styles.totalRow}>
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className={styles.totalRow}>
                  <span>Envío Global</span>
                  <span>$25.00</span>
                </div>
                <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                  <span>Total a Pagar</span>
                  <span>${(subtotal + 25).toFixed(2)} USD</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className={styles.successCard}>
            <CheckCircle className={styles.successIcon} size={64} />
            <h2>¡Orden Confirmada!</h2>
            <p>Tu orden ha sido procesada exitosamente. Recibirás un correo electrónico con los detalles de envío pronto.</p>
            <button className={styles.primaryBtn} onClick={() => router.push('/')}>
              Volver al Catálogo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
