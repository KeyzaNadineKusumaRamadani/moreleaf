import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../services';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart({ items: [], total: 0 });
      return;
    }
    try {
      setLoading(true);
      const res = await cartService.get();
      setCart(res.data.data);
    } catch (error) {
      console.error('Fetch cart error:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (product_id, quantity = 1) => {
    if (!user) {
      toast.info('Silakan login untuk menambahkan ke keranjang.');
      return false;
    }
    try {
      await cartService.add({ product_id, quantity });
      await fetchCart();
      toast.success('Produk ditambahkan ke keranjang!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menambahkan ke keranjang.');
      return false;
    }
  };

  const updateQuantity = async (id, quantity) => {
    try {
      await cartService.update(id, quantity);
      await fetchCart();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui keranjang.');
    }
  };

  const removeItem = async (id) => {
    try {
      await cartService.remove(id);
      await fetchCart();
      toast.success('Produk dihapus dari keranjang.');
    } catch (error) {
      toast.error('Gagal menghapus produk.');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, loading, addToCart, updateQuantity, removeItem, refreshCart: fetchCart, itemCount: cart.items?.length || 0 }}
    >
      {children}
    </CartContext.Provider>
  );
};
