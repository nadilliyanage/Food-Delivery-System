import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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

const RestaurantRequestTable = () => {
  const [restaurants, setRestaurants] = useState({
    pending: [],
    approved: [],
    rejected: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    fetchRestaurants(true);
  }, []);

  const fetchRestaurants = async (fetchAll = false) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (fetchAll) {
        const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
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
            }/api/restaurants/admin/approved-registrations`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          axios.get(
            `${
              import.meta.env.VITE_API_URL
            }/api/restaurants/admin/rejected-registrations`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
        ]);

        setRestaurants({
          pending: pendingRes.data,
          approved: approvedRes.data,
          rejected: rejectedRes.data,
        });
      } else {
        let endpoint = "";
        switch (activeTab) {
          case "pending":
            endpoint = `${
              import.meta.env.VITE_API_URL
            }/api/restaurants/admin/pending-registrations`;
            break;
          case "approved":
            endpoint = `${
              import.meta.env.VITE_API_URL
            }/api/restaurants/admin/approved-registrations`;
            break;
          case "rejected":
            endpoint = `${
              import.meta.env.VITE_API_URL
            }/api/restaurants/admin/rejected-registrations`;
            break;
          default:
            endpoint = `${
              import.meta.env.VITE_API_URL
            }/api/restaurants/admin/pending-registrations`;
        }

        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setRestaurants((prev) => ({
          ...prev,
          [activeTab]: response.data,
        }));
      }

      setLoading(false);
    } catch (err) {
      setError(`Failed to fetch ${fetchAll ? "all" : activeTab} restaurants`);
      setLoading(false);
      console.error("Error fetching restaurants:", err);
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchRestaurants(false);
    }
  }, [activeTab]);

  const handleStatusUpdate = async (restaurantId, status) => {
    try {
      const token = localStorage.getItem("token");
      const confirmText =
        status === "approved"
          ? "approve"
          : status === "rejected"
          ? "reject"
          : status === "pending"
          ? "move back to pending"
          : "decline";

      const result = await Swal.fire({
        title: "Are you sure?",
        text: `Do you want to ${confirmText} this restaurant?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor:
          status === "approved"
            ? "#22c55e"
            : status === "rejected"
            ? "#ef4444"
            : "#3b82f6",
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

      await fetchRestaurants(true);
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

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    document.body.style.overflow = "hidden";
  };

  // Function to search for locations in Sri Lanka
  const searchLocation = async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    try {
      // Add Sri Lanka to the search query and use Nominatim API
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query + ", Sri Lanka"
        )}&countrycodes=lk&limit=5`,
        {
          headers: {
            "Accept-Language": "en",
          },
        }
      );

      setSearchResults(response.data);
    } catch (error) {
      console.error("Error searching location:", error);
      setSearchResults([]);
    }
  };

  // Debounce the search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchLocation(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const tabs = [
    {
      id: "pending",
      label: "Pending Requests",
      count: restaurants.pending.length,
    },
    {
      id: "approved",
      label: "Approved Requests",
      count: restaurants.approved.length,
    },
    {
      id: "rejected",
      label: "Rejected Requests",
      count: restaurants.rejected.length,
    },
  ];

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        Restaurant Registration Requests
      </h1>

      {/* Tabs */}
      <div className="flex space-x-4 mb-8 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-semibold rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? "bg-blue-500 text-white"
                : "text-gray-600 hover:text-blue-500"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Content */}
      {restaurants[activeTab].length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500">No {activeTab} registration requests</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {restaurants[activeTab].map((restaurant) => (
            <div
              key={restaurant._id}
              className="bg-white rounded-lg shadow-md p-6"
            >
              {/* Image with click-to-enlarge functionality */}
              {restaurant.imageUrl && (
                <div className="mb-4 relative group">
                  <div
                    className="w-full h-48 overflow-hidden rounded-md cursor-pointer relative"
                    onClick={() => handleImageClick(restaurant.imageUrl)}
                  >
                    <img
                      src={restaurant.imageUrl}
                      alt={restaurant.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all duration-300">
                      <span className="text-white font-medium text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to enlarge
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <h2 className="text-xl font-semibold mb-2">{restaurant.name}</h2>
              <div className="space-y-2 text-gray-600">
                <p>
                  <span className="font-medium">Phone:</span> {restaurant.phone}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {restaurant.email}
                </p>
                <p>
                  <span className="font-medium">Address:</span>{" "}
                  {restaurant.address.street}, {restaurant.address.city},{" "}
                  {restaurant.address.state} {restaurant.address.zipCode}
                </p>
                <p className="mt-4">
                  <span className="font-medium">Description:</span>{" "}
                  {restaurant.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-4">
                {activeTab === "pending" && (
                  <>
                    <button
                      onClick={() =>
                        handleStatusUpdate(restaurant._id, "approved")
                      }
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() =>
                        handleStatusUpdate(restaurant._id, "rejected")
                      }
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                    >
                      Reject
                    </button>
                  </>
                )}
                {activeTab === "approved" && (
                  <>
                    <button
                      onClick={() =>
                        handleStatusUpdate(restaurant._id, "pending")
                      }
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                      Back to Pending
                    </button>
                    <button
                      onClick={() =>
                        handleStatusUpdate(restaurant._id, "rejected")
                      }
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                    >
                      Decline
                    </button>
                  </>
                )}
                {activeTab === "rejected" && (
                  <>
                    <button
                      onClick={() =>
                        handleStatusUpdate(restaurant._id, "pending")
                      }
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                      Back to Pending
                    </button>
                    <button
                      onClick={() =>
                        handleStatusUpdate(restaurant._id, "approved")
                      }
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                    >
                      Approve
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedLocation(restaurant.location)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  View Location
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[1000] p-4"
          onClick={() => {
            setSelectedImage(null);
            document.body.style.overflow = "auto";
          }}
        >
          <div className="relative w-full h-full max-w-6xl max-h-screen flex items-center justify-center">
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
                document.body.style.overflow = "auto";
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="w-full h-full flex items-center justify-center p-4">
              <img
                src={selectedImage}
                alt="Enlarged restaurant preview"
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      )}

      {/* Location Map Modal */}
      {selectedLocation && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[1000] p-4"
          onClick={() => {
            setSelectedLocation(null);
            document.body.style.overflow = "auto";
          }}
        >
          <div className="relative w-full h-full max-w-6xl max-h-screen flex items-center justify-center">
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedLocation(null);
                document.body.style.overflow = "auto";
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="w-full h-full flex items-center justify-center p-4">
              <div className="w-full h-full bg-white rounded-lg overflow-hidden">
                {/* Location Search */}
                <div className="absolute top-4 left-4 z-[1000] w-96">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for a location in Sri Lanka..."
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {searchResults.length > 0 && (
                    <div className="mt-2 bg-white rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {searchResults.map((result) => (
                        <div
                          key={result.place_id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setSelectedLocation({
                              type: "Point",
                              coordinates: [
                                parseFloat(result.lon),
                                parseFloat(result.lat),
                              ],
                            });
                            setSearchQuery("");
                            setSearchResults([]);
                          }}
                        >
                          {result.display_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <MapContainer
                  center={[
                    selectedLocation.coordinates[1],
                    selectedLocation.coordinates[0],
                  ]}
                  zoom={15}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker
                    position={[
                      selectedLocation.coordinates[1],
                      selectedLocation.coordinates[0],
                    ]}
                  >
                    <Popup>Restaurant Location</Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantRequestTable;
