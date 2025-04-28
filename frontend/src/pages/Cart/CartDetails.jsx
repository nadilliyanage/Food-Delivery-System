import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import Scroll from "../../hooks/useScroll";

const CartDetails = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [note, setNote] = useState("");
  const [requestUtensils, setRequestUtensils] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [restaurantId]);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/cart`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const userCart = response.data.find(
        (c) => c.restaurantId === restaurantId
      );
      if (!userCart) {
        setError("Cart not found");
        setLoading(false);
        return;
      }

      setCart(userCart);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching cart:", err);
      setError("Failed to fetch cart details");
      setLoading(false);
    }
  };

  const updateQuantity = async (menuItemId, newQuantity) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/cart/update`,
        {
          menuItemId,
          quantity: newQuantity,
          restaurantId,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchCart();
    } catch (err) {
      console.error("Error updating quantity:", err);
    }
  };

  const removeItem = async (menuItemId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/cart/remove/${restaurantId}/${menuItemId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchCart();
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  const calculateItemTotal = (price, quantity) => {
    return price * quantity;
  };

  const calculateSubtotal = () => {
    return cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const calculateDeliveryFee = () => {
    // You can implement your delivery fee logic here
    return 150.0; // Example fixed delivery fee
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const deliveryFee = calculateDeliveryFee();
    return subtotal + deliveryFee;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>{error}</p>
        <button onClick={() => navigate("/cart")} className="mt-4 text-black">
          Return to Cart
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white mt-14 lg:mt-20 pb-32">
      <Scroll />
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 px-4 py-3 flex items-center justify-between border-b">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)}>
            <XMarkIcon className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold">{cart.restaurantName}</h1>
        </div>
        <button
          onClick={() => navigate(`/restaurant/${restaurantId}`)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <PlusIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Cart Items */}
      <div className="px-4 py-6 space-y-6">
        {cart.items.map((item) => (
          <div key={item.menuItemId} className="flex gap-4 relative">
            <button
              onClick={() => removeItem(item.menuItemId)}
              className="absolute top-0 right-0 p-2 text-red-500 hover:text-red-700"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-gray-600">LKR {item.price.toFixed(2)}</p>
              <div className="mt-2 flex items-center justify-between">
                <div className="inline-flex items-center bg-gray-100 rounded-full">
                  <button
                    onClick={() =>
                      updateQuantity(item.menuItemId, item.quantity - 1)
                    }
                    className="p-2"
                    disabled={item.quantity <= 1}
                  >
                    <MinusIcon className="h-5 w-5" />
                  </button>
                  <span className="px-4">{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateQuantity(item.menuItemId, item.quantity + 1)
                    }
                    className="p-2"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </button>
                </div>
                <p className="font-semibold mr-2">
                  LKR {calculateItemTotal(item.price, item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Options */}
      <div className="px-4 space-y-4 border-t py-4">
        <button
          onClick={() => navigate("/cart/note")}
          className="flex items-center justify-between w-full py-2"
        >
          <div className="flex items-center gap-3">
            <span className="p-2">📝</span>
            <span>Add note</span>
          </div>
          <span className="text-gray-400">›</span>
        </button>
      </div>

      {/* Price Summary */}
      <div className="px-4 py-4 bg-gray-50 space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span>LKR {calculateSubtotal().toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Delivery Fee</span>
          <span>LKR {calculateDeliveryFee().toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-semibold text-lg pt-2 border-t">
          <span>Total</span>
          <span>LKR {calculateTotal().toFixed(2)}</span>
        </div>
      </div>

      {/* Continue Button */}
      <div className="fixed bottom-14 left-0 right-0 p-4 bg-white border-t">
        <button
          onClick={() => navigate(`/checkout/${restaurantId}`)}
          className="w-full bg-primary text-white py-4 rounded-lg font-medium"
        >
          Checkout • LKR {calculateTotal().toFixed(2)}
        </button>
      </div>
    </div>
  );
};

export default CartDetails;
