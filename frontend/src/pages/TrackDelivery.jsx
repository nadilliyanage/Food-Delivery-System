import React from 'react';
import { MdDeliveryDining } from 'react-icons/md';

const TrackDelivery = () => {
  const delivery = {
    orderId: "ORD123456",
    restaurant: "Burger Palace",
    deliveryPerson: "John Doe",
    status: "On the Way",
    estimatedTime: "15 minutes",
    currentLocation: "123 Main St",
    destination: "456 Oak Ave",
    items: ["Classic Burger", "French Fries", "Coke"],
    total: 25.99
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Track Your Delivery</h1>
      
      {/* Order Summary Card */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold">Order #{delivery.orderId}</h2>
            <p className="text-gray-600">{delivery.restaurant}</p>
          </div>
          <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
            {delivery.status}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Delivery Details</h3>
            <div className="space-y-2">
              <p><span className="text-gray-600">Delivery Partner:</span> {delivery.deliveryPerson}</p>
              <p><span className="text-gray-600">Estimated Time:</span> {delivery.estimatedTime}</p>
              <p><span className="text-gray-600">Current Location:</span> {delivery.currentLocation}</p>
              <p><span className="text-gray-600">Destination:</span> {delivery.destination}</p>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Order Items</h3>
            <ul className="list-disc list-inside">
              {delivery.items.map((item, index) => (
                <li key={index} className="text-gray-600">{item}</li>
              ))}
            </ul>
            <p className="mt-4 text-xl font-bold">Total: ${delivery.total.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="font-medium mb-4">Delivery Route</h3>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Map will be displayed here</p>
        </div>
      </div>

      {/* Contact Delivery Partner Button */}
      <button className="mt-6 w-full bg-primary text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
        <MdDeliveryDining className="text-xl" />
        Contact Delivery Partner
      </button>
    </div>
  );
};

export default TrackDelivery; 