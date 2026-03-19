import styles from "./page.module.css";
import Link from 'next/link';
import { ChevronRight, Settings, Wrench, Navigation, Bike, Compass } from 'lucide-react';

export default function Home() {
  const categories = [
    { title: "ATV", icon: <Settings size={32} />, href: "/catalog/atv", count: "+8k Repuestos" },
    { title: "Sport Bikes", icon: <Bike size={32} />, href: "/catalog/sport-bike", count: "+12k Repuestos" },
    { title: "Dirt Bikes", icon: <Wrench size={32} />, href: "/catalog/dirt-bike", count: "+15k Repuestos" },
    { title: "Touring", icon: <Navigation size={32} />, href: "/catalog/touring", count: "+5k Repuestos" },
    { title: "Cruiser", icon: <Compass size={32} />, href: "/catalog/cruiser", count: "+4k Repuestos" },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Encuentra repuestos 100% originales exactos para tu <span className={styles.highlight}>moto.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            La mayor variedad de marcas, años y modelos
          </p>
        </div>
        
        <div className={styles.heroGridContainer}>
          <div className={styles.grid}>
            {categories.map((cat, i) => (
              <Link href={cat.href} key={i} className={`${styles.card} glass-panel`}>
                <div className={styles.cardIcon}>
                  {cat.icon}
                </div>
                <div className={styles.cardContent}>
                  <h3>{cat.title}</h3>
                  <span className={styles.partCount}>{cat.count}</span>
                </div>
                <div className={styles.cardArrow}>
                  <ChevronRight size={24} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className={styles.heroBackground}>
          <div className={styles.gradientOrb1}></div>
          <div className={styles.gradientOrb2}></div>
        </div>
      </header>
    </div>
  );
}
