import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { getCurrentUser, isAuthenticated } from '../../utils/auth';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const currentUser = getCurrentUser();

  const fetchCartData = async () => {
    if (currentUser?.role === "customer") {
    if (isAuthenticated()) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/cart`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        const totalItems = response.data.reduce((total, cart) => 
          total + cart.items.length, 0
        );
        setCartCount(totalItems);
        setCartItems(response.data);
      } catch (error) {
        console.error('Error fetching cart data:', error);
      }
    }
    }
  };

  const updateCartCount = (newCount) => {
    setCartCount(newCount);
  };

  const updateCartItems = (newItems) => {
    setCartItems(newItems);
  };

  // Initial fetch
  useEffect(() => {
    fetchCartData();
  }, []);

  return (
    <CartContext.Provider value={{ 
      cartCount, 
      cartItems, 
      fetchCartData,
      updateCartCount,
      updateCartItems
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 