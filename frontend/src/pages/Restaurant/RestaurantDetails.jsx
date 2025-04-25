import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaHeart,
  FaSearch,
  FaEllipsisH,
  FaUsers,
  FaPlus,
  FaTimes,
} from "react-icons/fa";
import axios from "axios";
import Scroll from "../../hooks/useScroll";
import { toast } from "react-toastify";

const RestaurantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Delivery");
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartItems, setCartItems] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        const config = token
          ? {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          : null;

        // Fetch restaurant details without auth
        const restaurantResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/restaurants/${id}`
        );
        setRestaurant(restaurantResponse.data);

        // Only fetch menu and cart if user is logged in
        if (token) {
          const [menuResponse, cartResponse] = await Promise.all([
            axios.get(
              `${import.meta.env.VITE_API_URL}/api/restaurants/${id}/menu`,
              config
            ),
            axios.get(`${import.meta.env.VITE_API_URL}/api/cart`, config),
          ]);

          setMenus(menuResponse.data);
          const restaurantCart = cartResponse.data.find(
            (cart) => cart.restaurantId === id
          );
          setCartItems(restaurantCart);
        } else {
          // If not logged in, just fetch menu without auth
          const menuResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/restaurants/${id}/menu`
          );
          setMenus(menuResponse.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load restaurant details and menus");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAddToCart = async (menuItem) => {
    try {
      setAddingToCart(true);
      const token = localStorage.getItem("token");

      if (!token) {
        toast.warning("Please login to add items to cart", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        navigate("/login");
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/cart/add`,
        {
          menuItemId: menuItem._id,
          quantity: 1,
          restaurantId: id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        // Update cart items after adding
        const cartResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/cart`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const updatedCart = cartResponse.data.find(
          (cart) => cart.restaurantId === id
        );
        setCartItems(updatedCart);

        toast.success("Item added to cart!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const filteredMenus = menus.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 mt-12 pb-24">
      <Scroll />
      {/* Header Image */}
      <div className="relative h-64 w-full">
        <img
          src={restaurant?.imageUrl}
          alt={restaurant?.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-3 rounded-full bg-white/90 hover:bg-white"
          >
            <FaArrowLeft className="text-gray-800" />
          </button>
          <div className="flex gap-2">
            <button className="p-3 rounded-full bg-white/90 hover:bg-white">
              <FaHeart className="text-gray-800" />
            </button>
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-3 rounded-full bg-white/90 hover:bg-white"
            >
              {isSearchOpen ? (
                <FaTimes className="text-gray-800" />
              ) : (
                <FaSearch className="text-gray-800" />
              )}
            </button>
            <button className="p-3 rounded-full bg-white/90 hover:bg-white">
              <FaEllipsisH className="text-gray-800" />
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {isSearchOpen && (
        <div className="px-4 py-2 bg-white border-b">
          <div className="relative">
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      )}

      {/* Restaurant Info */}
      <div className="px-4 py-6 bg-white">
        <h1 className="text-3xl font-bold mb-2">{restaurant?.name}</h1>
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <span>•</span>
          <span>{restaurant?.address?.city}</span>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 py-6 bg-white mt-2">
        <h2 className="text-2xl font-bold mb-4">Menu Items</h2>
        {filteredMenus.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            {searchTerm
              ? "No menu items found matching your search"
              : "No menu items available"}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredMenus.map((item) => (
              <div
                key={item._id}
                className="flex gap-4 p-4 bg-white rounded-lg border hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">LKR {item.price.toFixed(2)}</p>
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={addingToCart}
                      className="p-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors duration-200"
                    >
                      <FaPlus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {item.imageUrl && (
                  <div className="w-24 h-24 relative">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Cart Button */}
      {cartItems && cartItems.items.length > 0 && (
        <div className="fixed bottom-14 left-0 right-0 p-4 bg-white border-t">
          <button
            onClick={() => navigate(`/cart/${id}`)}
            className="w-full bg-primary text-white py-4 rounded-lg font-medium flex items-center justify-between px-6"
          >
            <div className="flex items-center gap-2">
              <span>
                {cartItems.items.length}{" "}
                {cartItems.items.length === 1 ? "item" : "items"}
              </span>
              <span>•</span>
              <span>LKR {cartItems.totalAmount.toFixed(2)}</span>
            </div>
            <span>View Cart</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetails;
