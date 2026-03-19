"use client";
import { use } from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { dummyComponents, formatCategoryTitle } from '@/lib/dummyData';
import styles from './ModelComponents.module.css';

export default function ModelComponentsView({ params }) {
  const unwrappedParams = use(params);
  const { category, make, year, model } = unwrappedParams;
  
  const displayMake = make.charAt(0).toUpperCase() + make.slice(1);
  const displayModel = model.toUpperCase().replace(/-/g, ' ');

  return (
    <div className={styles.container}>
      {/* Breadcrumbs */}
      <div className={styles.breadcrumbs}>
        <Link href="/">Inicio</Link>
        <ChevronRight size={14} />
        <Link href={`/catalog/${category}`}>{formatCategoryTitle(category)}</Link>
        <ChevronRight size={14} />
        <span className={styles.activeCrumb}>{displayMake} {year} {displayModel}</span>
      </div>

      <div className={styles.header}>
        <Link href={`/catalog/${category}`} className={styles.backBtn}>
          <ArrowLeft size={18} /> Cambiar Vehículo
        </Link>
        <h1>{year} {displayMake} {displayModel}</h1>
        <p>Selecciona un componente a continuación para ver el diagrama y la lista de repuestos.</p>
      </div>

      <div className={styles.grid}>
        {dummyComponents.map(comp => (
          <Link 
            key={comp.id} 
            href={`/catalog/${category}/${make}/${year}/${model}/${comp.id}`}
            className={`${styles.componentCard} glass-panel`}
          >
            <div className={styles.imagePlaceholder}>
                Diagrama de {comp.name}
            </div>
            <div className={styles.cardTitle}>
              {comp.name}
              <ChevronRight size={18} className={styles.cardArrow} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
