"use client";

import { useState } from 'react';
import { Package, CheckCircle, PackageCheck, Clock, XCircle, ShoppingCart, X, Eye } from 'lucide-react';

export default function OrderHistoryClient({ orders, exchangeRate = 515 }) {
  const [selectedOrder, setSelectedOrder] = useState(null);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'APPROVED': return <span style={{ padding: '4px 10px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}><CheckCircle size={14}/> APROBADO</span>;
      case 'PURCHASED': return <span style={{ padding: '4px 10px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}><ShoppingCart size={14}/> PROCESANDO</span>;
      case 'DELIVERED': return <span style={{ padding: '4px 10px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}><PackageCheck size={14}/> ENTREGADO</span>;
      case 'PENDING': return <span style={{ padding: '4px 10px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}><Clock size={14}/> PENDIENTE</span>;
      default: return <span style={{ padding: '4px 10px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}><XCircle size={14}/> CANCELADO</span>;
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const formatDateTime = (dateString) => {
    const d = new Date(dateString);
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${formatDate(dateString)} ${time}`;
  };

  return (
    <>
      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
          <Package size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
          <p>Aún no tienes compras registradas.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
          {orders.map(order => (
            <div 
              key={order.id} 
              onClick={() => setSelectedOrder(order)}
              style={{ 
                border: '1px solid var(--border-focus)', 
                borderRadius: '8px', 
                padding: '1rem', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: 'var(--bg-secondary)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-red)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-focus)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  #{order.id.split('-')[0].toUpperCase()}
                </strong>
                {getStatusBadge(order.status)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <span>{formatDate(order.createdAt)}</span>
                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>₡{(order.totalAmount * exchangeRate).toLocaleString('es-CR', { maximumFractionDigits: 0 })}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Método: {order.paymentMethod}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-red)' }}><Eye size={14} /> Ver Detalle</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <div 
          onClick={() => setSelectedOrder(null)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Detalle de Orden #{selectedOrder.id.split('-')[0].toUpperCase()}</h2>
              <button 
                onClick={() => setSelectedOrder(null)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex' }}
              >
                <X size={24} />
              </button>
            </div>
            
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Fecha de orden</div>
                  <div style={{ fontWeight: 500 }}>{formatDateTime(selectedOrder.createdAt)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Estado actual</div>
                  <div style={{ marginTop: '4px' }}>{getStatusBadge(selectedOrder.status)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Método de pago</div>
                  <div style={{ fontWeight: 500 }}>{selectedOrder.paymentMethod}</div>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-focus)' }}>Items Comprados</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {(() => {
                    try {
                      const items = JSON.parse(selectedOrder.itemsList);
                      return items.map((item, i) => (
                        <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontWeight: 500 }}>{item.qty}x {item.name}</span>
                            {(item.partNumber || item.partNo) && (
                              <span style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                                SKU: {item.partNumber || item.partNo}
                              </span>
                            )}
                          </div>
                          <span style={{ fontWeight: 600 }}>₡{(item.price * item.qty * exchangeRate).toLocaleString('es-CR', { maximumFractionDigits: 0 })}</span>
                        </li>
                      ));
                    } catch (e) {
                      return <li>Error leyendo items</li>;
                    }
                  })()}
                </ul>
              </div>

              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-focus)' }}>Resumen</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Subtotal</span>
                    <span>
                      {(() => {
                        try {
                          const items = JSON.parse(selectedOrder.itemsList);
                          const subtotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
                          return `₡${(subtotal * exchangeRate).toLocaleString('es-CR', { maximumFractionDigits: 0 })}`;
                        } catch(e) { return '-'; }
                      })()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Impuestos (13%)</span>
                    <span>
                      {(() => {
                        try {
                          const items = JSON.parse(selectedOrder.itemsList);
                          const subtotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
                          const taxes = subtotal * 0.13;
                          return `₡${(taxes * exchangeRate).toLocaleString('es-CR', { maximumFractionDigits: 0 })}`;
                        } catch(e) { return '-'; }
                      })()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Envío Nacional</span>
                    <span>
                      {(() => {
                        try {
                          const items = JSON.parse(selectedOrder.itemsList);
                          const subtotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
                          const taxes = subtotal * 0.13;
                          const shipping = selectedOrder.totalAmount - subtotal - taxes;
                          // Avoid floating point display issues by rounding or showing 0 if negative
                          return `₡${(Math.max(0, shipping) * exchangeRate).toLocaleString('es-CR', { maximumFractionDigits: 0 })}`;
                        } catch(e) { return '-'; }
                      })()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-focus)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Total Pagado</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-red)' }}>
                      ₡{(selectedOrder.totalAmount * exchangeRate).toLocaleString('es-CR', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
