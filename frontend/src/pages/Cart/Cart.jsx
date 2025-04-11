import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../utils/auth';
import { ChevronLeftIcon, TrashIcon } from '@heroicons/react/24/outline';
import Scroll from '../../hooks/useScroll';
import Swal from 'sweetalert2';

const Cart = () => {
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchCarts();
  }, [currentUser, navigate]);

  const fetchCarts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // API now returns an array of carts
      setCarts(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching carts:', err);
      setError('Failed to fetch carts. Please try again.');
      setLoading(false);
    }
  };

  const handleDeleteCart = async (restaurantId) => {
    try {
      const result = await Swal.fire({
        title: 'Delete Cart',
        text: 'Are you sure you want to delete this cart?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#000',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        const token = localStorage.getItem('token');
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/cart/clear/${restaurantId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Show success message
        await Swal.fire({
          icon: 'success',
          title: 'Cart Deleted',
          text: 'Your cart has been deleted successfully.',
          confirmButtonColor: '#000',
          timer: 1500,
          showConfirmButton: false
        });

        // Refresh carts
        fetchCarts();
      }
    } catch (error) {
      console.error('Error deleting cart:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete cart. Please try again.',
        confirmButtonColor: '#000'
      });
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
        <p>{error}</p>
        <button 
          onClick={fetchCarts}
          className="mt-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 mt-14 lg:mt-20">
      <Scroll />
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4">
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold">Carts</h1>
        </div>
        <button 
          onClick={() => navigate('/my-orders')}
          className="bg-gray-100 rounded-full px-4 py-2 text-sm font-medium"
        >
          Orders
        </button>
      </div>

      {/* Cart List */}
      {carts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No items in your cart</p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors"
          >
            Browse Restaurants
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {carts.map((cart) => (
            <div key={cart._id} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-4">
                  <img
                    src={cart.restaurantImage}
                    alt={cart.restaurantName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="text-lg font-semibold">{cart.restaurantName}</h2>
                    <p className="text-gray-600">
                      {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'} • LKR {cart.totalAmount.toFixed(2)}
                    </p>
                    <p className="text-gray-600">Deliver to {cart.deliveryLocation}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteCart(cart.restaurantId)}
                  className="p-2 hover:bg-red-50 rounded-full transition-colors text-red-500"
                >
                  <TrashIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-2 mt-4">
                <button 
                  onClick={() => navigate(`/cart/${cart.restaurantId}`)}
                  className="w-full bg-primary text-white py-3 rounded-lg font-medium"
                >
                  View cart
                </button>
                <button 
                  onClick={() => navigate(`/restaurant/${cart.restaurantId}`)}
                  className="w-full bg-gray-100 text-black py-3 rounded-lg font-medium"
                >
                  View store
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Cart;