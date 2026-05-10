"use client";

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { verifyCartInventory, createOrder } from '@/app/actions/checkoutActions';
import { getAdminConfig } from '@/app/actions/adminActions';
import { useRouter } from 'next/navigation';
import { CheckCircle, AlertCircle, Loader2, CreditCard, Truck } from 'lucide-react';
import { useUI } from '@/context/UIContext';
import styles from './Checkout.module.css';

export default function CheckoutPage() {
  const { items, subtotal, removeFromCart, clearCart } = useCart();
  const router = useRouter();
  const { showToast } = useUI();

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
    name: '',
    email: '',
    phone: '',
    address: '',
    paymentMethod: 'TARJETA'
  });

  const [provincias, setProvincias] = useState({});
  const [cantones, setCantones] = useState({});
  const [distritos, setDistritos] = useState({});

  // Auto-fill if user is logged in
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          let parsedAddress = { provincia: '', canton: '', distrito: '', exacta: '' };
          if (data.user.address) {
            try {
              parsedAddress = JSON.parse(data.user.address);
            } catch (e) {
              parsedAddress.exacta = data.user.address;
            }
          }

          setFormData(prev => ({
            ...prev,
            name: prev.name || data.user.name || '',
            email: prev.email || data.user.email || '',
            phone: prev.phone || data.user.phone || '',
            address: prev.address || parsedAddress.exacta || ''
          }));

          if (parsedAddress.provincia) setSelectedProv(parsedAddress.provincia);
          // Canton and Distrito will be set via useEffects once Provincia loads, 
          // but we need a way to set them after options load.
          // For simplicity, we just set the initial values if they exist.
          if (parsedAddress.canton) {
            setTimeout(() => setSelectedCanton(parsedAddress.canton), 500);
          }
          if (parsedAddress.distrito) {
            setTimeout(() => setSelectedDistrito(parsedAddress.distrito), 1000);
          }
        }
      })
      .catch(() => { });
  }, []);

  const [selectedProv, setSelectedProv] = useState('');
  const [selectedCanton, setSelectedCanton] = useState('');
  const [selectedDistrito, setSelectedDistrito] = useState('');

  useEffect(() => {
    fetch('https://ubicaciones.paginasweb.cr/provincias.json')
      .then(res => res.json())
      .then(data => setProvincias(data)).catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (selectedProv) {
      fetch(`https://ubicaciones.paginasweb.cr/provincia/${selectedProv}/cantones.json`)
        .then(res => res.json())
        .then(data => { setCantones(data); setSelectedCanton(''); setDistritos({}); setSelectedDistrito(''); })
        .catch(err => console.error(err));
    } else {
      setCantones({}); setDistritos({});
    }
  }, [selectedProv]);

  useEffect(() => {
    if (selectedProv && selectedCanton) {
      fetch(`https://ubicaciones.paginasweb.cr/provincia/${selectedProv}/canton/${selectedCanton}/distritos.json`)
        .then(res => res.json())
        .then(data => { setDistritos(data); setSelectedDistrito(''); })
        .catch(err => console.error(err));
    } else {
      setDistritos({});
    }
  }, [selectedProv, selectedCanton]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const shippingCost = adminConfig?.baseShippingCost || 0;
  const ivaAmount = subtotal * 0.13;
  const totalUSD = subtotal + ivaAmount + shippingCost;
  const exchangeRate = adminConfig?.exchangeRate || 515;
  const totalCRC = totalUSD * exchangeRate;

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const orderData = {
      customerName: formData.name,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      shippingAddress: `${provincias[selectedProv] || ''}, ${cantones[selectedCanton] || ''}, ${distritos[selectedDistrito] || ''}. ${formData.address}`,
      totalAmount: totalUSD,
      paymentMethod: formData.paymentMethod,
      itemsList: items
    };

    const result = await createOrder(orderData);

    if (result.success) {
      if (formData.paymentMethod === 'TARJETA') {
        // Redirigir a Tilopay
        setLoadingMsg('Conectando con pasarela de pago seguro...');
        setStep('redirecting');

        try {
          const tRes = await fetch('/api/tilopay/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: result.orderId,
              amount: totalCRC,
              customerName: formData.name,
              customerEmail: formData.email,
              provincia: provincias[selectedProv] || '',
              canton: cantones[selectedCanton] || '',
              distrito: distritos[selectedDistrito] || '',
              address: formData.address,
              phone: formData.phone
            })
          });

          const tData = await tRes.json();
          if (tData.url) {
            window.location.href = tData.url;
            return; // Exit here, let the browser redirect
          } else {
            showToast('Error generando link de pago. Por favor contacta soporte.', 'error');
            setIsSubmitting(false);
            setStep('form');
          }
        } catch (err) {
          console.error(err);
          showToast('Error conectando a Tilopay. Intenta de nuevo.', 'error');
          setIsSubmitting(false);
          setStep('form');
        }
      } else {
        setIsSubmitting(false);
        clearCart();
        setStep('success');
      }
    } else {
      setIsSubmitting(false);
      showToast("Hubo un error procesando tu orden. Por favor intenta de nuevo.", "error");
    }
  };

  return (
    <div className={styles.checkoutContainer}>
      <div className={styles.header}>
        <h1>Finalizar Compra</h1>
        <p>Procesamiento seguro y encriptado</p>
      </div>

      <div className={styles.content}>
        {(step === 'verifying' || step === 'redirecting') && !stockStatus && (
          <div className={styles.verificationCard}>
            <Loader2 className={styles.spinner} size={48} />
            <h2>{loadingMsg}</h2>
            <p>{step === 'redirecting' ? 'Por favor no cierres esta ventana, serás redirigido a Tilopay en unos segundos...' : 'Por favor espera un momento mientras reservamos tu orden en el sistema.'}</p>
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
          <form onSubmit={handleCheckoutSubmit} className={styles.checkoutLayout}>
            <div className={styles.formSection}>
              <h2>Información de Envío</h2>
              <div className={styles.form}>
                <div className={styles.inputGroup}>
                  <label>Nombre Completo</label>
                  <input required type="text" placeholder="Juan Pérez" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className={styles.inputGroup}>
                  <label>Correo Electrónico</label>
                  <input required type="email" placeholder="juan@ejemplo.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div className={styles.inputGroup}>
                  <label>Provincia</label>
                  <select required value={selectedProv} onChange={e => setSelectedProv(e.target.value)} className={styles.selectInput}>
                    <option value="">Seleccione Provincia</option>
                    {Object.entries(provincias).map(([id, name]) => (
                      <option key={id} value={id}>{name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div className={styles.inputGroup} style={{ flex: 1 }}>
                    <label>Cantón</label>
                    <select required value={selectedCanton} onChange={e => setSelectedCanton(e.target.value)} disabled={!selectedProv} className={styles.selectInput}>
                      <option value="">Seleccione Cantón</option>
                      {Object.entries(cantones).map(([id, name]) => (
                        <option key={id} value={id}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.inputGroup} style={{ flex: 1 }}>
                    <label>Distrito</label>
                    <select required value={selectedDistrito} onChange={e => setSelectedDistrito(e.target.value)} disabled={!selectedCanton} className={styles.selectInput}>
                      <option value="">Seleccione Distrito</option>
                      {Object.entries(distritos).map(([id, name]) => (
                        <option key={id} value={id}>{name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label>Dirección Exacta</label>
                  <input required type="text" placeholder="100m norte de la iglesia..." value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                </div>
                <div className={styles.inputGroup}>
                  <label>Celular</label>
                  <input required type="tel" placeholder="7097-3376" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>

              </div>
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
                    <span className={styles.itemPrice}>₡{(item.price * exchangeRate * item.qty).toLocaleString('es-CR', { maximumFractionDigits: 0 })}</span>
                  </div>
                ))}
              </div>

              <div className={styles.totals}>
                <div className={styles.totalRow}>
                  <span>Subtotal</span>
                  <span>₡{(subtotal * exchangeRate).toLocaleString('es-CR', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className={styles.totalRow}>
                  <span>Impuestos</span>
                  <span>₡{(ivaAmount * exchangeRate).toLocaleString('es-CR', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className={styles.totalRow}>
                  <span>Envío Nacional</span>
                  <span>₡{(shippingCost * exchangeRate).toLocaleString('es-CR', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                  <span>Total a Pagar</span>
                  <div style={{ textAlign: 'right' }}>
                    <div>₡{totalCRC.toLocaleString('es-CR', { maximumFractionDigits: 0 })} CRC</div>
                  </div>
                </div>
              </div>

              <div className={styles.paymentSectionRight} style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div className={styles.paymentMethods}>
                  <h3>Método de Pago</h3>
                  <div className={styles.radioGroup}>
                    <label className={styles.radioLabel}>
                      <input type="radio" name="payment" value="TARJETA" checked={formData.paymentMethod === 'TARJETA'} onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })} />
                      Tarjeta de Crédito/Débito
                    </label>
                    <label className={styles.radioLabel}>
                      <input type="radio" name="payment" value="SINPE" checked={formData.paymentMethod === 'SINPE'} onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })} />
                      SINPE Móvil (Requiere Aprobación)
                    </label>
                    <label className={styles.radioLabel}>
                      <input type="radio" name="payment" value="TRANSFERENCIA" checked={formData.paymentMethod === 'TRANSFERENCIA'} onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })} />
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
                        <p style={{ margin: 0, fontWeight: 600 }}>Cta: {adminConfig?.transferAccount} <br />Nombre: {adminConfig?.transferName}</p>
                      </>
                    )}
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className={styles.submitBtn} style={{ width: '100%' }}>
                  {isSubmitting ? 'Procesando...' : `Confirmar y Pagar ₡${totalCRC.toLocaleString('es-CR', { maximumFractionDigits: 0 })}`}
                </button>
              </div>

            </div>
          </form>
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
