"use client";
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { X, ShoppingCart, Trash2, Cpu, ArrowRight } from 'lucide-react';
import styles from './CartDrawer.module.css';

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeFromCart, updateQty, subtotal, subtotalCRC, isLoaded } = useCart();
  const router = useRouter();

  if (!isLoaded) return null; // Wait for hydration

  return (
    <>
      <div 
        className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`} 
        onClick={() => setIsOpen(false)} 
      />
      <div className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`}>
        
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <div className={styles.iconWrapper}>
              <ShoppingCart size={20} className={styles.iconH} />
            </div>
            <h2>Tu Carrito</h2>
          </div>
          <button onClick={() => setIsOpen(false)} className={styles.closeBtn}><X size={20} /></button>
        </div>

        <div className={styles.itemsList}>
          {items.length === 0 ? (
            <div className={styles.emptyCart}>
              <Cpu size={48} className={styles.emptyIcon} />
              <p>Tu inventario está vacío.</p>
              <span>El diseño de tu modelo te espera.</span>
            </div>
          ) : (
            items.map(item => (
              <div key={item.partNo} className={styles.cartItem}>
                <div className={styles.itemRow}>
                  <span className={styles.itemRef}>Ref #{item.ref}</span>
                  <button onClick={() => removeFromCart(item.partNo)} className={styles.removeBtn}>
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <h4 className={styles.itemName}>{item.name}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginBottom: '1rem' }}>
                  <span className={styles.itemPartNo}>OEM: {item.partNo}</span>
                  {item.meta && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      {item.meta}
                    </span>
                  )}
                </div>
                
                <div className={styles.itemFooter}>
                  <div className={styles.qtyControl}>
                    <button onClick={() => updateQty(item.partNo, item.qty - 1)}>-</button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item.partNo, item.qty + 1)}>+</button>
                  </div>
                  <div className={styles.itemPrice} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
                    <span style={{ color: 'var(--price-color)', fontSize: '1.1rem', fontWeight: 'bold' }}>
                      ${(item.price * item.qty).toFixed(2)}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      ¢{Math.round((item.priceCRC || 0) * item.qty).toLocaleString('es-CR')}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className={styles.cartFooter}>
            <div className={styles.subtotalGroup}>
              <span className={styles.subtotalLabel}>Subtotal</span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
                <span className={styles.subtotalValue} style={{ color: 'var(--price-color)', fontSize: '1.25rem', fontWeight: 'bold' }}>
                  ${subtotal.toFixed(2)}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  ¢{Math.round(subtotalCRC || 0).toLocaleString('es-CR')}
                </span>
              </div>
            </div>
            
            <p className={styles.disclaimer}>
              Impuestos y envío calculados al finalizar.
            </p>
            
            <button 
              className={styles.checkoutBtn}
              onClick={() => {
                setIsOpen(false);
                router.push("/checkout");
              }}
            >
              <span>Proceder al Pago</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
