import React from 'react';
import { MdPayments } from 'react-icons/md';

const PaymentHistory = () => {
  const transactions = [
    {
      id: 1,
      date: "2024-03-20 14:30",
      restaurant: "Burger Palace",
      orderId: "ORD123456",
      amount: 25.99,
      status: "Completed",
      paymentMethod: "Credit Card",
      cardLast4: "4242"
    },
    {
      id: 2,
      date: "2024-03-19 19:30",
      restaurant: "Sushi Master",
      orderId: "ORD123455",
      amount: 45.99,
      status: "Completed",
      paymentMethod: "Credit Card",
      cardLast4: "4242"
    },
    {
      id: 3,
      date: "2024-03-18 12:45",
      restaurant: "Taco Fiesta",
      orderId: "ORD123454",
      amount: 28.50,
      status: "Completed",
      paymentMethod: "Credit Card",
      cardLast4: "4242"
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Payment History</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-600 mb-2">Total Spent</h3>
          <p className="text-2xl font-bold">$100.48</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-600 mb-2">Total Orders</h3>
          <p className="text-2xl font-bold">3</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-600 mb-2">Average Order Value</h3>
          <p className="text-2xl font-bold">$33.49</p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Transaction History</h2>
        </div>
        <div className="divide-y">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="p-6 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{transaction.restaurant}</h3>
                  <p className="text-gray-600 text-sm">Order #{transaction.orderId}</p>
                  <p className="text-gray-600 text-sm">{transaction.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">${transaction.amount.toFixed(2)}</p>
                  <p className="text-gray-600 text-sm">
                    {transaction.paymentMethod} •••• {transaction.cardLast4}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Download Statement Button */}
      <button className="mt-6 w-full bg-primary text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
        <MdPayments className="text-xl" />
        Download Statement
      </button>
    </div>
  );
};

export default PaymentHistory; 