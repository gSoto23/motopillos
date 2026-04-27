"use client";
import { useState } from 'react';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import styles from '../catalog/diagram/[categoryId]/Diagram.module.css';
import { useCart } from '@/context/CartContext';

export default function PartItemCard({ part, finalPriceUSD, finalPriceCRC, vehicleMeta }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const isAvailable = finalPriceUSD > 0;

  const increment = () => setQuantity(prev => {
    if (!isAvailable) return prev;
    return prev + 1;
  });
  const decrement = () => setQuantity(prev => {
    if (!isAvailable) return prev;
    return prev > 1 ? prev - 1 : 1;
  });

  // Agregar al Cart Context real
  const handleAddToCart = () => {
    if (!isAvailable) return;
    addToCart({
      partNo: part.sku,
      name: part.name,
      price: finalPriceUSD,
      priceCRC: finalPriceCRC,
      ref: part.diagram_ref,
      meta: vehicleMeta
    }, quantity);
    
    // Reiniciamos el contador a 1 por conveniencia
    setQuantity(1);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--bg-primary)',
      padding: '1rem',
      border: '1px solid var(--border-color)',
      borderRadius: '0.5rem',
      gap: '1rem'
    }}>
      {/* Información del Repuesto */}
      <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
        <span style={{ 
          backgroundColor: 'var(--text-primary)', 
          color: 'var(--bg-primary)', 
          padding: '0.2rem 0.5rem', 
          borderRadius: '6px',
          fontSize: '0.8rem',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          marginTop: '0.2rem'
        }}>
          #{part.diagram_ref}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.25rem' }}>
            {part.sku}
          </div>
          <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)', display: 'block', lineHeight: '1.4' }}>
            {part.name}
          </strong>
        </div>
      </div>

      {/* Zona Inferior: Precio + Controladores */}
      <div className={styles.cardBottom}>
        
        {/* Precios Fijos o Totales basados en cantidad */}
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
          {isAvailable ? (
            <>
              <strong style={{ color: 'var(--price-color)', fontSize: '1.25rem' }}>
                ${(finalPriceUSD * quantity).toFixed(2)}
              </strong>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                ¢{Math.round(finalPriceCRC * quantity).toLocaleString('es-CR')}
              </span>
            </>
          ) : (
            <strong style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.2rem' }}>
              No Disponible
            </strong>
          )}
        </div>

        {/* Acciones: Selector y Botón */}
        <div className={styles.cardActions}>
          
          {/* Selector de Cantidad */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            <button 
              onClick={decrement}
              disabled={!isAvailable}
              style={{ background: 'none', border: 'none', padding: '0.5rem', color: isAvailable ? 'var(--text-primary)' : 'var(--text-muted)', cursor: isAvailable && quantity > 1 ? 'pointer' : 'not-allowed', opacity: isAvailable && quantity > 1 ? 1 : 0.5 }}
            >
              <Minus size={16} />
            </button>
            <span style={{ width: '2rem', textAlign: 'center', fontWeight: 'bold', fontSize: '1rem', color: isAvailable ? 'var(--text-primary)' : 'var(--text-muted)' }}>
              {quantity}
            </span>
            <button 
              onClick={increment}
              disabled={!isAvailable}
              style={{ background: 'none', border: 'none', padding: '0.5rem', color: isAvailable ? 'var(--text-primary)' : 'var(--text-muted)', cursor: isAvailable ? 'pointer' : 'not-allowed', opacity: isAvailable ? 1 : 0.5 }}
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Botón Añadir */}
          <button 
            onClick={handleAddToCart}
            disabled={!isAvailable}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: isAvailable ? 'var(--accent-red)' : 'var(--bg-tertiary)',
              color: isAvailable ? 'white' : 'var(--text-muted)',
              border: isAvailable ? 'none' : '1px solid var(--border-color)',
              padding: '0 1rem',
              borderRadius: '6px',
              cursor: isAvailable ? 'pointer' : 'not-allowed',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              transition: 'background-color 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            <ShoppingCart size={18} />
            <span className="hide-on-very-small">Añadir</span>
          </button>
        </div>

      </div>
    </div>
  );
}
