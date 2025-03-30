import React from "react";
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../../utils/auth';

const JoinWithUs = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleRestaurantClick = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate('/restaurant-registration');
    }
  };

  const handleDeliveryClick = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate('/delivery-registration');
    }
  };

  return (
    <div className="text-center py-12 space-y-4">
      {/* Show restaurant button for non-delivery personnel and non-restaurant admins */}
      {user?.role !== 'delivery_personnel' && user?.role !== 'restaurant_admin' && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">For Restaurant Owners</h3>
          <button
            onClick={handleRestaurantClick}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 mx-2"
          >
            {user ? 'Register Your Restaurant' : 'Login to Register Restaurant'}
          </button>
        </div>
      )}
      {/* Show delivery button for non-delivery personnel and non-restaurant admins */}
      {user?.role !== 'delivery_personnel' && user?.role !== 'restaurant_admin' && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">For Delivery Personnel</h3>
          <button
            onClick={handleDeliveryClick}
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 mx-2"
          >
            {user ? 'Join as Delivery Partner' : 'Login to Join as Delivery Partner'}
          </button>
        </div>
      )}
      {/* Show only restaurant button for restaurant admins */}
      {user?.role === 'restaurant_admin' && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">For Restaurant Owners</h3>
          <button
            onClick={handleRestaurantClick}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 mx-2"
          >
            Register Your Restaurant
          </button>
        </div>
      )}
    </div>
  );
};

const JoinWithUsSection = () => {
  const user = getCurrentUser();
  
  // Don't show the section at all for delivery personnel
  if (user?.role === 'delivery_personnel') {
    return null;
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Want to Join Our Platform?
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Register your restaurant or join as a delivery partner to start earning today!
          </p>
        </div>
        <JoinWithUs />
      </div>
    </div>
  );
};

export default JoinWithUsSection;
