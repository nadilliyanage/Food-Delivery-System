import React, { useState, useEffect } from "react";
import axios from "axios";
import { categories } from "../../../data/CategoryData";
import RestaurantCard from "../../../components/RestaurantCard/RestaurantCard";

const Categories = ({ searchQuery }) => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ensure searchQuery is always a string
  const searchQueryString = String(searchQuery?.term || "").toLowerCase();

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        setError(null);
        let url = `${import.meta.env.VITE_API_URL}/api/restaurants/`;
        if (selectedCategory !== "All") {
          url += `category/${selectedCategory}`;
        }
        const response = await axios.get(url);
        setRestaurants(response.data);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
        setError("Failed to fetch restaurants. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [selectedCategory]);

  const filteredRestaurants = restaurants.filter((restaurant) => {
    if (!searchQueryString) return true;

    const name = String(restaurant?.name || "").toLowerCase();
    const description = String(restaurant?.description || "").toLowerCase();
    const category = String(restaurant?.category || "").toLowerCase();

    return (
      name.includes(searchQueryString) ||
      description.includes(searchQueryString) ||
      category.includes(searchQueryString)
    );
  });

  return (
    <div className="pt-3 pb-6 px-4">
      <h2 className="text-2xl font-bold mb-4">Categories</h2>
      <div className="overflow-x-auto md:overflow-visible [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex md:grid md:grid-cols-8 gap-4">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center min-w-[80px] md:min-w-0 cursor-pointer group"
                onClick={() => setSelectedCategory(category.name)}
              >
                <div className="transition-transform duration-300 group-hover:scale-125">
                  {typeof Icon === "string" ? (
                    <img
                      src={Icon}
                      alt={category.name}
                      className="w-16 h-16 object-contain transition-colors duration-300"
                    />
                  ) : (
                    <Icon
                      className="w-16 h-16 transition-colors duration-300"
                      style={{ color: category.color }}
                    />
                  )}
                </div>
                <span
                  className={`text-sm font-medium transition-colors text-center ${
                    selectedCategory === category.name
                      ? "text-primary"
                      : "text-gray-700 dark:text-gray-300 group-hover:text-primary duration-300"
                  }`}
                >
                  {category.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">
          {selectedCategory === "All"
            ? "All Restaurants"
            : `${selectedCategory} Restaurants`}
        </h3>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-4">{error}</div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No restaurants found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant._id}
                restaurant={{
                  _id: restaurant._id,
                  name: restaurant.name,
                  imageUrl: restaurant.imageUrl,
                  rating: restaurant.rating,
                  description: restaurant.description,
                  address: restaurant.address,
                  deliveryTime: restaurant.deliveryTime,
                  minOrder: restaurant.minOrder,
                  deliveryFee: restaurant.deliveryFee,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
