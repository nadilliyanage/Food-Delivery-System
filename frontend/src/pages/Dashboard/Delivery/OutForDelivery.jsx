import React, { useEffect, useState } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { MdDeliveryDining } from "react-icons/md";
import { FaMapMarkerAlt, FaPhone, FaUser } from "react-icons/fa";
import { format } from "date-fns";
import Button from "../../../components/Button/Button";

const OutForDelivery = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const axiosSecure = useAxiosSecure();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axiosSecure.get("/api/orders/delivery/out-for-delivery");
        setOrders(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, [axiosSecure]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await axiosSecure.put(`/api/orders/${orderId}`, { status: newStatus });
      // Refresh orders after update
      const response = await axiosSecure.get("/api/orders/out-for-delivery");
      setOrders(response.data);
    } catch (error) {
      console.error("Error updating order status:", error);
    }
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
        <span className="text-primary">Out for Delivery</span> Orders
      </h1>

      {orders.length === 0 ? (
        <div className="text-center mt-10">
          <MdDeliveryDining className="mx-auto text-6xl text-gray-400" />
          <p className="mt-4 text-xl text-gray-600">No orders are out for delivery at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Order #{order._id.slice(-6)}</h3>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  {order.status}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FaUser className="text-gray-500" />
                  <span>{order.customer?.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  <FaPhone className="text-gray-500" />
                  <span>{order.customer?.phone}</span>
                </div>

                <div className="flex items-start gap-2">
                  <FaMapMarkerAlt className="text-gray-500 mt-1" />
                  <div>
                    <p className="font-medium">Delivery Address:</p>
                    <p className="text-gray-600">
                      {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                    </p>
                    {order.deliveryAddress?.instructions && (
                      <p className="text-gray-500 text-sm mt-1">
                        Instructions: {order.deliveryAddress.instructions}
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500">
                    Ordered on: {format(new Date(order.createdAt), "PPp")}
                  </p>
                  <p className="text-lg font-semibold mt-2">
                    Total: ${order.totalPrice.toFixed(2)}
                  </p>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    className="bg-green-500 text-white flex-1"
                    onClick={() => handleUpdateStatus(order._id, "Delivered")}
                  >
                    Mark as Delivered
                  </Button>
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