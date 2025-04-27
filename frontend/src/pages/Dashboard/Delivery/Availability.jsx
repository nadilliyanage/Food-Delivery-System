import React, { useState, useEffect } from "react";
import axios from "axios";
import { MdAccessTime, MdLocationOn, MdWork } from "react-icons/md";
import Swal from "sweetalert2";

const Availability = () => {
  const [availability, setAvailability] = useState({
    isAvailable: false,
    workingHours: {
      start: "09:00",
      end: "17:00",
    },
    preferredZones: [],
    currentLocation: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:3000/api/deliveries/availability",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAvailability(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch availability settings");
      setLoading(false);
      console.error("Error fetching availability:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        "http://localhost:3000/api/deliveries/availability",
        availability,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Availability settings updated successfully",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update availability settings",
      });
      console.error("Error updating availability:", err);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Availability Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Availability Toggle */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <MdWork className="text-3xl text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Availability Status</h2>
                <p className="text-gray-600">
                  Toggle your availability for deliveries
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={availability.isAvailable}
                onChange={(e) =>
                  setAvailability({
                    ...availability,
                    isAvailable: e.target.checked,
                  })
                }
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Working Hours */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <MdAccessTime className="text-3xl text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Working Hours</h2>
              <p className="text-gray-600">Set your preferred working hours</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={availability.workingHours.start}
                onChange={(e) =>
                  setAvailability({
                    ...availability,
                    workingHours: {
                      ...availability.workingHours,
                      start: e.target.value,
                    },
                  })
                }
                className="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <input
                type="time"
                value={availability.workingHours.end}
                onChange={(e) =>
                  setAvailability({
                    ...availability,
                    workingHours: {
                      ...availability.workingHours,
                      end: e.target.value,
                    },
                  })
                }
                className="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Preferred Zones */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <MdLocationOn className="text-3xl text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                Preferred Delivery Zones
              </h2>
              <p className="text-gray-600">
                Select areas you prefer to deliver in
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {availability.preferredZones.map((zone, index) => (
              <div key={index} className="flex items-center gap-4">
                <input
                  type="text"
                  value={zone}
                  onChange={(e) => {
                    const newZones = [...availability.preferredZones];
                    newZones[index] = e.target.value;
                    setAvailability({
                      ...availability,
                      preferredZones: newZones,
                    });
                  }}
                  className="flex-1 p-2 border rounded focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Enter zone name"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newZones = availability.preferredZones.filter(
                      (_, i) => i !== index
                    );
                    setAvailability({
                      ...availability,
                      preferredZones: newZones,
                    });
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                setAvailability({
                  ...availability,
                  preferredZones: [...availability.preferredZones, ""],
                });
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Add Zone
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default Availability;
