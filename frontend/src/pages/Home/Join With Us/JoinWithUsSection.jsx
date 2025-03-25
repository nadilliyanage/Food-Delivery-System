import React from "react";
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../../utils/auth';

const JoinWithUs = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleClick = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate('/restaurant-registration');
    }
  };

  return (
    <div className="text-center py-12">
      <button
        onClick={handleClick}
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
      >
        {user ? 'Register Your Restaurant' : 'Login to Register'}
      </button>
    </div>
  );
};

const JoinWithUsSection = () => {
  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Want to Join Our Platform?
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Register your restaurant and start reaching more customers today!
          </p>
        </div>
        <JoinWithUs />
      </div>
    </div>
  );
};

export default JoinWithUsSection;
