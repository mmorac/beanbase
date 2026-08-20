import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export interface CartItem {
  id: string;
  roasterSlug: string;
  roasterName: string;
  productName: string;
  price: number;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  itemCount: number;
  quantityFor: (id: string) => number;
}

const STORAGE_KEY = 'beanbase-cart';

const CartContext = createContext<CartContextValue | undefined>(undefined);

const loadCart = (): CartItem[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => loadCart());

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const addItem = (item: Omit<CartItem, 'quantity'>) => {
      setItems(current => {
        const existing = current.find(entry => entry.id === item.id);
        if (existing) {
          return current.map(entry =>
            entry.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry
          );
        }

        return [...current, { ...item, quantity: 1 }];
      });
    };

    return {
      items,
      addItem,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      quantityFor: (id: string) => items.find(item => item.id === id)?.quantity || 0,
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
};
