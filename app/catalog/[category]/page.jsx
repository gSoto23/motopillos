"use client";
import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { dummyMakes, dummyYears, dummyModels, formatCategoryTitle } from '@/lib/dummyData';
import styles from './VehicleSelector.module.css';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CategorySelector({ params }) {
  const unwrappedParams = use(params);
  const { category } = unwrappedParams;
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState({ make: null, year: null, model: null });

  const handleSelectMake = (make) => {
    setSelections({ ...selections, make, year: null, model: null });
    setStep(2);
  };

  const handleSelectYear = (year) => {
    setSelections({ ...selections, year, model: null });
    setStep(3);
  };

  const handleSelectModel = (model) => {
    const slug = model.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    router.push(`/catalog/${category}/${selections.make.toLowerCase()}/${selections.year}/${slug}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/" className={styles.backBtn}><ArrowLeft size={20} /> Volver al Inicio</Link>
        <h1>Repuestos de {formatCategoryTitle(category)}</h1>
        <p>Selecciona tu moto para confirmar el ajuste exacto.</p>
      </div>

      <div className={`${styles.selectorCard} glass-panel`}>
        <div className={styles.breadcrumb}>
           <span className={step >= 1 ? styles.activeCrumb : ''}>Marca</span>
           <ChevronRight size={16} />
           <span className={step >= 2 ? styles.activeCrumb : ''}>Año</span>
           <ChevronRight size={16} />
           <span className={step >= 3 ? styles.activeCrumb : ''}>Modelo</span>
        </div>

        <div className={styles.stepContainer}>
          {step === 1 && (
            <div className={styles.gridFadeIn}>
              <div className={styles.stepHeaderRow}>
                 <h2 className={styles.stepTitle}>Elige Marca</h2>
              </div>
              <div className={styles.grid}>
                {dummyMakes.map(make => (
                  <button key={make} onClick={() => handleSelectMake(make)} className={styles.selectionBtn}>
                    {make}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
             <div className={styles.gridFadeIn}>
              <div className={styles.stepHeaderRow}>
                 <button onClick={() => setStep(1)} className={styles.iconBackBtn}><ArrowLeft size={20} /></button>
                 <h2 className={styles.stepTitle}>Elige Año de {selections.make}</h2>
              </div>
              <div className={styles.grid}>
                {dummyYears.map(year => (
                  <button key={year} onClick={() => handleSelectYear(year)} className={styles.selectionBtn}>
                    {year}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
             <div className={styles.gridFadeIn}>
              <div className={styles.stepHeaderRow}>
                 <button onClick={() => setStep(2)} className={styles.iconBackBtn}><ArrowLeft size={20} /></button>
                 <h2 className={styles.stepTitle}>Elige Modelo</h2>
              </div>
              <div className={styles.grid}>
                {dummyModels[selections.make]?.map(model => (
                  <button key={model} onClick={() => handleSelectModel(model)} className={styles.selectionBtn}>
                    {model}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
