"use client";

import { useState } from 'react';
import PartItemCard from './PartItemCard';
import { Search } from 'lucide-react';

export default function DiagramPartsList({ parts, config, vehicleMeta }) {
  const [filterText, setFilterText] = useState('');

  const filteredParts = parts.filter(part => {
    if (!filterText) return true;
    const term = filterText.toLowerCase();
    // Validar únicamente contra el número de referencia del diagrama (diagram_ref)
    return part.diagram_ref?.toLowerCase().includes(term);
  });

  return (
    <>
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          placeholder="Filtrar por # en el diagrama..." 
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          style={{
            width: '100%',
            padding: '0.8rem 1rem 0.8rem 2.8rem',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            outline: 'none',
            boxShadow: 'var(--shadow-sm)'
          }}
          onFocus={(e) => { e.target.style.borderColor = 'var(--accent-red)' }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {filteredParts.length === 0 && (
           <p style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
             No se encontraron piezas con el filtro actual.
           </p>
        )}
        {filteredParts.map((part, index) => {
          const basePrice = part.price || 0;
          const finalPriceUSD = basePrice * (config.marginMultiplier || 1.0);
          const finalPriceCRC = finalPriceUSD * (config.exchangeRate || 515.0);

          return (
            <PartItemCard 
              key={`${part.sku}-${index}`} 
              part={part} 
              finalPriceUSD={finalPriceUSD} 
              finalPriceCRC={finalPriceCRC} 
              vehicleMeta={vehicleMeta}
            />
          );
        })}
      </div>
    </>
  );
}
