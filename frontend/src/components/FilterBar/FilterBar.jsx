import React from "react";
import { FaFilter } from "react-icons/fa";

const FilterBar = ({ onFilter }) => {
  const handleFilterChange = (e) => {
    onFilter(e.target.value);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2">
        <FaFilter className="text-gray-400" />
        <select
          onChange={handleFilterChange}
          className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
        >
          <option value="all">All Restaurants</option>
          <option value="rating">Highest Rated</option>
          <option value="delivery">Fastest Delivery</option>
          <option value="price">Lowest Price</option>
        </select>
      </div>
    </div>
  );
};

export default FilterBar;
