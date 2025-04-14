import React, { useEffect, useState } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { MdDeliveryDining } from "react-icons/md";
import { FaMapMarkerAlt, FaPhone, FaUser } from "react-icons/fa";
import { format, isValid } from "date-fns";
import Button from "../../../components/Button/Button";

const CurrentDeliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const axiosSecure = useAxiosSecure();

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const response = await axiosSecure.get("/api/deliveries/user/deliveries");
        // Fetch order and customer details for each delivery
        const deliveriesWithDetails = await Promise.all(
          response.data.deliveries.map(async (delivery) => {
            try {
              // Fetch order details
              const orderResponse = await axiosSecure.get(`/api/orders/${delivery.order}`);
              const order = orderResponse.data;
              
              // Fetch customer details
              const customerResponse = await axiosSecure.get(`/api/auth/users/${order.customer}`);
              const customer = customerResponse.data;
              
              return {
                ...delivery,
                order: {
                  ...order,
                  customer: customer
                }
              };
            } catch (error) {
              console.error("Error fetching delivery details:", error);
              return delivery;
            }
          })
        );
        setDeliveries(deliveriesWithDetails);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching deliveries:", error);
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, [axiosSecure]);

  const handleUpdateStatus = async (deliveryId, newStatus) => {
    try {
      await axiosSecure.patch(`/api/deliveries/${deliveryId}`, { status: newStatus });
      // Refresh deliveries after update
      const response = await axiosSecure.get("/api/deliveries/user/deliveries");
      setDeliveries(response.data.deliveries);
    } catch (error) {
      console.error("Error updating delivery status:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not assigned";
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
        <span className="text-primary">Current</span> Deliveries
      </h1>

      {deliveries.length === 0 ? (
        <div className="text-center mt-10">
          <MdDeliveryDining className="mx-auto text-6xl text-gray-400" />
          <p className="mt-4 text-xl text-gray-600">No current deliveries at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deliveries.map((delivery) => (
            <div
              key={delivery._id}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Order #{delivery.order?._id.slice(-6) || "N/A"}</h3>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  delivery.status === "Assigned" ? "bg-blue-100 text-blue-800" :
                  delivery.status === "Out for Delivery" ? "bg-yellow-100 text-yellow-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {delivery.status}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FaUser className="text-gray-500" />
                  <span>{delivery.order?.customer?.name || "N/A"}</span>
                </div>

                <div className="flex items-center gap-2">
                  <FaPhone className="text-gray-500" />
                  <span>{delivery.order?.customer?.phone || "N/A"}</span>
                </div>

                <div className="flex items-start gap-2">
                  <FaMapMarkerAlt className="text-gray-500 mt-1" />
                  <div>
                    <p className="font-medium">Delivery Address:</p>
                    <p className="text-gray-600">
                      {delivery.order?.deliveryAddress?.street || "N/A"}, {delivery.order?.deliveryAddress?.city || "N/A"}
                    </p>
                    {delivery.order?.deliveryAddress?.instructions && (
                      <p className="text-gray-500 text-sm mt-1">
                        Instructions: {delivery.order.deliveryAddress.instructions}
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500">
                    Assigned on: {formatDate(delivery.createdAt)}
                  </p>
                </div>

                <div className="flex gap-2 mt-4">
                  {delivery.status === "Assigned" && (
                    <Button
                      className="bg-yellow-500 text-white flex-1"
                      onClick={() => handleUpdateStatus(delivery._id, "Out for Delivery")}
                    >
                      Start Delivery
                    </Button>
                  )}
                  {delivery.status === "Out for Delivery" && (
                    <Button
                      className="bg-green-500 text-white flex-1"
                      onClick={() => handleUpdateStatus(delivery._id, "Delivered")}
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

export default CurrentDeliveries;