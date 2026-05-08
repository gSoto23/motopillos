"use client";

import { useState } from 'react';
import { CheckCircle, Clock, XCircle, Search, RefreshCw, MessageCircle, PackageCheck, Eye, X, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, ShoppingCart, Copy } from 'lucide-react';
import styles from '../AdminDashboard.module.css';
import { updateOrderStatus, syncTilopayOrder, markOrderAsPurchased } from '@/app/actions/orderAdminActions';
import { useUI } from '@/context/UIContext';

export default function OrdersTableClient({ initialOrders, adminConfig, userRole }) {
  const { showToast, showConfirm, showPrompt } = useUI();
  const [orders, setOrders] = useState(initialOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null); // id of order being processed

  const openModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handlePurchased = (order) => {
    const shortId = order.id.split('-')[0].toUpperCase();
    showPrompt(
      `¿Marcar la orden #${shortId} como COMPRADA en el proveedor? Ingresa el Order ID de Partzilla o notas:`,
      "Ej. Order #123456",
      async (supplierDetails) => {
        if (!supplierDetails) {
          showToast('Debes ingresar los detalles del proveedor para continuar', 'error');
          return;
        }
        setLoadingAction(order.id);
        const res = await markOrderAsPurchased(order.id, supplierDetails);
        if (res.success) {
          setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'PURCHASED', supplierDetails } : o));
          showToast('Orden marcada como comprada', 'success');
        } else {
          showToast('Error marcando como comprada: ' + res.error, 'error');
        }
        setLoadingAction(null);
      }
    );
  };

  const handleApprove = (order) => {
    const shortId = order.id.split('-')[0].toUpperCase();
    showConfirm(`¿Estás seguro de que quieres aprobar la orden #${shortId} de ${order.customerName}?`, async () => {
      setLoadingAction(order.id);
      const res = await updateOrderStatus(order.id, 'APPROVED');
      if (res.success) {
        setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'APPROVED' } : o));
        showToast('Orden aprobada', 'success');
      } else {
        showToast('Error aprobando orden: ' + res.error, 'error');
      }
      setLoadingAction(null);
    });
  };

  const handleDeliver = (order) => {
    const shortId = order.id.split('-')[0].toUpperCase();
    showConfirm(`¿Marcar la orden #${shortId} de ${order.customerName} como entregada?`, async () => {
      setLoadingAction(order.id);
      const res = await updateOrderStatus(order.id, 'DELIVERED');
      if (res.success) {
        setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'DELIVERED' } : o));
        showToast('Orden marcada como entregada', 'success');
      } else {
        showToast('Error actualizando orden: ' + res.error, 'error');
      }
      setLoadingAction(null);
    });
  };

  const handleSyncTilopay = async (orderId) => {
    setLoadingAction(orderId);
    const res = await syncTilopayOrder(orderId);
    if (res.success) {
      if (res.statusUpdated) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'APPROVED' } : o));
        showToast('Pago sincronizado exitosamente. Orden aprobada.', 'success');
      } else {
        showToast('El pago no figura como aprobado en Tilopay todavía.', 'info');
      }
    } else {
      showToast('Error sincronizando con Tilopay: ' + res.error, 'error');
    }
    setLoadingAction(null);
  };

  const copyAllSkus = () => {
    if (!selectedOrder) return;
    try {
      const items = JSON.parse(selectedOrder.itemsList);
      const skus = items.map(item => item.partNumber || item.partNo).filter(Boolean).join('\n');
      if (skus) {
        navigator.clipboard.writeText(skus);
        showToast('SKUs copiados al portapapeles', 'success');
      } else {
        showToast('No hay SKUs para copiar en esta orden', 'error');
      }
    } catch (e) {
      showToast('Error leyendo items', 'error');
    }
  };

  const formatPhoneForWA = (phone) => {
    const clean = phone.replace(/\D/g, '');
    return clean.startsWith('506') ? clean : `506${clean}`;
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateTime = (dateString) => {
    const d = new Date(dateString);
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${formatDate(dateString)} ${time}`;
  };

  const getWhatsAppMessage = (order) => {
    if (order.status === 'PENDING') {
      const amountCRC = (order.totalAmount * (adminConfig?.exchangeRate || 515)).toLocaleString('es-CR', { maximumFractionDigits: 0 });
      const accountInfo = order.paymentMethod === 'SINPE' ? 'al teléfono 8888-8888' : 'a la cuenta CR12015201001234567890';
      return `Hola ${order.customerName}, gracias por tu compra en Motopillos (Orden #${order.id.split('-')[0].toUpperCase()}). Para proceder con el envío, por favor realiza el depósito por ₡${amountCRC} ${accountInfo} y adjunta por este medio el comprobante de pago.`;
    } else {
      return `Hola ${order.customerName}, te contactamos de Motopillos referente a tu orden #${order.id.split('-')[0].toUpperCase()}.`;
    }
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} className={styles.sortIcon} />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp size={14} className={`${styles.sortIcon} ${styles.active}`} />
      : <ArrowDown size={14} className={`${styles.sortIcon} ${styles.active}`} />;
  };

  const sortedOrders = [...orders].sort((a, b) => {
    let valA = a[sortConfig.key];
    let valB = b[sortConfig.key];
    
    // Custom sort parsing if necessary (e.g. string vs date)
    if (sortConfig.key === 'createdAt') {
      valA = new Date(valA).getTime();
      valB = new Date(valB).getTime();
    }
    
    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredOrders = sortedOrders.filter(o => {
    const searchLower = searchTerm.toLowerCase();
    const dateStr = formatDate(o.createdAt);
    return (
      o.customerName.toLowerCase().includes(searchLower) || 
      o.id.toLowerCase().includes(searchLower) ||
      (o.customerPhone && o.customerPhone.toLowerCase().includes(searchLower)) ||
      (o.status && o.status.toLowerCase().includes(searchLower)) ||
      dateStr.includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const currentData = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to page 1 on search
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Buscar por orden, cliente, teléfono, estado, fecha..." 
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', width: '300px' }}
          />
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
        </div>
      </div>
      <div className={styles.tableContainer}>
        <table className={styles.ordersTable}>
          <thead>
            <tr>
              <th onClick={() => requestSort('id')} className={styles.sortableHeader}>Orden ID {getSortIcon('id')}</th>
              <th onClick={() => requestSort('customerName')} className={styles.sortableHeader}>Cliente {getSortIcon('customerName')}</th>
              <th onClick={() => requestSort('paymentMethod')} className={styles.sortableHeader}>Método {getSortIcon('paymentMethod')}</th>
              <th onClick={() => requestSort('totalAmount')} className={styles.sortableHeader}>Total {getSortIcon('totalAmount')}</th>
              <th onClick={() => requestSort('status')} className={styles.sortableHeader}>Estado {getSortIcon('status')}</th>
              <th onClick={() => requestSort('createdAt')} className={styles.sortableHeader}>Fecha {getSortIcon('createdAt')}</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length === 0 ? (
              <tr>
                <td colSpan="7" className={styles.emptyState}>No se encontraron órdenes.</td>
              </tr>
            ) : (
              currentData.map(order => {
                const isProcessing = loadingAction === order.id;
                
                return (
                  <tr key={order.id}>
                    <td className={styles.mono} style={{ fontWeight: 600 }}>
                      #{order.id.split('-')[0].toUpperCase()}
                    </td>
                    <td>
                      <div className={styles.clientName}>{order.customerName}</div>
                      <div className={styles.clientContact}>{order.customerPhone}</div>
                    </td>
                    <td><span className={styles.methodBadge}>{order.paymentMethod}</span></td>
                    <td className={styles.priceCell}>
                      <div style={{ fontWeight: 600 }}>
                        ₡{(order.totalAmount * (adminConfig?.exchangeRate || 515)).toLocaleString('es-CR', { maximumFractionDigits: 0 })}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                        <span className={`${styles.statusBadge} ${styles[order.status.toLowerCase()] || ''}`}>
                          {order.status === 'APPROVED' ? <CheckCircle size={14}/> : 
                           order.status === 'PURCHASED' ? <ShoppingCart size={14}/> : 
                           order.status === 'DELIVERED' ? <PackageCheck size={14}/> : 
                           order.status === 'PENDING' ? <Clock size={14}/> : <XCircle size={14}/>}
                          {order.status}
                        </span>
                        {order.status !== 'PENDING' && order.updatedAt && (
                          <span style={{ fontSize: '0.75em', color: 'var(--text-muted)' }}>
                            {formatDateTime(order.updatedAt)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={styles.dateCell}>{formatDate(order.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button 
                          className={styles.actionBtn} 
                          onClick={() => openModal(order)}
                          style={{ padding: '0.4rem 0.6rem' }}
                          title="Ver Detalles"
                        >
                          <Eye size={16} />
                        </button>

                        {(order.paymentMethod === 'SINPE' || order.paymentMethod === 'TRANSFERENCIA') && (
                          <a 
                            href={`https://wa.me/${formatPhoneForWA(order.customerPhone)}?text=${encodeURIComponent(getWhatsAppMessage(order))}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={styles.actionBtn}
                            style={{ backgroundColor: '#25D366', color: 'white', border: 'none', padding: '0.4rem 0.6rem' }}
                            title="Contactar por WhatsApp"
                          >
                            <MessageCircle size={16} />
                          </a>
                        )}

                        {order.status === 'PENDING' && (order.paymentMethod === 'SINPE' || order.paymentMethod === 'TRANSFERENCIA') && (
                          <button 
                            className={styles.actionBtn} 
                            onClick={() => handleApprove(order)}
                            disabled={isProcessing}
                            style={{ backgroundColor: '#10b981', color: 'white', border: 'none' }}
                          >
                            Aprobar
                          </button>
                        )}

                        {order.status === 'PENDING' && order.paymentMethod === 'TARJETA' && (
                          <button 
                            className={styles.actionBtn} 
                            onClick={() => handleSyncTilopay(order.id)}
                            disabled={isProcessing}
                            style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '0.4rem 0.6rem' }}
                            title="Sincronizar Tilopay"
                          >
                            <RefreshCw size={16} className={isProcessing ? styles.spin : ''} />
                          </button>
                        )}

                        {order.status === 'APPROVED' && userRole === 'MASTER_ADMIN' && (
                          <button 
                            className={styles.actionBtn} 
                            onClick={() => handlePurchased(order)}
                            disabled={isProcessing}
                            style={{ backgroundColor: '#8b5cf6', color: 'white', border: 'none' }}
                            title="Comprado en Proveedor"
                          >
                            Comprado
                          </button>
                        )}

                        {(order.status === 'APPROVED' || order.status === 'PURCHASED') && (
                          <button 
                            className={styles.actionBtn} 
                            onClick={() => handleDeliver(order)}
                            disabled={isProcessing}
                            style={{ backgroundColor: '#f59e0b', color: 'white', border: 'none' }}
                          >
                            Entregado
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <div className={styles.paginationInfo}>
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredOrders.length)} de {filteredOrders.length} órdenes
            </div>
            <div className={styles.paginationControls}>
              <button 
                className={styles.pageBtn} 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button 
                  key={i} 
                  className={`${styles.pageBtn} ${currentPage === i + 1 ? styles.active : ''}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button 
                className={styles.pageBtn} 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && selectedOrder && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Detalles de Orden</h2>
              <button onClick={closeModal} className={styles.closeBtn}><X size={24} /></button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.modalSection}>
                <h3>Información General</h3>
                <p><strong>Hash:</strong> {selectedOrder.id}</p>
                <p><strong>Fecha:</strong> {formatDateTime(selectedOrder.createdAt)}</p>
                <p><strong>Estado:</strong> {selectedOrder.status}</p>
                <p><strong>Método de Pago:</strong> {selectedOrder.paymentMethod}</p>
                {selectedOrder.supplierDetails && (
                  <p><strong>Detalles Proveedor:</strong> {selectedOrder.supplierDetails}</p>
                )}
              </div>

              <div className={styles.modalSection}>
                <h3>Cliente y Envío</h3>
                <p><strong>Nombre:</strong> {selectedOrder.customerName}</p>
                <p><strong>Email:</strong> {selectedOrder.customerEmail}</p>
                <p><strong>Teléfono:</strong> {selectedOrder.customerPhone}</p>
                <p><strong>Dirección:</strong> {selectedOrder.shippingAddress}</p>
              </div>

              <div className={styles.modalSection}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h3 style={{ margin: 0 }}>Items Comprados</h3>
                  <button 
                    onClick={copyAllSkus}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    <Copy size={14} /> Copiar SKUs
                  </button>
                </div>
                <ul className={styles.itemList}>
                  {(() => {
                    try {
                      const items = JSON.parse(selectedOrder.itemsList);
                      return items.map((item, i) => (
                        <li key={i} className={styles.itemRow}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span>{item.qty}x {item.name}</span>
                            {(item.partNumber || item.partNo) && (
                              <span style={{ fontSize: '0.8em', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                                SKU: {item.partNumber || item.partNo}
                              </span>
                            )}
                          </div>
                          <span>${(item.price * item.qty).toFixed(2)}</span>
                        </li>
                      ));
                    } catch (e) {
                      return <li>Error leyendo items</li>;
                    }
                  })()}
                </ul>
              </div>

              <div className={styles.modalSection}>
                <h3>Totales</h3>
                <div className={styles.totalsRow}>
                  <span>Total a Pagar:</span>
                  <strong>₡{(selectedOrder.totalAmount * (adminConfig?.exchangeRate || 515)).toLocaleString('es-CR', { maximumFractionDigits: 0 })}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
