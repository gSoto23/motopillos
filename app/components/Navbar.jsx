"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, Menu, Sun, Moon, X, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import { searchVehicles } from '@/app/actions/catalogActions';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { totalItems, setIsOpen } = useCart();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const searchRef = useRef(null);

  // Debounced search effect
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const data = await searchVehicles(query);
      setResults(data);
      setIsSearching(false);
      setShowDropdown(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close map
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = () => {
    setShowDropdown(false);
    setQuery('');
  };

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
        
        <div className={styles.searchBar} ref={searchRef}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Buscar modelos ej: Honda CRF250F" 
            className={styles.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
          />
          {isSearching && <Loader2 size={18} className={`${styles.searchIcon} animate-spin`} style={{ left: 'auto', right: '1rem', color: 'var(--accent-red)' }} />}
          
          {showDropdown && (
            <div className={styles.searchResults}>
              {results.length === 0 && !isSearching ? (
                <div className={styles.noResults}>No se encontraron motos para "{query}"</div>
              ) : (
                results.map(v => (
                  <Link 
                    key={v.id} 
                    href={`/catalog/vehicle/${v.id}`}
                    className={styles.searchResultItem}
                    onClick={handleResultClick}
                  >
                    <span className={styles.itemBrand}>{v.brand} {v.year}</span>
                    <span className={styles.itemTitle}>{v.model}</span>
                  </Link>
                ))
              )}
            </div>
          )}
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
