import React, { useState } from "react";
import Restaurants from "../../Home/Restaurants/Restaurants";
import SearchBar from "../../../components/SearchBar/SearchBar";
import { getCurrentUser } from "../../../utils/auth";

const DashboardRestaurants = () => {
  const currentUser = getCurrentUser();
  const userRole = currentUser?.role;
  const [searchQuery, setSearchQuery] = useState({ term: "", type: "menu" });

  const handleSearch = (term, type) => {
    setSearchQuery({ term, type });
  };

  const shouldShowSearch = !userRole || userRole === "customer";

  return (
    <div className="container mx-auto py-2">
      <h2 className="text-3xl font-bold mb-6">All Restaurants</h2>
      {shouldShowSearch && <SearchBar onSearch={handleSearch} />}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <Restaurants searchQuery={searchQuery} />
      </div>
    </div>
  );
};

export default DashboardRestaurants;
