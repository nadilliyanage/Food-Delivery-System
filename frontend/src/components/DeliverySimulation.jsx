import React, { useState } from "react";
import axios from "axios";

const DeliverySimulation = ({ orderId, onSimulationComplete }) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState(null);

  const startSimulation = async () => {
    try {
      setIsSimulating(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        return;
      }

      // Call the simulation endpoint
      await axios.post(
        `${
          import.meta.env.VITE_API_URL
        }/api/deliveries/order/${orderId}/simulate`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (onSimulationComplete) {
        onSimulationComplete();
      }
    } catch (error) {
      console.error("Error starting simulation:", error);
      setError("Failed to start simulation");
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Delivery Simulation</h3>
        <button
          onClick={startSimulation}
          disabled={isSimulating}
          className={`px-4 py-2 rounded-md text-white ${
            isSimulating
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isSimulating ? "Simulating..." : "Start Simulation"}
        </button>
      </div>
      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
      <p className="text-sm text-gray-600">
        {isSimulating
          ? "Simulating delivery person movement from restaurant to customer..."
          : "Click to start the delivery simulation"}
      </p>
    </div>
  );
};

export default DeliverySimulation;
