// EditRequestModal.js
import React, { useState, useEffect } from "react";

const EditRequestModal = ({ isOpen, onClose, request, onUpdate }) => {
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  // Example types; you can modify this list based on your application
  const requestTypes = [
    "Bulk Waste",
    "E Waste",
    "Hazardous Waste",
    "Other Special Waste",
  ];

  useEffect(() => {
    if (request) {
      setType(request.type);
      setDescription(request.description);
      const formattedDate = request.date
        ? new Date(request.date).toISOString().split("T")[0]
        : "";
      setDate(formattedDate);
      setTime(request.time);
    }
  }, [request]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedRequest = { ...request, type, date, description, time };
    onUpdate(updatedRequest);
    onClose();
  };

  if (!isOpen) return null;

  // Check if request is null and return a fallback UI
  if (!request) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">No request selected!</h2>
          <button className="bg-gray-300 rounded px-4 py-2" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Edit Garbage Request</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Type:</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="border rounded p-2 w-full"
              required
            >
              <option value="" disabled>
                Select type
              </option>
              {requestTypes.map((requestType, index) => (
                <option key={index} value={requestType}>
                  {requestType}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Description:
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border rounded p-2 w-full"
              required
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Pickup Date:
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded p-2 w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Pickup Time:
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)} // Update the correct state here
              className="border rounded p-2 w-full"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              className="mr-4 bg-gray-300 rounded px-4 py-2"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white rounded px-4 py-2"
            >
              Update Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRequestModal;
