import React, { useEffect, useState } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { MdDeliveryDining } from "react-icons/md";
import { FaMapMarkerAlt, FaPhone, FaUser } from "react-icons/fa";
import { format, isValid } from "date-fns";
import Button from "../../../components/Button/Button";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const OutForDelivery = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axiosSecure.get(
          "/api/orders/delivery/out-for-delivery"
        );

        // Fetch customer details for each order
        const ordersWithDetails = await Promise.all(
          response.data.map(async (order) => {
            try {
              // Fetch customer details
              const customerResponse = await axiosSecure.get(
                `/api/auth/users/${order.customer}`
              );
              
              // Fetch restaurant details
              const restaurantResponse = await axiosSecure.get(
                `/api/restaurants/${order.restaurant}`
              );

              return {
                ...order,
                customer: customerResponse.data,
                restaurantDetails: restaurantResponse.data
              };
            } catch (error) {
              console.error("Error fetching order details:", error);
              return order;
            }
          })
        );

        // Sort orders by createdAt date in descending order (newest first)
        const sortedOrders = ordersWithDetails.sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        );

        setOrders(sortedOrders);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setLoading(false);
      }
    };

    // Initial fetch
    fetchOrders();

    // Set up polling interval (30 seconds)
    const intervalId = setInterval(fetchOrders, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [axiosSecure]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: `Do you want to update the order status to "${newStatus}"?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, update it!",
        cancelButtonText: "No, cancel!",
      });

      if (result.isConfirmed) {
        const response = await axiosSecure.patch(
          `/api/orders/${orderId}`,
          { status: newStatus },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.status === 200) {
          // Update the order in the state
          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              order._id === orderId ? { ...order, status: newStatus } : order
            )
          );

          // If status is "On the Way", create a delivery record
          if (newStatus === "On the Way") {
            try {
              await axiosSecure.post(
                `/api/deliveries/assign-driver`,
                { 
                  orderId: orderId,
                  driverId: localStorage.getItem("userId") // Assuming userId is stored in localStorage
                },
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );
            } catch (deliveryError) {
              console.error("Error creating delivery record:", deliveryError);
            }
          }

          // Show success message
          await Swal.fire({
            title: "Success!",
            text: `Order status updated to "${newStatus}"`,
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });

          // If status is "On the Way", navigate to current deliveries
          if (newStatus === "On the Way") {
            navigate("/dashboard/current-deliveries");
          }
        }
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      // Show error message
      Swal.fire({
        title: "Error!",
        text: "Failed to update order status. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    const date = new Date(dateString);
    return isValid(date) ? format(date, "PPp") : "Invalid date";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      <h1 className="text-center text-4xl font-bold my-7">
        <span className="text-primary">Delivery</span> Orders
      </h1>

      {orders.length === 0 ? (
        <div className="text-center mt-10">
          <MdDeliveryDining className="mx-auto text-6xl text-gray-400" />
          <p className="mt-4 text-xl text-gray-600">
            No orders available for delivery at the moment.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">
                  Order #{order._id.slice(-6)}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    order.status === "Out for Delivery"
                      ? "bg-yellow-100 text-yellow-800"
                      : order.status === "On the Way"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="space-y-4">
                {/* Customer Details Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">Customer Details:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FaUser className="text-gray-500" />
                      <span>{order.customer?.name || "N/A"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <FaPhone className="text-gray-500" />
                      <span>{order.customer?.phone || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* Restaurant Details Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">Restaurant:</h4>
                  <p>{order.restaurantDetails?.name || "N/A"}</p>
                  <p className="text-sm text-gray-500">
                    {order.restaurantDetails?.address?.street || "N/A"}, 
                    {order.restaurantDetails?.address?.city || ""}
                  </p>
                </div>

                {/* Delivery Address Section */}
                <div className="flex items-start gap-2">
                  <FaMapMarkerAlt className="text-gray-500 mt-1" />
                  <div>
                    <p className="font-medium">Delivery Address:</p>
                    <p className="text-gray-600">
                      {order.deliveryAddress?.street || "N/A"},{" "}
                      {order.deliveryAddress?.city || "N/A"}
                    </p>
                    {order.deliveryAddress?.instructions && (
                      <p className="text-gray-500 text-sm mt-1">
                        Instructions: {order.deliveryAddress.instructions}
                      </p>
                    )}
                  </div>
                </div>

                {/* Order Details Section */}
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500">
                    Ordered on: {formatDate(order.createdAt)}
                  </p>
                  <p className="text-lg font-semibold mt-2">
                    Total: Rs. {(order.totalPrice).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Payment Method: {order.paymentMethod || "N/A"}
                  </p>
                </div>

                <div className="flex gap-2 mt-4">
                  {order.status === "Out for Delivery" && (
                    <>
                      <Button
                        className="bg-green-500 text-white flex-1"
                        onClick={() =>
                          handleUpdateStatus(order._id, "On the Way")
                        }
                      >
                        Accept Delivery
                      </Button>
                      <Button
                        className="bg-red-500 text-white flex-1"
                        onClick={() =>
                          handleUpdateStatus(order._id, "Rejected")
                        }
                      >
                        Reject Delivery
                      </Button>
                    </>
                  )}
                  {order.status === "On the Way" && (
                    <Button
                      className="bg-green-500 text-white flex-1"
                      onClick={() => handleUpdateStatus(order._id, "Delivered")}
                    >
                      Mark as Delivered
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OutForDelivery;
