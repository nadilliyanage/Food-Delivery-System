import React from 'react';
import { MdFoodBank, MdRestaurantMenu } from 'react-icons/md';
import { Link } from 'react-router-dom';

const RestaurantAdminHome = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Restaurant Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Manage Restaurants Card */}
        <Link to="/dashboard/manage-restaurants" className="block">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <MdFoodBank className="text-3xl text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Manage Restaurants</h2>
                <p className="text-gray-600">View and manage your restaurants</p>
              </div>
            </div>
          </div>
        </Link>

        {/* Manage Menus Card */}
        <Link to="/dashboard/manage-menus" className="block">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <MdRestaurantMenu className="text-3xl text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Manage Menus</h2>
                <p className="text-gray-600">Update restaurant menus and items</p>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default RestaurantAdminHome; 