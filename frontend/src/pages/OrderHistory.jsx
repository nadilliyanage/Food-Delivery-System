import React from 'react';
import { FaHistory } from 'react-icons/fa';

const OrderHistory = () => {
  const orders = [
    {
      id: 1,
      restaurant: "Sushi Master",
      items: ["California Roll", "Miso Soup", "Green Tea"],
      total: 45.99,
      status: "Delivered",
      orderTime: "2024-03-19 19:30",
      deliveryAddress: "789 Pine St, City",
      rating: 5,
      review: "Great service and delicious food!"
    },
    {
      id: 2,
      restaurant: "Taco Fiesta",
      items: ["Chicken Tacos", "Nachos", "Soda"],
      total: 28.50,
      status: "Delivered",
      orderTime: "2024-03-18 12:45",
      deliveryAddress: "321 Elm St, City",
      rating: 4,
      review: "Good food, quick delivery"
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Order History</h1>
      <div className="grid gap-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">{order.restaurant}</h2>
                <p className="text-gray-600">{order.orderTime}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
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
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Rating:</span>
                <div className="flex">
                  {[...Array(order.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mt-2">{order.review}</p>
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

export default OrderHistory; 