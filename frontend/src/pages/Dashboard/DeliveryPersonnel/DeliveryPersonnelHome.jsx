import React, { useState, useEffect } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import {
  FaMotorcycle,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
} from "react-icons/fa";

const DeliveryPersonnelHome = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const axiosSecure = useAxiosSecure();

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const response = await axiosSecure.get("/api/deliveries");
        setDeliveries(response.data);
      } catch (error) {
        console.error("Error fetching deliveries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, [axiosSecure]);

  const handleStatusUpdate = async (deliveryId, newStatus) => {
    try {
      await axiosSecure.patch(`/api/deliveries/${deliveryId}`, {
        status: newStatus,
      });
      // Refresh deliveries after status update
      const response = await axiosSecure.get("/api/deliveries");
      setDeliveries(response.data);
    } catch (error) {
      console.error("Error updating delivery status:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  const pendingDeliveries = deliveries.filter((d) => d.status === "Assigned");
  const activeDeliveries = deliveries.filter(
    (d) => d.status === "Out for Delivery"
  );
  const completedDeliveries = deliveries.filter(
    (d) => d.status === "Delivered"
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Delivery Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <FaClock className="text-yellow-500 text-2xl mr-3" />
            <div>
              <h3 className="text-gray-500 text-sm">Pending Deliveries</h3>
              <p className="text-2xl font-bold">{pendingDeliveries.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <FaMotorcycle className="text-blue-500 text-2xl mr-3" />
            <div>
              <h3 className="text-gray-500 text-sm">Active Deliveries</h3>
              <p className="text-2xl font-bold">{activeDeliveries.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <FaCheckCircle className="text-green-500 text-2xl mr-3" />
            <div>
              <h3 className="text-gray-500 text-sm">Completed Deliveries</h3>
              <p className="text-2xl font-bold">{completedDeliveries.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Deliveries */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Pending Deliveries</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingDeliveries.map((delivery) => (
                <tr key={delivery._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {delivery.order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {delivery.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      {delivery.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() =>
                        handleStatusUpdate(delivery._id, "Out for Delivery")
                      }
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Start Delivery
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Deliveries */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Active Deliveries</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activeDeliveries.map((delivery) => (
                <tr key={delivery._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {delivery.order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {delivery.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {delivery.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() =>
                        handleStatusUpdate(delivery._id, "Delivered")
                      }
                      className="text-green-600 hover:text-green-900"
                    >
                      Mark as Delivered
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DeliveryPersonnelHome;
