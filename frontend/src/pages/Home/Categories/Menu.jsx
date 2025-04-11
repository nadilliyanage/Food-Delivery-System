import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getCurrentUser } from '../../../utils/auth';
import { useNavigate } from 'react-router-dom';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Menu = ({ selectedCategory, searchQuery = { term: '', type: 'menu' } }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/menu/');
        setMenuItems(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch menu items');
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  const handleAddToCart = async (item) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      await axios.post(
        'http://localhost:3000/api/cart/add',
        { menuItemId: item._id, quantity: 1 },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success('Item added to cart successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      toast.error('Failed to add item to cart', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = searchQuery?.type === 'menu' && searchQuery?.term
      ? item.name.toLowerCase().includes(searchQuery.term.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.term.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
    <div>
      <ToastContainer />
      <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex gap-6 pb-4">
          {filteredMenuItems.map((item, index) => (
            <div 
              key={item.id || index}
              className="flex-none w-[300px] bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative w-full h-[200px]">
                <img 
                  src={item.imageUrl || 'https://via.placeholder.com/400x300'} 
                  alt={item.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{item.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-primary font-bold">${item.price}</span>
                  <button 
                    onClick={() => handleAddToCart(item)}
                    className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors flex items-center gap-2"
                  >
                    <ShoppingCartIcon className="h-5 w-5" />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Menu; 