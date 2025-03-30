import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Menu = ({ selectedCategory }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const filteredMenuItems = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {filteredMenuItems.map((item, index) => (
        <div 
          key={index}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          <div className="aspect-w-16 aspect-h-9">
            <img 
              src={item.imageUrl || 'https://via.placeholder.com/400x300'} 
              alt={item.name}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{item.name}</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
            <div className="mt-2 flex justify-between items-center">
              <span className="text-primary font-bold">${item.price}</span>
              <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Menu; 