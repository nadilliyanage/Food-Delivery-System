import React, { useEffect, useState } from "react";
import useUser from "../../../hooks/useUser";
import { Link } from "react-router-dom";

const AdminHome = () => {

  const { currentUser } = useUser();
  
  return (
    <div>
      <h1 className="text-4xl font-bold my-7">
        Welcome Back,{" "}
        <span className="text-secondary">{currentUser?.name}</span>!
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <Link to="/dashboard/restaurant-requests" className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Restaurant Requests</h2>
          <p className="text-gray-600">Manage restaurant registration requests</p>
        </Link>
        
        <Link to="/dashboard/delivery-requests" className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Delivery Personnel Requests</h2>
          <p className="text-gray-600">Manage delivery personnel registration requests</p>
        </Link>
        
        <Link to="/dashboard/manage-users" className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Manage Users</h2>
          <p className="text-gray-600">View and manage all users in the system</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminHome;
