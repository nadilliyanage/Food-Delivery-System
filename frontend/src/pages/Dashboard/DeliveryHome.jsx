import React from 'react';
import { MdDeliveryDining, MdDirectionsBike, MdHistory } from 'react-icons/md';
import { Link } from 'react-router-dom';

const DeliveryHome = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Delivery Personnel Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Current Deliveries Card */}
        <Link to="/dashboard/current-deliveries" className="block">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <MdDeliveryDining className="text-3xl text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Current Deliveries</h2>
                <p className="text-gray-600">View and manage your active deliveries</p>
              </div>
            </div>
          </div>
        </Link>

        {/* Available Deliveries */}
        <Link to="/dashboard/out-for-delivery" className="block">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <MdDirectionsBike className="text-3xl text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Available Deliveries</h2>
                <p className="text-gray-600">View available deliveries for you</p>
              </div>
            </div>
          </div>
        </Link>

        {/* Delivery History Card */}
        <Link to="/dashboard/delivery-history" className="block">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <MdHistory className="text-3xl text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Delivery History</h2>
                <p className="text-gray-600">View your past deliveries</p>
              </div>
            </div>
          </div>
        </Link>

        
      </div>
    </div>
  );
};

export default DeliveryHome; 