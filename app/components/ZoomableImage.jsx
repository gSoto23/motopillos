"use client";
import { useState } from 'react';
import { ZoomIn, X } from 'lucide-react';

export default function ZoomableImage({ src, alt }) {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <>
      <div 
        onClick={() => setIsZoomed(true)}
        style={{ position: 'relative', cursor: 'zoom-in', display: 'inline-block', width: '100%' }}
      >
        <img 
          src={src} 
          alt={alt}
          style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
        />
        <div style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          padding: '0.4rem',
          borderRadius: '50%',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <ZoomIn size={20} />
        </div>
      </div>

      {isZoomed && (
        <div 
          onClick={() => setIsZoomed(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.9)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out',
            flexDirection: 'column'
          }}
        >
          <div style={{ position: 'absolute', top: '20px', right: '20px', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
             <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Cerrar</span>
             <X size={32} />
          </div>
          
          <img 
            src={src} 
            alt={alt}
            style={{ 
              maxWidth: '95vw', 
              maxHeight: '90vh', 
              objectFit: 'contain', 
              backgroundColor: 'white', 
              padding: '1rem', 
              borderRadius: '8px' 
            }}
          />
        </div>
      )}
    </>
  );
}
