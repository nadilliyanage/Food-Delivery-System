import React, { useEffect, useState } from "react";
import axios from "axios";

const DeliveryLocationTracker = ({ orderId, onLocationUpdate }) => {
  const [error, setError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState(null);

  const updateLocation = async (latitude, longitude) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        return;
      }

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/deliveries/update-location`,
        {
          orderId,
          location: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Notify parent component of location update
      if (onLocationUpdate) {
        onLocationUpdate([longitude, latitude]);
      }
    } catch (error) {
      console.error("Error updating location:", error);
      setError("Failed to update location");
    }
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setIsTracking(true);
    const id = navigator.geolocation.watchPosition(
      (position) => {
        updateLocation(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error("Error getting location:", error);
        setError("Error getting location");
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
    setWatchId(id);
  };

  const stopTracking = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
  };

  useEffect(() => {
    // Start tracking when component mounts
    startTracking();

    // Cleanup when component unmounts
    return () => {
      stopTracking();
    };
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Location Tracking</h3>
        <button
          onClick={isTracking ? stopTracking : startTracking}
          className={`px-4 py-2 rounded-md text-white ${
            isTracking
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {isTracking ? "Stop Tracking" : "Start Tracking"}
        </button>
      </div>
      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
      <p className="text-sm text-gray-600">
        {isTracking
          ? "Your location is being tracked and shared with the customer"
          : "Location tracking is paused"}
      </p>
    </div>
  );
};

export default DeliveryLocationTracker;
