import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  XMarkIcon,
  MapPinIcon,
  CreditCardIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import Swal from "sweetalert2";
import Scroll from "../../hooks/useScroll";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import StripePaymentForm from "./StripePaymentForm";

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(
  "pk_test_51RGXpNPsJKAfjT1phdn4uzwTtwytI7Pi6VYXhiPRe7e5FoweB1fJsj2vtwstkHqtoFvRhP3eKKt6sS3ZjT9ldIsF00GCMBjXMY"
);

// LocationMarker component
function LocationMarker({ position, setPosition, setDeliveryAddress }) {
  const map = useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);

      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );

        const address = response.data.address;
        const street = address.road || address.street || "";
        const city = address.city || address.town || "";
        
        setDeliveryAddress((prev) => ({
          ...prev,
          street,
          city,
          latitude: lat,
          longitude: lng,
        }));

        map.flyTo([lat, lng], map.getZoom());
      } catch (error) {
        console.error("Error getting location details:", error);
        // Set position but leave address fields empty
        setDeliveryAddress((prev) => ({
          ...prev,
          street: "",
          city: "",
          latitude: lat,
          longitude: lng,
        }));
      }
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  return position ? <Marker position={position} /> : null;
}

// Main Checkout Component
const Checkout = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card");
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: "",
    city: "",
    instructions: "",
    latitude: null,
    longitude: null,
  });
  const [locationLoading, setLocationLoading] = useState(false);
  const [position, setPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState([6.927079, 79.861244]);
  const [mapZoom, setMapZoom] = useState(13);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  useEffect(() => {
    fetchCartDetails();
  }, [restaurantId]);

  const fetchCartDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/cart`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const selectedCart = response.data.find(
        (c) => c.restaurantId === restaurantId
      );
      if (!selectedCart) {
        throw new Error("Cart not found");
      }

      const orderId = response.data[0]._id;
      setOrderId(orderId);

      setCart(selectedCart);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching cart:", error);

      if (error.response) {
        // The request was made and the server responded with a status code
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
      } else {
        // Something happened in setting up the request
        console.error("Request setup error:", error.message);
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to fetch cart details",
        confirmButtonColor: "#000",
      }).then(() => {
        navigate("/cart");
      });
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setDeliveryAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            setPosition([latitude, longitude]);
            setMapZoom(16);

            const response = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );

            const address = response.data.address;
            setDeliveryAddress((prev) => ({
              ...prev,
              street: address.road || address.street || "",
              city: address.city || address.town || "",
              latitude,
              longitude,
            }));
          } catch (error) {
            console.error("Error getting location details:", error);
            Swal.fire({
              icon: "error",
              title: "Location Error",
              text: "Failed to get your location details. Please enter manually.",
              confirmButtonColor: "#000",
            });
          } finally {
            setLocationLoading(false);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationLoading(false);
          Swal.fire({
            icon: "error",
            title: "Location Access Denied",
            text: "Please enable location access or enter your address manually.",
            confirmButtonColor: "#000",
          });
        }
      );
    } else {
      setLocationLoading(false);
      Swal.fire({
        icon: "error",
        title: "Location Not Supported",
        text: "Your browser does not support geolocation.",
        confirmButtonColor: "#000",
      });
    }
  };

  const placeOrder = async () => {
    try {
      setLoading(true);

      // Validate delivery address
      if (!deliveryAddress.street || !deliveryAddress.city || !position) {
        throw new Error("Please complete your delivery address");
      }

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Create order data
      const orderData = {
        restaurant: restaurantId,
        items: cart.items.map((item) => ({
          menuItem: item.menuItemId,
          quantity: item.quantity,
        })),
        totalPrice: cart.totalAmount,
        deliveryAddress: {
          street: deliveryAddress.street,
          city: deliveryAddress.city,
          instructions: deliveryAddress.instructions,
          latitude: position[0],
          longitude: position[1],
        },
        paymentMethod: selectedPaymentMethod,
      };

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // For cash on delivery, just complete the order
      if (selectedPaymentMethod === "cash") {
        // Create the order
        const orderResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/orders`,
          orderData,
          { headers }
        );

        const orderId = orderResponse.data._id;
        setOrderId(orderId);

        // Clear cart
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/cart/clear/${restaurantId}`,
          { headers }
        );

        await Swal.fire({
          icon: "success",
          title: "Order Placed Successfully!",
          text: "Your order has been confirmed and is being processed.",
          confirmButtonColor: "#000",
        });

        navigate("/my-orders");
        return;
      }

      // For card payments, return the order ID to be used in StripePaymentForm
      // For card payments - return orderId to be handled by StripePaymentForm
      if (selectedPaymentMethod === "card") {
        const orderResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/orders`,
          orderData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        return orderResponse.data._id;
      }
    } catch (error) {
      console.error("Order placement error:", error);
      Swal.fire({
        icon: "error",
        title: "Order Failed",
        text: error.message || "Something went wrong. Please try again.",
        confirmButtonColor: "#000",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      setPaymentCompleted(true);
      setLoading(true);
      
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      
      // Validate delivery address
      if (!position) {
        console.error("Incomplete delivery address");
        setTimeout(() => {
          navigate("/my-orders");
        }, 2000);
        return;
      }

      // Create order data
      const orderData = {
        restaurant: restaurantId,
        items: cart.items.map((item) => ({
          menuItem: item.menuItemId,
          quantity: item.quantity,
        })),
        totalPrice: cart.totalAmount,
        deliveryAddress: {
          street: deliveryAddress.street,
          city: deliveryAddress.city,
          instructions: deliveryAddress.instructions || "",
          latitude: position[0],
          longitude: position[1],
        },
        paymentMethod: "card",
        // Mock card details (since real card details are handled by Stripe)
        cardDetails: {
          number: "xxxx-xxxx-xxxx-xxxx",
          expiry: "xx/xx",
          cvc: "xxx",
          name: "Card Payment"
        }
      };

      // Create the order
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/orders`,
        orderData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          } 
        }
      );
      
      // Clear cart after successful payment and order creation
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/cart/clear/${restaurantId}`,
        { 
          headers: { 
            Authorization: `Bearer ${token}` 
          } 
        }
      );

      setTimeout(() => {
        navigate("/my-orders");
      }, 2000);
    } catch (error) {
      console.error("Error creating order after payment success:", error);
      // Show error message but continue to redirect
      Swal.fire({
        icon: "warning",
        title: "Payment Successful",
        text: "Your payment was processed but there was an issue creating your order. Our team has been notified.",
        confirmButtonColor: "#000",
      });
      setTimeout(() => {
        navigate("/my-orders");
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !cart) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (paymentCompleted) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <h2 className="mt-2 text-lg font-medium text-gray-900">
            Payment Successful!
          </h2>
          <p className="mt-1 text-gray-500">
            Your order is being processed. Redirecting to order details...
          </p>
        </div>
      </div>
    );
  }

  if (!cart) {
    return (
      <div className="text-center py-8">
        <p>No items in cart</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 text-primary hover:underline"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-14 lg:pt-20">
      <Scroll />
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 px-4 py-3 flex items-center justify-between border-b">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)}>
            <XMarkIcon className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold">Checkout</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Delivery Address */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MapPinIcon className="h-5 w-5" />
              Delivery Address
            </h2>
            <button
              onClick={getCurrentLocation}
              disabled={locationLoading}
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-dark transition-colors"
            >
              {locationLoading ? "Getting Location..." : "Use Current Location"}
            </button>
          </div>

          {/* Map */}
          <div className="w-full h-[300px] mb-4 rounded-lg overflow-hidden">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <LocationMarker
                position={position}
                setPosition={setPosition}
                setDeliveryAddress={setDeliveryAddress}
              />
            </MapContainer>
          </div>

          <p className="text-sm text-gray-500 mb-4">
            Click on the map to set delivery location or use current location
            button.
          </p>

          <div className="space-y-4">
            {deliveryAddress.street && (
              <input
                type="text"
                name="street"
                placeholder="Street Address"
                value={deliveryAddress.street}
                onChange={handleAddressChange}
                className="w-full p-2 border rounded-lg"
                required
              />
            )}
            {deliveryAddress.city && (
              <input
                type="text"
                name="city"
                placeholder="City"
                value={deliveryAddress.city}
                onChange={handleAddressChange}
                className="w-full p-2 border rounded-lg"
                required
              />
            )}
            <textarea
              name="instructions"
              placeholder="Delivery Instructions (Optional)"
              value={deliveryAddress.instructions}
              onChange={handleAddressChange}
              className="w-full p-2 border rounded-lg"
              rows="2"
            />
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setSelectedPaymentMethod("card")}
              className={`w-full p-3 rounded-lg border flex items-center gap-3 ${
                selectedPaymentMethod === "card"
                  ? "border-black bg-gray-50"
                  : ""
              }`}
            >
              <CreditCardIcon className="h-6 w-6" />
              <span>Credit/Debit Card</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedPaymentMethod("cash")}
              className={`w-full p-3 rounded-lg border flex items-center gap-3 ${
                selectedPaymentMethod === "cash"
                  ? "border-black bg-gray-50"
                  : ""
              }`}
            >
              <BanknotesIcon className="h-6 w-6" />
              <span>Cash on Delivery</span>
            </button>
          </div>

          {selectedPaymentMethod === "card" ? (
            <Elements stripe={stripePromise}>
              <StripePaymentForm
                orderId={orderId}
                totalAmount={cart.totalAmount + 150}
                restaurantId={restaurantId}
                onPaymentSuccess={handlePaymentSuccess}
                loading={loading}
                setLoading={setLoading}
              />
            </Elements>
          ) : (
            <button
              onClick={placeOrder}
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-lg font-medium disabled:bg-gray-400 mt-4"
            >
              {loading ? "Processing..." : "Place Order"}
            </button>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>LKR {cart.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Fee</span>
              <span>LKR 150.00</span>
            </div>
            <div className="flex justify-between font-semibold text-lg pt-2 border-t">
              <span>Total</span>
              <span>LKR {(cart.totalAmount + 150).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
