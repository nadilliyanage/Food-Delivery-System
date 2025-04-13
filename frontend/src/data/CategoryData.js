import { FaUtensils, FaHamburger, FaPizzaSlice, FaCoffee, FaDrumstickBite, FaFish, FaCookie } from 'react-icons/fa';
import allIcon from '../assets/category-icons/all-food.png';
// import allIcon from '../assets/category-icons/all.png';
import iceCreamIcon from '../assets/category-icons/ice-cream.png';
import burgerIcon from '../assets/category-icons/burger.png';
import pizzaIcon from '../assets/category-icons/pizza.png';
import coffeeIcon from '../assets/category-icons/coffee.png';
import chickenIcon from '../assets/category-icons/chicken.png';
import seaFoodIcon from '../assets/category-icons/sea-food.png';
import dessertIcon from '../assets/category-icons/dessert.png';

export const categories = [
  { name: 'All', icon: allIcon, color: '#FF6B6B' },
  { name: 'Burgers', icon: burgerIcon, color: '#FFA07A' },
  { name: 'Pizza', icon: pizzaIcon, color: '#FF6347' },
  { name: 'Ice Cream', icon: iceCreamIcon, color: '#87CEEB' },
  { name: 'Coffee', icon: coffeeIcon, color: '#8B4513' },
  { name: 'Chicken', icon: chickenIcon, color: '#FFD700' },
  { name: 'Seafood', icon: seaFoodIcon, color: '#4169E1' },
  { name: 'Desserts', icon: dessertIcon, color: '#DDA0DD' },
];

export const categoryOptions = categories
  .filter(category => category.name !== 'All')
  .map(category => ({
    value: category.name,
    label: category.name
  })); 