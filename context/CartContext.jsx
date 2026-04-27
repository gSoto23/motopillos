"use client";
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('motopillos-cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch(e) {}
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('motopillos-cart', JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addToCart = (part, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find(i => i.partNo === part.partNo);
      if (existing) {
        return prev.map(i => i.partNo === part.partNo ? { ...i, qty: i.qty + qty } : i);
      }
      return [...prev, { ...part, qty }];
    });
    setIsOpen(true);
  };

  const removeFromCart = (partNo) => {
    setItems((prev) => prev.filter(i => i.partNo !== partNo));
  };

  const updateQty = (partNo, qty) => {
    if (qty < 1) return;
    setItems((prev) => prev.map(i => i.partNo === partNo ? { ...i, qty } : i));
  };

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const subtotalCRC = items.reduce((acc, item) => acc + ((item.priceCRC || 0) * item.qty), 0);
  const totalItems = items.reduce((acc, item) => acc + item.qty, 0);

  return (
    <CartContext.Provider value={{ items, isOpen, setIsOpen, addToCart, removeFromCart, updateQty, subtotal, subtotalCRC, totalItems, isLoaded }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
