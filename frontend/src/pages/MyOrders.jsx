import React from 'react';
import { MdFoodBank, MdDeliveryDining } from 'react-icons/md';

const MyOrders = () => {
  const orders = [
    {
      id: 1,
      restaurant: "Burger Palace",
      items: ["Classic Burger", "French Fries", "Coke"],
      total: 25.99,
      status: "Preparing",
      orderTime: "2024-03-20 14:30",
      deliveryAddress: "123 Main St, City"
    },
    {
      id: 2,
      restaurant: "Pizza Express",
      items: ["Margherita Pizza", "Garlic Bread"],
      total: 35.50,
      status: "On the Way",
      orderTime: "2024-03-20 13:15",
      deliveryAddress: "456 Oak Ave, City"
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Current Orders</h1>
      <div className="grid gap-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">{order.restaurant}</h2>
                <p className="text-gray-600">{order.orderTime}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                order.status === "Preparing" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
              }`}>
                {order.status}
              </span>
            </div>
            <div className="mb-4">
              <h3 className="font-medium mb-2">Order Items:</h3>
              <ul className="list-disc list-inside">
                {order.items.map((item, index) => (
                  <li key={index} className="text-gray-600">{item}</li>
                ))}
              </ul>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600">Delivery Address:</p>
                <p className="font-medium">{order.deliveryAddress}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-600">Total Amount:</p>
                <p className="text-xl font-bold">${order.total.toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders; 