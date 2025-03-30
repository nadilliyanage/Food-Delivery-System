import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../../utils/auth';
import axios from 'axios';
import Swal from 'sweetalert2';
import Scroll from '../../../hooks/useScroll';

const ManageRestaurants = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const user = getCurrentUser();
        if (!user) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/restaurants/user/restaurants`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        setRestaurants(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching restaurants');
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getDefaultImage = () => {
    return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="restaurant-management-container p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Restaurants</h2>
        <button
          onClick={() => navigate('/restaurant-registration')}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
        >
          Register New Restaurant
        </button>
      </div>
      
      {restaurants.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600 mb-4">You haven't registered any restaurants yet.</p>
          <button
            onClick={() => navigate('/restaurant-registration')}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
          >
            Register Your First Restaurant
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((restaurant) => (
            <div 
              key={restaurant._id} 
              className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/dashboard/restaurant/${restaurant._id}`)}
            >
              <div className="relative h-48 mb-4">
                <img
                  src={restaurant.imageUrl || getDefaultImage()}
                  alt={restaurant.name}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    e.target.onerror = null; // Prevent infinite loop
                    e.target.src = getDefaultImage();
                  }}
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">{restaurant.name}</h3>
              <p className="text-gray-600 mb-2">{restaurant.cuisine}</p>
              <div className="flex items-center justify-between">
                <span className={`font-medium ${getStatusColor(restaurant.registrationStatus)}`}>
                  {restaurant.registrationStatus.charAt(0).toUpperCase() + restaurant.registrationStatus.slice(1)}
                </span>
                <span className="text-sm text-gray-500">
                  Registered: {new Date(restaurant.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageRestaurants; 