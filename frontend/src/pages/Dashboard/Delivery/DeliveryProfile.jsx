import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserAlt, FaPhone, FaMapMarkerAlt, FaCar } from 'react-icons/fa';
import Swal from 'sweetalert2';

const DeliveryProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    email: '',
    vehicleType: '',
    vehicleNumber: '',
    licenseNumber: '',
    address: '',
    isAvailable: true,
    workingHours: {
      start: '09:00',
      end: '17:00'
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/deliveries/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch profile');
      setLoading(false);
      console.error('Error fetching profile:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.patch('http://localhost:3000/api/deliveries/profile', profile, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Swal.fire({
        title: 'Success!',
        text: 'Profile updated successfully',
        icon: 'success',
        confirmButtonText: 'OK'
      });
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update profile',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      console.error('Error updating profile:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleWorkingHoursChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [name]: value
      }
    }));
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="container mx-auto px-4 mt-0 md:mt-20 lg:mt-20">
      <h1 className="text-3xl font-bold text-center">Profile & Settings</h1>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FaUserAlt className="text-gray-500" />
                    <input
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleChange}
                      placeholder="Full Name"
                      className="flex-1 p-2 border rounded"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <FaPhone className="text-gray-500" />
                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone}
                      onChange={handleChange}
                      placeholder="Phone Number"
                      className="flex-1 p-2 border rounded"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-gray-500" />
                    <input
                      type="text"
                      name="address"
                      value={profile.address}
                      onChange={handleChange}
                      placeholder="Address"
                      className="flex-1 p-2 border rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Working Hours */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Working Hours</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-sm text-gray-600 mb-1">Start Time</label>
                      <input
                        type="time"
                        name="start"
                        value={profile.workingHours.start}
                        onChange={handleWorkingHoursChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm text-gray-600 mb-1">End Time</label>
                      <input
                        type="time"
                        name="end"
                        value={profile.workingHours.end}
                        onChange={handleWorkingHoursChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isAvailable"
                      checked={profile.isAvailable}
                      onChange={(e) => setProfile(prev => ({ ...prev, isAvailable: e.target.checked }))}
                      className="h-4 w-4 text-primary"
                    />
                    <label htmlFor="isAvailable" className="text-sm text-gray-600">
                      Available for deliveries
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Vehicle Information */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Vehicle Information</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FaCar className="text-gray-500" />
                    <select
                      name="vehicleType"
                      value={profile.vehicleType}
                      onChange={handleChange}
                      className="flex-1 p-2 border rounded bg-white"
                    >
                      <option value="">Select Vehicle Type</option>
                      <option value="motorcycle">Motorcycle</option>
                      <option value="bicycle">Bicycle</option>
                      <option value="car">Car</option>
                      <option value="scooter">Scooter</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCar className="text-gray-500" />
                    <input
                      type="text"
                      name="vehicleNumber"
                      value={profile.vehicleNumber}
                      onChange={handleChange}
                      placeholder="Vehicle Number"
                      className="flex-1 p-2 border rounded"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCar className="text-gray-500" />
                    <input
                      type="text"
                      name="licenseNumber"
                      value={profile.licenseNumber}
                      onChange={handleChange}
                      placeholder="License Number"
                      className="flex-1 p-2 border rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded hover:bg-primary-dark transition-colors"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default DeliveryProfile; 