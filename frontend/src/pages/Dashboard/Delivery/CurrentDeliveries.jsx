import React, { useEffect, useState, useRef } from "react";
import { MdDeliveryDining } from "react-icons/md";
import { FaMapMarkerAlt, FaPhone, FaUser } from "react-icons/fa";
import { format, isValid } from "date-fns";
import Button from "../../../components/Button/Button";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import L from "leaflet";
import "leaflet-routing-machine";
import Swal from "sweetalert2";

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom marker icons
const deliveryIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const driverIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Routing control component
function RoutingControl({ userLocation, deliveryLocation }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !userLocation || !deliveryLocation) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(userLocation.lat, userLocation.lng),
        L.latLng(deliveryLocation.lat, deliveryLocation.lng),
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      lineOptions: {
        styles: [{ color: "#6366f1", weight: 6 }],
      },
      createMarker: () => null, // Don't create default markers
    }).addTo(map);

    return () => map.removeControl(routingControl);
  }, [map, userLocation, deliveryLocation]);

  return null;
}

const CurrentDeliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDelivery, setActiveDelivery] = useState(() => {
    const savedActiveDelivery = localStorage.getItem("activeDelivery");
    return savedActiveDelivery ? JSON.parse(savedActiveDelivery) : null;
  });
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const watchIdRef = useRef(null);
  const mapRef = useRef(null);
  const MAX_RETRIES = 3;

  // Save active delivery to localStorage whenever it changes
  useEffect(() => {
    if (activeDelivery) {
      localStorage.setItem("activeDelivery", JSON.stringify(activeDelivery));
    } else {
      localStorage.removeItem("activeDelivery");
    }
  }, [activeDelivery]);

  // Start location tracking when page loads if there's an active delivery
  useEffect(() => {
    if (activeDelivery && activeDelivery.status === "On the Way") {
      startLocationTracking();
    }

    return () => {
      stopLocationTracking();
    };
  }, [activeDelivery]);

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        options
      );
    });
  };

  const startLocationTracking = async () => {
    if (!isTrackingLocation) {
      try {
        const location = await getLocation();
        setUserLocation(location);
        setLocationError(null);
        setRetryCount(0);
        setIsTrackingLocation(true);

        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          (error) => {
            let errorMessage = "Error tracking location: ";
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage +=
                  "Location permission denied. Please enable location services.";
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage += "Location information unavailable.";
                break;
              case error.TIMEOUT:
                errorMessage += "Location request timed out. Please try again.";
                break;
              default:
                errorMessage += error.message;
            }
            setLocationError(errorMessage);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          }
        );

        watchIdRef.current = watchId;
        return watchId;
      } catch (error) {
        if (retryCount < MAX_RETRIES) {
          setRetryCount((prev) => prev + 1);
          setTimeout(startLocationTracking, 1000);
          setLocationError(
            `Attempting to get location (${retryCount + 1}/${MAX_RETRIES})...`
          );
        } else {
          let errorMessage = "Error getting location: ";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage +=
                "Location permission denied. Please enable location services.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += "Location information unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage +=
                "Location request timed out after multiple attempts. Please check your GPS and try again.";
              break;
            default:
              errorMessage += error.message;
          }
          setLocationError(errorMessage);
        }
        return null;
      }
    }
    return watchIdRef.current;
  };

  const stopLocationTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setIsTrackingLocation(false);
      setLocationError(null);
    }
  };

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/deliveries/user/deliveries`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Fetch order and customer details for each delivery
        const deliveriesWithDetails = await Promise.all(
          response.data.deliveries.map(async (delivery) => {
            try {
              // Fetch order details
              const orderResponse = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/orders/${delivery.order}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              const order = orderResponse.data;

              // Fetch customer details
              const customerResponse = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/auth/users/${
                  order.customer
                }`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              const customer = customerResponse.data;

              return {
                ...delivery,
                order: {
                  ...order,
                  customer: customer,
                },
              };
            } catch (error) {
              console.error("Error fetching delivery details:", error);
              return delivery;
            }
          })
        );

        // Sort deliveries by createdAt date in descending order (newest first)
        const sortedDeliveries = deliveriesWithDetails.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        setDeliveries(sortedDeliveries);

        // If there's an active delivery in localStorage, verify it's still valid
        if (activeDelivery) {
          const currentActiveDelivery = sortedDeliveries.find(
            (d) => d._id === activeDelivery._id && d.status === "On the Way"
          );
          if (!currentActiveDelivery) {
            setActiveDelivery(null);
            localStorage.removeItem("activeDelivery");
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching deliveries:", error);
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, []);

  const handleUpdateStatus = async (deliveryId, newStatus) => {
    try {
      // Show confirmation dialog based on status
      const confirmTitle = newStatus === "On the Way" ? "Start Delivery?" : "Mark as Delivered?";
      const confirmText = newStatus === "On the Way" 
        ? "Are you sure you want to start this delivery? You will need to enable location services."
        : "Are you sure this delivery has been completed successfully?";
      const confirmIcon = "question";
      
      const result = await Swal.fire({
        title: confirmTitle,
        text: confirmText,
        icon: confirmIcon,
        showCancelButton: true,
        confirmButtonColor: newStatus === "On the Way" ? "#EAB308" : "#22C55E",
        cancelButtonColor: "#64748B",
        confirmButtonText: "Yes, proceed",
        cancelButtonText: "Cancel"
      });
      
      if (!result.isConfirmed) {
        return; // User cancelled the action
      }
      
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      // Only require location for "On the Way" status
      if (newStatus === "On the Way") {
        if (!userLocation) {
          setRetryCount(0);
          const watchId = await startLocationTracking();
          if (!watchId) {
            throw new Error(
              "Unable to get location. Please ensure location services are enabled."
            );
          }
        }
      } else if (newStatus === "Delivered") {
        stopLocationTracking();
        setActiveDelivery(null);
      }

      // Update delivery status using the correct endpoint
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/deliveries/${deliveryId}/status`,
        { status: newStatus },
        config
      );

      // Update local state with the response
      const updatedDelivery = response.data;
      
      // If marking as delivered, also update the order status
      if (newStatus === "Delivered") {
        const delivery = deliveries.find(d => d._id === deliveryId);
        if (delivery && delivery.order && delivery.order._id) {
          try {
            // Update the order status to "Delivered"
            await axios.patch(
              `${import.meta.env.VITE_API_URL}/api/orders/${delivery.order._id}`,
              { status: "Delivered" },
              config
            );
            console.log("Order status updated to Delivered successfully");
          } catch (orderError) {
            console.error("Error updating order status:", orderError);
            // Continue with the delivery status update even if order update fails
          }
        }
      }
      
      setDeliveries((prevDeliveries) =>
        prevDeliveries.map((delivery) =>
          delivery._id === deliveryId
            ? { ...delivery, status: newStatus }
            : delivery
        )
      );

      if (newStatus === "On the Way") {
        const delivery = deliveries.find((d) => d._id === deliveryId);
        if (delivery) {
          setActiveDelivery(delivery);
        }
      }

      // Show success message
      Swal.fire({
        icon: "success",
        title: "Success",
        text: `Delivery status updated to ${newStatus}`,
        confirmButtonColor: "#000",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Error updating delivery status:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to update delivery status",
        confirmButtonColor: "#000",
      });
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

  const deliveryLocation =
    activeDelivery?.order?.deliveryAddress?.latitude &&
    activeDelivery?.order?.deliveryAddress?.longitude
      ? {
          lat: activeDelivery.order.deliveryAddress.latitude,
          lng: activeDelivery.order.deliveryAddress.longitude,
        }
      : null;

  const mapCenter = deliveryLocation ||
    userLocation || { lat: 6.927079, lng: 79.861244 }; // Default to Colombo

  return (
    <div className="px-4 sm:px-0">
      <h1 className="text-center text-4xl font-bold my-7">
        <span className="text-primary">Current</span> Deliveries
      </h1>

      {locationError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {locationError}
        </div>
      )}

      {deliveries.length === 0 ? (
        <div className="text-center mt-10">
          <MdDeliveryDining className="mx-auto text-6xl text-gray-400" />
          <p className="mt-4 text-xl text-gray-600">
            No current deliveries at the moment.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {deliveries.map((delivery) => (
            <div
              key={delivery._id}
              className={`bg-white rounded-lg shadow-md p-6 border-2 ${
                activeDelivery?._id === delivery._id
                  ? "border-primary"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">
                  Order #{delivery.order?._id.slice(-6) || "N/A"}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    delivery.status === "Assigned"
                      ? "bg-blue-100 text-blue-800"
                      : delivery.status === "On the Way"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
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
                      {delivery.order?.deliveryAddress?.street || "N/A"},{" "}
                      {delivery.order?.deliveryAddress?.city || "N/A"}
                    </p>
                    {delivery.order?.deliveryAddress?.instructions && (
                      <p className="text-gray-500 text-sm mt-1">
                        Instructions:{" "}
                        {delivery.order.deliveryAddress.instructions}
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500">
                    Assigned on: {formatDate(delivery.createdAt)}
                  </p>
                </div>

                {/* Map Section - Only show for active delivery */}
                {activeDelivery?._id === delivery._id &&
                  delivery.status === "On the Way" && (
                    <div className="mt-4">
                      <div className="w-full h-[300px] rounded-lg overflow-hidden">
                        <MapContainer
                          center={[mapCenter.lat, mapCenter.lng]}
                          zoom={13}
                          style={{
                            height: "100%",
                            width: "100%",
                            borderRadius: "0.5rem",
                          }}
                          ref={mapRef}
                        >
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          />

                          {userLocation && (
                            <Marker
                              position={[userLocation.lat, userLocation.lng]}
                              icon={driverIcon}
                            >
                              <Popup>
                                <div>
                                  <p className="font-semibold">Your Location</p>
                                </div>
                              </Popup>
                            </Marker>
                          )}

                          {deliveryLocation && (
                            <Marker
                              position={[
                                deliveryLocation.lat,
                                deliveryLocation.lng,
                              ]}
                              icon={deliveryIcon}
                            >
                              <Popup>
                                <div>
                                  <p className="font-semibold">
                                    {activeDelivery.order.customer.name}
                                  </p>
                                  <p>
                                    {
                                      activeDelivery.order.deliveryAddress
                                        .street
                                    }
                                  </p>
                                  <p>
                                    {activeDelivery.order.deliveryAddress.city}
                                  </p>
                                </div>
                              </Popup>
                            </Marker>
                          )}

                          {userLocation && deliveryLocation && (
                            <RoutingControl
                              userLocation={userLocation}
                              deliveryLocation={deliveryLocation}
                            />
                          )}
                        </MapContainer>
                      </div>
                    </div>
                  )}

                <div className="flex gap-2 mt-4">
                  {delivery.status === "Assigned" && (
                    <Button
                      className="bg-yellow-500 text-white flex-1"
                      onClick={() =>
                        handleUpdateStatus(delivery._id, "On the Way")
                      }
                    >
                      Start Delivery
                    </Button>
                  )}
                  {delivery.status === "On the Way" && (
                    <Button
                      className="bg-green-500 text-white flex-1"
                      onClick={() =>
                        handleUpdateStatus(delivery._id, "Delivered")
                      }
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
