import React, { useState } from "react";
import { MdOutlineArrowBackIosNew } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import Scroll from "../../hooks/useScroll.jsx";

const MakePayment = () => {
  const [paymentMethod, setPaymentMethod] = useState(""); // State for payment method
  const [amount, setAmount] = useState(""); // State for payment amount
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-6 flex justify-center items-center">
      <Scroll />
      <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-6">
        <Link to="/payments">
          <MdOutlineArrowBackIosNew className="text-3xl mb-4" />
        </Link>

        {/* Header Section */}
        <h2 className="text-center text-2xl font-bold mb-10">Make Payment</h2>

        {/* Amount Input Section */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)} // Update amount state
            className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="Enter amount in Rs."
          />
        </div>

        {/* Payment Method Section */}
        <div className="mb-16">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Payment Method
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="">Select Payment Method</option>
            <option value="card">Card Payment</option>
            <option value="bank">Bank Transfer</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          className="w-full bg-secondary rounded-xl p-4 text-white px-20 hover:scale-105 duration-300"
          onClick={() =>
            navigate(`/payments/card-payment`, { state: { amount } })
          }
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  );
};

export default MakePayment;
