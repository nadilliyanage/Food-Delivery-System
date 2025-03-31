import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../utils/auth';
import Scroll from '../../hooks/useScroll';
import { TrashIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';

const Cart = () => {
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [currentUser, navigate]);

  const fetchCart = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/cart', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCart(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch cart');
      setLoading(false);
    }
  };

  const updateQuantity = async (menuItemId, newQuantity) => {
    try {
      const response = await axios.put(
        'http://localhost:3000/api/cart/update',
        { menuItemId, quantity: newQuantity },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setCart(response.data);
    } catch (err) {
      setError('Failed to update quantity');
    }
  };

  const removeItem = async (menuItemId) => {
    try {
      const response = await axios.delete(
        `http://localhost:3000/api/cart/remove/${menuItemId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setCart(response.data);
    } catch (err) {
      setError('Failed to remove item');
    }
  };

  const clearCart = async () => {
    const result = await Swal.fire({
      title: 'Clear Cart?',
      text: "Are you sure you want to remove all items from your cart?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, clear cart',
      cancelButtonText: 'Cancel',
      background: '#ffffff',
      color: '#1f2937',
      customClass: {
        confirmButton: 'bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md',
        cancelButton: 'bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md'
      }
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.delete(
          'http://localhost:3000/api/cart/clear',
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setCart(response.data);
        Swal.fire({
          title: 'Cleared!',
          text: 'Your cart has been cleared.',
          icon: 'success',
          confirmButtonColor: '#ef4444',
          background: '#ffffff',
          color: '#1f2937',
          customClass: {
            confirmButton: 'bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md'
          }
        });
      } catch (err) {
        setError('Failed to clear cart');
        Swal.fire({
          title: 'Error!',
          text: 'Failed to clear your cart. Please try again.',
          icon: 'error',
          confirmButtonColor: '#ef4444',
          background: '#ffffff',
          color: '#1f2937',
          customClass: {
            confirmButton: 'bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md'
          }
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-14">
      <Scroll />
      <h1 className="text-3xl font-bold mb-8 text-center">Shopping Cart</h1>
      
      {cart.items.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.menuItemId}
                className="flex h-32 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
              >
                <div className="w-24 md:w-40 flex-shrink-0">
                  <img
                    src={item.imageUrl || 'https://via.placeholder.com/100'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 flex-grow min-w-0">
                  <h3 className="text-lg font-semibold truncate">{item.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">${item.price}</p>
                  <div className="flex items-center mt-2">
                    <button
                      onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                      className="px-2 py-1 bg-gray-200 rounded-l hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="px-4 py-1 bg-gray-100">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                      className="px-2 py-1 bg-gray-200 rounded-r hover:bg-gray-300"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.menuItemId)}
                      className="ml-4 text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <TrashIcon className="h-5 w-5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
                <div className="p-4 text-right whitespace-nowrap">
                  <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Total</h2>
              <p className="text-2xl font-bold">${cart.totalAmount.toFixed(2)}</p>
            </div>
            <div className="flex justify-between">
              <button
                onClick={clearCart}
                className="px-4 py-2 text-red-500 hover:text-red-700 flex items-center gap-2 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
              >
                <TrashIcon className="h-5 w-5" />
                <span>Clear Cart</span>
              </button>
              <button
                onClick={() => navigate('/checkout')}
                className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart; 