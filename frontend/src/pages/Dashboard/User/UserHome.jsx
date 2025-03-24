import React, { useState } from 'react';
import useUser from '../../../hooks/useUser';
import { Link } from 'react-router-dom';

const UserHome = () => {
  const { currentUser } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal

  // Function to toggle modal for full-screen QR code
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className='mt-5 flex justify-center items-center'>
      <div>
        <div>
          <h1 className='text-4xl capitalize font-bold'>
            Hi, <span className='text-primary items-stretch'>{currentUser?.name}!</span> Welcome to your dashboard
          </h1>

          <div className='text-center'>
            <h2 className='font-bold mt-6'>You can jump to any page you want from here.</h2>
            <div className='flex items-center justify-center my-4 gap-3 flex-wrap'>
              <div className='border border-primary rounded-lg hover:bg-primary hover:scale-110 duration-300 hover:text-white px-2 py-1'>
                <Link to='/dashboard/user-profile'>Your Profile</Link>
              </div>
              <div className='border border-primary rounded-lg hover:bg-primary hover:scale-110 duration-300 hover:text-white px-2 py-1'>
                <Link to='/dashboard/my-payments'>Payment History</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserHome;
