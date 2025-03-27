import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../utils/auth';
import Scroll from '../../hooks/useScroll';
import Swal from 'sweetalert2';

const DeliveryRegistration = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    vehicleType: '',
    vehicleNumber: '',
    licenseNumber: ''
  });

  useEffect(() => {
    if (user) {
      checkExistingRegistration();
    }
  }, [user]);

  const checkExistingRegistration = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/deliveries/user/delivery-personnel-registrations`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      // Check if user has any existing registration
      const existingRegistration = data.registrations?.find(reg => reg.user === user.id);
      
      if (existingRegistration) {
        if (existingRegistration.registrationStatus === 'pending') {
          Swal.fire({
            title: 'Pending Registration',
            text: 'You already have a pending delivery personnel registration. Please wait for admin approval.',
            icon: 'info',
            confirmButtonText: 'OK'
          }).then(() => {
            navigate('/');
          });
        } else if (existingRegistration.registrationStatus === 'rejected') {
          Swal.fire({
            title: 'Previous Registration Rejected',
            text: 'Your previous registration was rejected. Would you like to submit a new registration?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, submit new',
            cancelButtonText: 'No, go back'
          }).then((result) => {
            if (!result.isConfirmed) {
              navigate('/');
            }
          });
        } else if (existingRegistration.registrationStatus === 'approved') {
          Swal.fire({
            title: 'Already Registered',
            text: 'You are already registered as a delivery personnel.',
            icon: 'info',
            confirmButtonText: 'OK'
          }).then(() => {
            navigate('/dashboard/delivery-home');
          });
        }
      }
    } catch (error) {
      console.error('Error checking registration:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to check existing registration. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const requiredFields = ['vehicleType', 'vehicleNumber', 'licenseNumber'];
    const missingFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '');

    if (missingFields.length > 0) {
      Swal.fire({
        title: 'Missing Fields',
        text: `Please fill in all required fields: ${missingFields.join(', ')}`,
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const requestBody = {
        vehicleType: formData.vehicleType,
        vehicleNumber: formData.vehicleNumber,
        licenseNumber: formData.licenseNumber
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/deliveries/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          title: 'Success!',
          text: 'Registration submitted successfully! We will review your application.',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          navigate('/');
        });
      } else {
        if (data.errors && Array.isArray(data.errors)) {
          // If there are specific validation errors, show them
          Swal.fire({
            title: 'Validation Error',
            html: data.errors.map(error => `<p class="text-red-600">${error}</p>`).join(''),
            icon: 'error',
            confirmButtonText: 'OK'
          });
        } else {
          // For other errors, show the general message
          throw new Error(data.message || 'Registration failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        title: 'Error!',
        text: error.message || 'An error occurred. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Scroll />
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Register as a Delivery Partner
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Join our delivery network and start earning today!
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700">
                Vehicle Type
              </label>
              <select
                id="vehicleType"
                name="vehicleType"
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                value={formData.vehicleType}
                onChange={handleChange}
              >
                <option value="">Select a vehicle type</option>
                <option value="motorcycle">Motorcycle</option>
                <option value="bicycle">Bicycle</option>
                <option value="car">Car</option>
                <option value="scooter">Scooter</option>
              </select>
            </div>

            <div>
              <label htmlFor="vehicleNumber" className="block text-sm font-medium text-gray-700">
                Vehicle Registration Number
              </label>
              <input
                type="text"
                id="vehicleNumber"
                name="vehicleNumber"
                required
                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                value={formData.vehicleNumber}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
                Driver's License Number
              </label>
              <input
                type="text"
                id="licenseNumber"
                name="licenseNumber"
                required
                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                value={formData.licenseNumber}
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className={`
                  inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm
                  ${isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                  }
                  transition-colors duration-200
                `}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit Registration'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DeliveryRegistration; 