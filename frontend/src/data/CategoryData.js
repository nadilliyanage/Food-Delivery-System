import { FaUtensils, FaHamburger, FaPizzaSlice, FaIceCream, FaCoffee, FaDrumstickBite, FaFish, FaCookie } from 'react-icons/fa';

export const categories = [
  { name: 'All', icon: FaUtensils, color: '#FF6B6B' },
  { name: 'Burgers', icon: FaHamburger, color: '#FFA07A' },
  { name: 'Pizza', icon: FaPizzaSlice, color: '#FF6347' },
  { name: 'Ice Cream', icon: FaIceCream, color: '#87CEEB' },
  { name: 'Coffee', icon: FaCoffee, color: '#8B4513' },
  { name: 'Chicken', icon: FaDrumstickBite, color: '#FFD700' },
  { name: 'Seafood', icon: FaFish, color: '#4169E1' },
  { name: 'Desserts', icon: FaCookie, color: '#DDA0DD' },
];

export const categoryOptions = categories
  .filter(category => category.name !== 'All')
  .map(category => ({
    value: category.name,
    label: category.name
  })); 