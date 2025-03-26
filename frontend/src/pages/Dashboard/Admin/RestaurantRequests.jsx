import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const RestaurantRequests = () => {
  const [restaurants, setRestaurants] = useState({
    pending: [],
    approved: [],
    rejected: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    // Fetch all tabs' data on initial load
    fetchRestaurants(true);
  }, []); // Remove activeTab dependency

  const fetchRestaurants = async (fetchAll = false) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (fetchAll) {
        // Fetch data for all tabs simultaneously
        const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
          axios.get('http://localhost:3000/api/restaurants/admin/pending-registrations', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:3000/api/restaurants/admin/approved-registrations', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:3000/api/restaurants/admin/rejected-registrations', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setRestaurants({
          pending: pendingRes.data,
          approved: approvedRes.data,
          rejected: rejectedRes.data
        });
      } else {
        // Fetch data only for active tab
        let endpoint = '';
        switch (activeTab) {
          case 'pending':
            endpoint = 'http://localhost:3000/api/restaurants/admin/pending-registrations';
            break;
          case 'approved':
            endpoint = 'http://localhost:3000/api/restaurants/admin/approved-registrations';
            break;
          case 'rejected':
            endpoint = 'http://localhost:3000/api/restaurants/admin/rejected-registrations';
            break;
          default:
            endpoint = 'http://localhost:3000/api/restaurants/admin/pending-registrations';
        }

        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setRestaurants(prev => ({
          ...prev,
          [activeTab]: response.data
        }));
      }
      
      setLoading(false);
    } catch (err) {
      setError(`Failed to fetch ${fetchAll ? 'all' : activeTab} restaurants`);
      setLoading(false);
      console.error('Error fetching restaurants:', err);
    }
  };

  // Add a separate useEffect for tab changes
  useEffect(() => {
    if (!loading) {
      fetchRestaurants(false);
    }
  }, [activeTab]);

  const handleStatusUpdate = async (restaurantId, status) => {
    try {
      const token = localStorage.getItem('token');
      
      // Show confirmation dialog
      const confirmText = status === 'approved' ? 'approve' : 
                         status === 'rejected' ? 'reject' : 
                         status === 'pending' ? 'move back to pending' : 'decline';
      
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: `Do you want to ${confirmText} this restaurant?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: status === 'approved' ? '#22c55e' : 
                          status === 'rejected' ? '#ef4444' : '#3b82f6',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      });

      if (!result.isConfirmed) {
        return;
      }

      await axios.put(
        'http://localhost:3000/api/restaurants/admin/registration-status',
        { 
          restaurantId,
          status 
        },
        { 
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      Swal.fire({
        title: 'Success!',
        text: `Restaurant ${confirmText} successfully`,
        icon: 'success',
        confirmButtonText: 'OK'
      });

      // Refresh all tabs' data after status update
      await fetchRestaurants(true);
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update restaurant status',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      console.error('Error updating status:', err);
    }
  };

  const tabs = [
    { id: 'pending', label: 'Pending Requests', count: restaurants.pending.length },
    { id: 'approved', label: 'Approved Requests', count: restaurants.approved.length },
    { id: 'rejected', label: 'Rejected Requests', count: restaurants.rejected.length }
  ];

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Restaurant Registration Requests</h1>
      
      {/* Tabs */}
      <div className="flex space-x-4 mb-8 border-b">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-semibold rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:text-blue-500'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Content */}
      {restaurants[activeTab].length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500">No {activeTab} registration requests</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {restaurants[activeTab].map((restaurant) => (
            <div key={restaurant._id} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-2">{restaurant.name}</h2>
              <div className="space-y-2 text-gray-600">
                <p><span className="font-medium">Cuisine:</span> {restaurant.cuisine}</p>
                <p><span className="font-medium">Location:</span> {restaurant.location}</p>
                <p><span className="font-medium">Phone:</span> {restaurant.phone}</p>
                <p><span className="font-medium">Email:</span> {restaurant.email}</p>
                <p><span className="font-medium">Address:</span> {restaurant.address.street}, {restaurant.address.city}, {restaurant.address.state} {restaurant.address.zipCode}</p>
                <p className="mt-4"><span className="font-medium">Description:</span> {restaurant.description}</p>
              </div>
              
              {/* Action Buttons */}
              <div className="mt-6 flex gap-4">
                {activeTab === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(restaurant._id, 'approved')}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(restaurant._id, 'rejected')}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                    >
                      Reject
                    </button>
                  </>
                )}
                {activeTab === 'approved' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(restaurant._id, 'pending')}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                      Back to Pending
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(restaurant._id, 'rejected')}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                    >
                      Decline
                    </button>
                  </>
                )}
                {activeTab === 'rejected' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(restaurant._id, 'pending')}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                      Back to Pending
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(restaurant._id, 'approved')}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                    >
                      Approve
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantRequests; 