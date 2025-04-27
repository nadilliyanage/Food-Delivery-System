import React, { useEffect, useState } from "react";
import useUser from "../../../hooks/useUser";
import { Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const AdminHome = () => {
  const { currentUser } = useUser();
  const [pendingRestaurantCount, setPendingRestaurantCount] = useState(0);
  const [pendingDeliveryCount, setPendingDeliveryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pendingRestaurants, setPendingRestaurants] = useState([]);
  const [pendingDeliveries, setPendingDeliveries] = useState([]);
  const [expandedRestaurants, setExpandedRestaurants] = useState(false);
  const [expandedDeliveries, setExpandedDeliveries] = useState(false);

  useEffect(() => {
    const fetchPendingCounts = async () => {
      try {
        const token = localStorage.getItem("token");
        const [restaurantRes, deliveryRes] = await Promise.all([
          axios.get(
            `${
              import.meta.env.VITE_API_URL
            }/api/restaurants/admin/pending-registrations`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          axios.get(
            `${
              import.meta.env.VITE_API_URL
            }/api/deliveries/admin/pending-registrations`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
        ]);
        setPendingRestaurantCount(restaurantRes.data.length);
        setPendingDeliveryCount(deliveryRes.data.length);
        setPendingRestaurants(restaurantRes.data);
        setPendingDeliveries(deliveryRes.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching pending counts:", error);
        setLoading(false);
      }
    };

    fetchPendingCounts();
  }, []);

  const handleStatusUpdate = async (restaurantId, status) => {
    try {
      const token = localStorage.getItem("token");
      const confirmText = status === "approved" ? "approve" : "reject";

      const result = await Swal.fire({
        title: "Are you sure?",
        text: `Do you want to ${confirmText} this restaurant?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: status === "approved" ? "#22c55e" : "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes",
        cancelButtonText: "No",
      });

      if (!result.isConfirmed) {
        return;
      }

      await axios.patch(
        `${
          import.meta.env.VITE_API_URL
        }/api/restaurants/admin/registration-status`,
        {
          restaurantId,
          status,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Swal.fire({
        title: "Success!",
        text: `Restaurant ${confirmText} successfully`,
        icon: "success",
        confirmButtonText: "OK",
      });

      // Refresh the data
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/api/restaurants/admin/pending-registrations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPendingRestaurants(response.data);
      setPendingRestaurantCount(response.data.length);
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: "Failed to update restaurant status",
        icon: "error",
        confirmButtonText: "OK",
      });
      console.error("Error updating status:", err);
    }
  };

  const handleDeliveryStatusUpdate = async (deliveryId, status) => {
    try {
      const token = localStorage.getItem("token");
      const confirmText = status === "approved" ? "approve" : "reject";

      const result = await Swal.fire({
        title: "Are you sure?",
        text: `Do you want to ${confirmText} this delivery personnel?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: status === "approved" ? "#22c55e" : "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes",
        cancelButtonText: "No",
      });

      if (!result.isConfirmed) {
        return;
      }

      await axios.patch(
        `${
          import.meta.env.VITE_API_URL
        }/api/deliveries/admin/registration-status`,
        {
          registrationId: deliveryId,
          status,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Swal.fire({
        title: "Success!",
        text: `Delivery personnel ${confirmText} successfully`,
        icon: "success",
        confirmButtonText: "OK",
      });

      // Refresh the data
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/api/deliveries/admin/pending-registrations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPendingDeliveries(response.data);
      setPendingDeliveryCount(response.data.length);
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: "Failed to update delivery personnel status",
        icon: "error",
        confirmButtonText: "OK",
      });
      console.error("Error updating status:", err);
    }
  };

  const renderRestaurantTable = () => {
    const displayRestaurants = expandedRestaurants
      ? pendingRestaurants
      : pendingRestaurants.slice(0, 3);

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Restaurant Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Contact Info
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {displayRestaurants.map((restaurant) => (
              <tr
                key={restaurant._id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      {restaurant.imageUrl ? (
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={restaurant.imageUrl}
                          alt={restaurant.name}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-lg font-semibold">
                            {restaurant.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {restaurant.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {restaurant._id.slice(-6)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {restaurant.email}
                  </div>
                  <div className="text-sm text-gray-500">
                    {restaurant.phone}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {restaurant.address?.city}, {restaurant.address?.state}
                  </div>
                  <div className="text-sm text-gray-500">
                    {restaurant.address?.zipCode}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Pending Review
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() =>
                        handleStatusUpdate(restaurant._id, "approved")
                      }
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Approve
                    </button>
                    <button
                      onClick={() =>
                        handleStatusUpdate(restaurant._id, "rejected")
                      }
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Reject
                    </button>
                    <Link
                      to={`/dashboard/restaurant-requests`}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      View
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pendingRestaurants.length > 3 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setExpandedRestaurants(!expandedRestaurants)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              {expandedRestaurants ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Show Less
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Show More ({pendingRestaurants.length - 3} more)
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderDeliveryTable = () => {
    const displayDeliveries = expandedDeliveries
      ? pendingDeliveries
      : pendingDeliveries.slice(0, 3);

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Delivery Personnel
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Contact Info
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Vehicle Details
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {displayDeliveries.map((delivery) => (
              <tr
                key={delivery._id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      {delivery.user?.profileImage ? (
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={delivery.user.profileImage}
                          alt={delivery.user.name}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-lg font-semibold">
                            {delivery.user?.name?.charAt(0) || "D"}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {delivery.user?.name || "Unknown User"}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {delivery._id.slice(-6)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {delivery.user?.email || "N/A"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {delivery.user?.phone || "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {delivery.vehicleType || "N/A"}
                  </div>
                  <div className="text-sm text-gray-500">
                    License: {delivery.licenseNumber || "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Pending Review
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() =>
                        handleDeliveryStatusUpdate(delivery._id, "approved")
                      }
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Approve
                    </button>
                    <button
                      onClick={() =>
                        handleDeliveryStatusUpdate(delivery._id, "rejected")
                      }
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Reject
                    </button>
                    <Link
                      to={`/dashboard/delivery-requests`}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      View
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pendingDeliveries.length > 3 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setExpandedDeliveries(!expandedDeliveries)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              {expandedDeliveries ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Show Less
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Show More ({pendingDeliveries.length - 3} more)
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-4xl font-bold my-7">
        Welcome Back,{" "}
        <span className="text-secondary">{currentUser?.name}</span>!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <Link
          to="/dashboard/restaurant-requests"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">Restaurant Requests</h2>
          <p className="text-gray-600">
            Manage restaurant registration requests
          </p>
          {!loading && (
            <div className="mt-2">
              <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm font-medium">
                {pendingRestaurantCount} Pending Requests
              </span>
            </div>
          )}
        </Link>

        <Link
          to="/dashboard/delivery-requests"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">
            Delivery Personnel Requests
          </h2>
          <p className="text-gray-600">
            Manage delivery personnel registration requests
          </p>
          {!loading && (
            <div className="mt-2">
              <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm font-medium">
                {pendingDeliveryCount} Pending Requests
              </span>
            </div>
          )}
        </Link>

        <Link
          to="/dashboard/manage-users"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">Manage Users</h2>
          <p className="text-gray-600">
            View and manage all users in the system
          </p>
        </Link>
      </div>

      {/* Pending Restaurant Requests Table */}
      <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Recent Pending Restaurant Requests
          </h2>
          <Link
            to="/dashboard/restaurant-requests"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            View All Requests
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : pendingRestaurants.length === 0 ? (
          <div className="text-center py-12">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="mt-4 text-gray-500 text-lg">
              No pending restaurant requests
            </p>
          </div>
        ) : (
          renderRestaurantTable()
        )}
      </div>

      {/* Pending Delivery Personnel Requests Table */}
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Recent Pending Delivery Personnel Requests
          </h2>
          <Link
            to="/dashboard/delivery-requests"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            View All Requests
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : pendingDeliveryCount === 0 ? (
          <div className="text-center py-12">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="mt-4 text-gray-500 text-lg">
              No pending delivery personnel requests
            </p>
          </div>
        ) : (
          renderDeliveryTable()
        )}
      </div>
    </div>
  );
};

export default AdminHome;
