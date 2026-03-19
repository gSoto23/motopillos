"use client";
import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowLeft, ShoppingCart, Plus, Minus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatCategoryTitle, dummyComponents } from '@/lib/dummyData';
import { getComponentParts } from '@/app/actions/catalogActions';
import styles from './AssemblyView.module.css';

export default function AssemblyView({ params }) {
  const unwrappedParams = use(params);
  const { category, make, year, model, component } = unwrappedParams;
  const { addToCart } = useCart();
  
  const displayMake = make.charAt(0).toUpperCase() + make.slice(1);
  const displayModel = model.toUpperCase().replace(/-/g, ' ');
  const componentInfoFallback = dummyComponents.find(c => c.id === component) || { name: component };

  const [hoveredPart, setHoveredPart] = useState(null);
  const [dbParts, setDbParts] = useState([]);
  const [dbComponent, setDbComponent] = useState(null);
  
  useEffect(() => {
    async function loadData() {
      const res = await getComponentParts(component, model);
      if (res.parts.length > 0) {
        setDbParts(res.parts);
        setDbComponent(res.component);
      }
    }
    loadData();
  }, [component]);

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumbs}>
        <Link href="/">Inicio</Link>
        <ChevronRight size={14} />
        <span className={styles.routeCrumb}>{displayMake}</span>
        <ChevronRight size={14} />
        <span className={styles.routeCrumb}>{year} {displayModel}</span>
        <ChevronRight size={14} />
        <span className={styles.activeCrumb}>{dbComponent ? dbComponent.name : componentInfoFallback.name}</span>
      </div>

      <div className={styles.splitLayout}>
        {/* LEFT: Diagram View */}
        <div className={`${styles.diagramSection} glass-panel`}>
           <div className={styles.diagramHeader}>
             <h2>Diagrama de {dbComponent ? dbComponent.name : componentInfoFallback.name}</h2>
           </div>
           
           <div className={styles.diagramCanvas}>
             {/* Simulating the diagram with hotspots */}
             <div className={styles.placeholderImage}>
                <span className={styles.watermark}>MOTOPILLOS DIAGRAM VIEWER</span>
                
                {dbParts.map((part) => {
                  const hasHotspot = part.hotspotX !== null && part.hotspotY !== null;
                  if (!hasHotspot) return null;
                  
                  return (
                  <div 
                    key={part.id}
                    className={`${styles.hotspot} ${hoveredPart === part.refNumber ? styles.hotspotActive : ''}`}
                    style={{ top: `${part.hotspotY}%`, left: `${part.hotspotX}%` }}
                    onMouseEnter={() => setHoveredPart(part.refNumber)}
                    onMouseLeave={() => setHoveredPart(null)}
                  />
                )})}
             </div>
           </div>
        </div>

        {/* RIGHT: Parts Table */}
        <div className={`${styles.tableSection} glass-panel`}>
          <div className={styles.tableHeader}>
            <h3>Lista de Repuestos</h3>
          </div>
          <div className={styles.partsTable}>
            <div className={styles.tableRowHeader}>
              <div className={styles.colRef}>#</div>
              <div className={styles.colDesc}>Descripción</div>
              <div className={styles.colPrice}>Precio</div>
              <div className={styles.colAction}>CANT</div>
            </div>
            
            <div className={styles.tableBody}>
               {dbParts.length > 0 ? dbParts.map(part => (
                 <div 
                   key={part.id} 
                   className={`${styles.tableRow} ${hoveredPart === part.refNumber ? styles.rowActive : ''}`}
                   onMouseEnter={() => setHoveredPart(part.refNumber)}
                   onMouseLeave={() => setHoveredPart(null)}
                 >
                   <div className={styles.colRef}>
                     <span className={styles.refBadge}>{part.refNumber}</span>
                   </div>
                   <div className={styles.colDesc}>
                     <div className={styles.partName}>{part.name}</div>
                     <div className={styles.partNumber}>{part.partNumber}</div>
                     <div className={`${styles.partStock} ${part.stockStatus.includes('In Stock') ? styles.stockIn : styles.stockOut}`}>
                       {part.stockStatus}
                     </div>
                   </div>
                   <div className={styles.colPrice}>
                     <div className={styles.salePrice}>${part.basePriceSale.toFixed(2)}</div>
                     {part.basePriceMSRP > part.basePriceSale && (
                       <div className={styles.msrpPrice}>MSRP: <span>${part.basePriceMSRP.toFixed(2)}</span></div>
                     )}
                   </div>
                   <div className={styles.colAction}>
                     <div className={styles.qtyControl}>
                       <button className={styles.qtyBtn}><Minus size={14}/></button>
                       <input type="number" defaultValue="1" className={styles.qtyInput} min="1"/>
                       <button className={styles.qtyBtn}><Plus size={14}/></button>
                     </div>
                     <button 
                       className={styles.addBtn} 
                       aria-label="Agregar al carrito"
                       onClick={() => addToCart({
                         ref: part.refNumber,
                         name: part.name,
                         partNo: part.partNumber,
                         price: part.basePriceSale
                       }, 1)}
                     >
                       <ShoppingCart size={18} />
                     </button>
                   </div>
                 </div>
               )) : <div className={styles.emptyState}>No hay repuestos indexados para este componente.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
