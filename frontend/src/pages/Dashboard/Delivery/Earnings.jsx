import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdPayments, MdTrendingUp, MdCalendarToday } from 'react-icons/md';
import Swal from 'sweetalert2';

const Earnings = () => {
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    weeklyEarnings: 0,
    monthlyEarnings: 0,
    deliveryHistory: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('week'); // week, month, year

  useEffect(() => {
    fetchEarnings();
  }, [timeRange]);

  const fetchEarnings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3000/api/deliveries/earnings?range=${timeRange}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEarnings(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch earnings');
      setLoading(false);
      console.error('Error fetching earnings:', err);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Earnings</h1>
        
        <div className="flex gap-4">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 rounded ${
              timeRange === 'week' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 rounded ${
              timeRange === 'month' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-4 py-2 rounded ${
              timeRange === 'year' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Year
          </button>
        </div>
      </div>

      {/* Earnings Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <MdPayments className="text-3xl text-green-600" />
            </div>
            <div>
              <p className="text-gray-600">Total Earnings</p>
              <h3 className="text-2xl font-bold">${earnings.totalEarnings.toFixed(2)}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <MdTrendingUp className="text-3xl text-blue-600" />
            </div>
            <div>
              <p className="text-gray-600">This {timeRange === 'week' ? 'Week' : timeRange === 'month' ? 'Month' : 'Year'}</p>
              <h3 className="text-2xl font-bold">
                ${(timeRange === 'week' ? earnings.weeklyEarnings : 
                  timeRange === 'month' ? earnings.monthlyEarnings : 
                  earnings.totalEarnings).toFixed(2)}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <MdCalendarToday className="text-3xl text-purple-600" />
            </div>
            <div>
              <p className="text-gray-600">Total Deliveries</p>
              <h3 className="text-2xl font-bold">{earnings.deliveryHistory.length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Delivery History</h2>
        {earnings.deliveryHistory.length === 0 ? (
          <p className="text-gray-500 text-center">No delivery history found</p>
        ) : (
          <div className="space-y-4">
            {earnings.deliveryHistory.map((delivery) => (
              <div key={delivery._id} className="flex items-center justify-between p-4 border rounded">
                <div>
                  <h3 className="font-semibold">Order #{delivery.orderId}</h3>
                  <p className="text-gray-600">{new Date(delivery.deliveryDate).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">${delivery.earnings.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">{delivery.distance} km</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Earnings; 