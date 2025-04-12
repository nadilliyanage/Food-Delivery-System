import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { XMarkIcon, MapPinIcon, CreditCardIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import Swal from 'sweetalert2';
import Scroll from '../../hooks/useScroll';

const Checkout = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    instructions: '',
    latitude: null,
    longitude: null
  });
  const [locationLoading, setLocationLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  useEffect(() => {
    fetchCartDetails();
  }, [restaurantId]);

  const fetchCartDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const selectedCart = response.data.find(c => c.restaurantId === restaurantId);
      if (!selectedCart) {
        throw new Error('Cart not found');
      }
      
      setCart(selectedCart);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cart:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to fetch cart details',
        confirmButtonColor: '#000'
      }).then(() => {
        navigate('/cart');
      });
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setDeliveryAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Use reverse geocoding to get address details
            const response = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            
            const address = response.data.address;
            setDeliveryAddress({
              street: address.road || address.street || '',
              city: address.city || address.town || '',
              instructions: '',
              latitude,
              longitude
            });
          } catch (error) {
            console.error('Error getting location details:', error);
            Swal.fire({
              icon: 'error',
              title: 'Location Error',
              text: 'Failed to get your location details. Please enter manually.',
              confirmButtonColor: '#000'
            });
          } finally {
            setLocationLoading(false);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationLoading(false);
          Swal.fire({
            icon: 'error',
            title: 'Location Access Denied',
            text: 'Please enable location access or enter your address manually.',
            confirmButtonColor: '#000'
          });
        }
      );
    } else {
      setLocationLoading(false);
      Swal.fire({
        icon: 'error',
        title: 'Location Not Supported',
        text: 'Your browser does not support geolocation.',
        confirmButtonColor: '#000'
      });
    }
  };

  const handleCardDetailsChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      
      // Validate inputs
      if (selectedPaymentMethod === 'card') {
        if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvc || !cardDetails.name) {
          throw new Error('Please fill in all card details');
        }
      }

      // Create order with the correct format expected by backend
      const orderData = {
        restaurant: restaurantId,
        items: cart.items.map(item => ({
          menuItem: item.menuItemId,
          quantity: item.quantity
        })),
        totalPrice: cart.totalAmount,
        deliveryAddress: {
          street: deliveryAddress.street,
          city: deliveryAddress.city,
          instructions: deliveryAddress.instructions,
          latitude: deliveryAddress.latitude,
          longitude: deliveryAddress.longitude
        },
        paymentMethod: selectedPaymentMethod,
        ...(selectedPaymentMethod === 'card' && { cardDetails })
      };

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/orders`,
        orderData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data) {
        // Clear the cart after successful order placement
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/cart/clear/${restaurantId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        // Show success message
        await Swal.fire({
          icon: 'success',
          title: 'Order Placed Successfully!',
          text: 'Your order has been confirmed and is being processed.',
          confirmButtonColor: '#000'
        });
        
        // Navigate to orders page
        navigate('/my-orders');
      }
    } catch (error) {
      console.error('Payment error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Payment Failed',
        text: error.message || 'Something went wrong. Please try again.',
        confirmButtonColor: '#000'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!cart) {
    return (
      <div className="text-center py-8">
        <p>No items in cart</p>
        <button
          onClick={() => navigate('/')}
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
              {locationLoading ? 'Getting Location...' : 'Use Current Location'}
            </button>
          </div>
          <div className="space-y-4">
            <input
              type="text"
              name="street"
              placeholder="Street Address"
              value={deliveryAddress.street}
              onChange={handleAddressChange}
              className="w-full p-2 border rounded-lg"
            />
            <input
              type="text"
              name="city"
              placeholder="City"
              value={deliveryAddress.city}
              onChange={handleAddressChange}
              className="w-full p-2 border rounded-lg"
            />
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
              onClick={() => setSelectedPaymentMethod('card')}
              className={`w-full p-3 rounded-lg border flex items-center gap-3 ${
                selectedPaymentMethod === 'card' ? 'border-black bg-gray-50' : ''
              }`}
            >
              <CreditCardIcon className="h-6 w-6" />
              <span>Credit/Debit Card</span>
            </button>
            <button
              onClick={() => setSelectedPaymentMethod('cash')}
              className={`w-full p-3 rounded-lg border flex items-center gap-3 ${
                selectedPaymentMethod === 'cash' ? 'border-black bg-gray-50' : ''
              }`}
            >
              <BanknotesIcon className="h-6 w-6" />
              <span>Cash on Delivery</span>
            </button>
          </div>

          {/* Card Details */}
          {selectedPaymentMethod === 'card' && (
            <div className="mt-4 space-y-4">
              <input
                type="text"
                name="number"
                placeholder="Card Number"
                value={cardDetails.number}
                onChange={handleCardDetailsChange}
                className="w-full p-2 border rounded-lg"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="expiry"
                  placeholder="MM/YY"
                  value={cardDetails.expiry}
                  onChange={handleCardDetailsChange}
                  className="p-2 border rounded-lg"
                />
                <input
                  type="text"
                  name="cvc"
                  placeholder="CVC"
                  value={cardDetails.cvc}
                  onChange={handleCardDetailsChange}
                  className="p-2 border rounded-lg"
                />
              </div>
              <input
                type="text"
                name="name"
                placeholder="Name on Card"
                value={cardDetails.name}
                onChange={handleCardDetailsChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>
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

        {/* Place Order Button */}
        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-primary text-white py-4 rounded-lg font-medium disabled:bg-gray-400"
        >
          {loading ? 'Processing...' : `Pay LKR ${(cart.totalAmount + 150).toFixed(2)}`}
        </button>
      </div>
    </div>
  );
};

export default Checkout; 