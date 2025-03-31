import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('menu'); // 'menu' or 'restaurant'

  useEffect(() => {
    // Debounce the search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      onSearch(searchTerm, searchType);
    }, 300); // 300ms delay

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchType, onSearch]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mb-2 mt-4 md:mt-0 md:mb-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search ${searchType === 'menu' ? 'menu items' : 'restaurants'}...`}
            className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
          />
          <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
        >
          <option value="menu">Menu</option>
          <option value="restaurant">Restaurant</option>
        </select>
      </div>
    </div>
  );
};

export default SearchBar; 