"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [session, setSession] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        setSession(data.user || null);
      })
      .catch(() => setSession(null));
  }, [pathname]);
  
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

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setSession(null);
    setMobileMenuOpen(false);
    router.push('/login');
    router.refresh();
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

        <div className={styles.navActions} style={{ position: 'relative' }}>
          <button onClick={toggleTheme} className={styles.iconBtn} aria-label="Toggle Theme">
            {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
          </button>
          
          <button className={`${styles.iconBtn} ${styles.cartBtn}`} aria-label="Carrito" onClick={() => setIsOpen(true)}>
            <ShoppingCart size={24} />
            {totalItems > 0 && <span className={styles.cartBadge}>{totalItems}</span>}
          </button>
          
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={styles.iconBtn} aria-label="Menu">
             {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {mobileMenuOpen && (
            <div style={{ position: 'absolute', top: '100%', right: '0', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem', minWidth: '200px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', zIndex: 50, marginTop: '0.5rem' }}>
              {!session ? (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} style={{ display: 'block', padding: '12px 16px', color: 'var(--text-primary)', textDecoration: 'none', borderRadius: '6px', fontWeight: '500' }}>
                  Iniciar Sesión
                </Link>
              ) : (
                <>
                  <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-color)', marginBottom: '4px' }}>
                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem' }}>{session.name}</p>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{session.email}</p>
                  </div>
                  
                  <Link href="/cuenta" onClick={() => setMobileMenuOpen(false)} style={{ display: 'block', padding: '10px 16px', color: 'var(--text-primary)', textDecoration: 'none', borderRadius: '6px' }}>
                    Mi Cuenta
                  </Link>
                  {(session.role === 'ADMIN' || session.role === 'MASTER_ADMIN') && (
                    <>
                      <Link href="/admin/orders" onClick={() => setMobileMenuOpen(false)} style={{ display: 'block', padding: '10px 16px', color: 'var(--text-primary)', textDecoration: 'none', borderRadius: '6px' }}>
                        Control de Órdenes
                      </Link>
                      <Link href="/admin" onClick={() => setMobileMenuOpen(false)} style={{ display: 'block', padding: '10px 16px', color: 'var(--text-primary)', textDecoration: 'none', borderRadius: '6px' }}>
                        Configuración Sistema
                      </Link>
                      {session.role === 'MASTER_ADMIN' && (
                        <Link href="/admin/users" onClick={() => setMobileMenuOpen(false)} style={{ display: 'block', padding: '10px 16px', color: 'var(--text-primary)', textDecoration: 'none', borderRadius: '6px' }}>
                          Gestión de Usuarios
                        </Link>
                      )}
                    </>
                  )}
                  <button onClick={handleLogout} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px', color: 'var(--accent-red)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', marginTop: '4px', borderTop: '1px solid var(--border-color)' }}>
                    Cerrar Sesión
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
