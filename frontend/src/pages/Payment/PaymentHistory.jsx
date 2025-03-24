import React, { useEffect, useState } from "react";
import { MdOutlineArrowBackIosNew } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import axios, { HttpStatusCode } from "axios";
import useUser from "../../hooks/useUser.jsx";
import Scroll from "../../hooks/useScroll.jsx";

const PaymentHistory = () => {
  const { currentUser } = useUser();
  const [transactionLog, setTransactionLog] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all"); // New filter state for transaction type
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactionLog = async () => {
      if (currentUser) {
        try {
          const response = await axios.get(
            `http://localhost:3000/api/payments/transactionLog/${currentUser._id}`
          );
          if (response.status === HttpStatusCode.Ok) {
            const sortedTransactions = response.data.transactionLog.sort(
              (a, b) => new Date(b.date) - new Date(a.date) // Sorting by date (newest first)
            );
            setTransactionLog(sortedTransactions);
            setFilteredTransactions(sortedTransactions);
          }
        } catch (error) {
          console.error("Payment error:", error);
        }
      }
    };

    fetchTransactionLog();
  }, [currentUser]);

  // Filter logic based on date range, status, and type
  useEffect(() => {
    let filtered = transactionLog;

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (transaction) => transaction.status === filterStatus
      );
    }

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(
        (transaction) => transaction.transactionType === filterType
      );
    }

    // Filter by date range if both startDate and endDate are provided
    if (startDate && endDate) {
      filtered = filtered.filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        return (
          transactionDate >= new Date(startDate) &&
          transactionDate <= new Date(endDate)
        );
      });
    }

    setFilteredTransactions(filtered);
  }, [startDate, endDate, filterStatus, filterType, transactionLog]);

  return (
    <div className="min-h-screen bg-green- p-4 flex justify-center sm:p-6 lg:mx-[30%]">
      <Scroll />
      <div className="mt-16 mx-auto w-full max-w-4xl p-6 bg-white dark:bg-slate-900 dark:shadow-slate-500 shadow-lg rounded-lg text-center-w-lg overflow-hidden">
        {/* Payment History Filter Section */}
        <div className="bg-secondary p-4 rounded-xl">
          <Link to="/payments">
            <MdOutlineArrowBackIosNew className="text-2xl sm:text-3xl mb-4 text-white" />
          </Link>
          <h2 className="text-center text-xl sm:text-2xl font-bold text-white mb-4">
            Transaction History
          </h2>

          <div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-400 rounded-lg p-2 w-full sm:w-1/3"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-400 rounded-lg p-2 w-full sm:w-1/3"
            />

            {/* Filter by Type */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-400 rounded-lg p-2 w-full sm:w-1/3"
            >
              <option value="all">All Types</option>
              <option value="Bill Payment">Bill Payment</option>
              <option value="Cash Back">Cash Back</option>
              <option value="Monthly Fee">Monthly Fee</option>
              <option value="Special Waste Fee">Special Waste Fee</option>
              
            </select>
          </div>
        </div>

        {/* Payment Cards Section with Scrollable View */}
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto mt-4">
          {filteredTransactions.map((transaction, index) => (
            <div
              key={index}
              className="bg-yellow-100 p-4 rounded-md shadow-md mb-4"
            >
              <p
                className={
                  "font-bold" +
                  (transaction.amount > 0 ? " text-red-600" : " text-green-600")
                }
              >
                {transaction.transactionType}
              </p>
              <p>Rs. {transaction.amount.toFixed(2)}</p>
              <p>{transaction.date}</p>
              <p>{transaction?.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;
