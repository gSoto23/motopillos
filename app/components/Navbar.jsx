"use client";
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingCart, Menu, Sun, Moon } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { totalItems, setIsOpen } = useCart();
  const { theme, toggleTheme } = useTheme();
  
  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <Link href="/">
            <div className={styles.logoWrapper}>
               <Image 
                 src="/logo.png" 
                 alt="Motopillos Logo" 
                 width={150} 
                 height={40} 
                 className={styles.logoImage} 
               />
            </div>
          </Link>
        </div>
        
        <div className={styles.searchBar}>
          <Search size={18} className={styles.searchIcon} />
          <input type="text" placeholder="Buscar por Número de Parte o Nombre..." className={styles.searchInput} />
        </div>

        <div className={styles.navActions}>
          <button onClick={toggleTheme} className={styles.iconBtn} aria-label="Toggle Theme">
            {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
          </button>
          
          <button className={`${styles.iconBtn} ${styles.cartBtn}`} aria-label="Carrito" onClick={() => setIsOpen(true)}>
            <ShoppingCart size={24} />
            {totalItems > 0 && <span className={styles.cartBadge}>{totalItems}</span>}
          </button>
          <Link href="/admin" aria-label="Admin Dashboard" className={styles.iconBtn}>
            <Menu size={24} />
          </Link>
        </div>
      </div>
    </nav>
  );
}
