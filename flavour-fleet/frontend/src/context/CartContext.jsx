import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import api from '../api/client.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get('/cart');
      setItems(data.items);
    } catch {
      // non-fatal — cart just stays as-is
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Returns { ok: true } on success, or { ok: false, code, message } if the
  // cart has items from a different restaurant — caller can ask the user to
  // confirm, then retry with replace: true.
  const addToCart = useCallback(
    async (menuItemId, quantity = 1, replace = false) => {
      try {
        await api.post('/cart', { menuItemId, quantity, replace });
        await refreshCart();
        return { ok: true };
      } catch (err) {
        if (err.response?.status === 409) {
          return { ok: false, code: err.response.data.code, message: err.response.data.message };
        }
        return { ok: false, message: err.response?.data?.message || 'Could not add to cart.' };
      }
    },
    [refreshCart]
  );

  const updateQuantity = useCallback(
    async (menuItemId, quantity) => {
      await api.put(`/cart/${menuItemId}`, { quantity });
      await refreshCart();
    },
    [refreshCart]
  );

  const removeItem = useCallback(
    async (menuItemId) => {
      await api.delete(`/cart/${menuItemId}`);
      await refreshCart();
    },
    [refreshCart]
  );

  const clearCart = useCallback(async () => {
    await api.delete('/cart');
    setItems([]);
  }, []);

  const total = useMemo(() => items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0), [items]);
  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const restaurantId = items[0]?.restaurant_id || null;
  const restaurantName = items[0]?.restaurant_name || null;

  return (
    <CartContext.Provider
      value={{
        items, loading, total, itemCount, restaurantId, restaurantName,
        addToCart, updateQuantity, removeItem, clearCart, refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
