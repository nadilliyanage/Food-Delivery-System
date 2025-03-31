import React, { useState } from 'react';
import { FaUtensils, FaHamburger, FaPizzaSlice, FaIceCream, FaCoffee, FaDrumstickBite, FaFish, FaCookie } from 'react-icons/fa';
import Menu from './Menu';

const categories = [
  { name: 'All', icon: FaUtensils, color: '#FF6B6B' },
  { name: 'Burgers', icon: FaHamburger, color: '#FFA07A' },
  { name: 'Pizza', icon: FaPizzaSlice, color: '#FF6347' },
  { name: 'Ice Cream', icon: FaIceCream, color: '#87CEEB' },
  { name: 'Coffee', icon: FaCoffee, color: '#8B4513' },
  { name: 'Chicken', icon: FaDrumstickBite, color: '#FFD700' },
  { name: 'Seafood', icon: FaFish, color: '#4169E1' },
  { name: 'Desserts', icon: FaCookie, color: '#DDA0DD' },
];

const Categories = ({ searchQuery }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  return (
    <div className="py-6 px-4">
      <h2 className="text-2xl font-bold mb-4">Categories</h2>
      <div className="overflow-x-auto md:overflow-visible [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex md:grid md:grid-cols-8 gap-4 my-4">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center min-w-[80px] md:min-w-0 cursor-pointer group"
                onClick={() => setSelectedCategory(category.name)}
              >
                <div 
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 transition-transform duration-300 group-hover:scale-110 ${
                    selectedCategory === category.name ? 'ring-2 ring-primary' : ''
                  }`}
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <Icon 
                    className="w-8 h-8 transition-colors duration-300" 
                    style={{ color: category.color }}
                  />
                </div>
                <span className={`text-sm font-medium transition-colors text-center ${
                  selectedCategory === category.name 
                    ? 'text-primary' 
                    : 'text-gray-700 dark:text-gray-300 group-hover:text-primary'
                }`}>
                  {category.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-8">
        <Menu selectedCategory={selectedCategory} searchQuery={searchQuery} />
      </div>
    </div>
  );
};

export default Categories; 