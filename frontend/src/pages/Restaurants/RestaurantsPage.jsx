import React from "react";
import Restaurants from "../Home/Restaurants/Restaurants";
import SearchBar from "../../components/SearchBar/SearchBar";

const RestaurantsPage = () => {
  const [searchQuery, setSearchQuery] = React.useState({
    term: "",
    type: "restaurant",
  });

  const handleSearch = (term, type) => {
    setSearchQuery({ term, type });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold my-6 text-gray-800 dark:text-white">
        All Restaurants
      </h1>
      <SearchBar onSearch={handleSearch} />
      <Restaurants searchQuery={searchQuery} />
    </div>
  );
};

export default RestaurantsPage;
