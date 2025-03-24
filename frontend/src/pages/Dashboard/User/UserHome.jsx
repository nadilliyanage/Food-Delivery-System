import React, { useState } from 'react';
import useUser from '../../../hooks/useUser';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const UserHome = () => {
  const { currentUser } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal

  // Function to download the QR code image
  const downloadQRCode = () => {
    Swal.fire({
      title: "Are you sure you want to download the QR code?",
      text: "",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, download!",
    }).then((result) => {
      if (result.isConfirmed) {
        const link = document.createElement('a');
        link.href = currentUser?.qrCodeUrl;
        link.download = `qr-code-of-${currentUser.name}`; // Name of the downloaded file
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        Swal.fire({
          title: "Downloaded!",
          text: "You have successfully downloaded the QR code.",
          icon: "success",
        });
      }
    });
  };

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
            Hi, <span className='text-secondary items-stretch'>{currentUser?.name}!</span> Welcome to your dashboard
          </h1>
          
          {/* QR Code image that opens the modal on click */}
          <img 
            src={currentUser?.qrCodeUrl} 
            alt="QR code" 
            className='mx-auto cursor-pointer' 
            onClick={openModal} 
          />

          {/* Modal for full-screen QR code */}
          {isModalOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
              onClick={closeModal}
            >
              <div className="relative">
                <button 
                  className="absolute top-0 right-0 bg-white text-black rounded-full px-2 mx-2 text-xl"
                  onClick={closeModal}
                >
                  &times; {/* Close button */}
                </button>
                <img 
                  src={currentUser?.qrCodeUrl} 
                  alt="QR code" 
                  className='w-full h-96'
                />
              </div>
            </div>
          )}

          <div className='text-center mt-4'>
            <button 
              className='bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary-dark transition duration-300'
              onClick={downloadQRCode}
            >
              Download QR Code
            </button>
          </div>

          <div className='text-center'>
            <h2 className='font-bold mt-6'>You can jump to any page you want from here.</h2>
            <div className='flex items-center justify-center my-4 gap-3 flex-wrap'>
              <div className='border border-secondary rounded-lg hover:bg-secondary hover:scale-110 duration-300 hover:text-white px-2 py-1'>
                <Link to='/dashboard/user-profile'>Your Profile</Link>
              </div>
              <div className='border border-secondary rounded-lg hover:bg-secondary hover:scale-110 duration-300 hover:text-white px-2 py-1'>
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
