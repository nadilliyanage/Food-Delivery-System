import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../utils/auth";
import Scroll from "../../hooks/useScroll";
import Swal from "sweetalert2";
import storage from "../../config/firebase.init";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default marker icon in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Component to handle map clicks and city changes
const LocationMarker = ({ onLocationSelect, city }) => {
  const [position, setPosition] = useState(null);
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onLocationSelect({ lat, lng });
    },
  });

  // Effect to handle city changes
  useEffect(() => {
    if (city) {
      // Use Nominatim API for geocoding
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`)
        .then(response => response.json())
        .then(data => {
          if (data && data[0]) {
            const { lat, lon } = data[0];
            map.setView([lat, lon], 13);
          }
        })
        .catch(error => {
          console.error('Error geocoding city:', error);
        });
    }
  }, [city, map]);

  return position === null ? null : (
    <Marker position={position} />
  );
};

const RestaurantRegistration = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [hasCheckedRegistration, setHasCheckedRegistration] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [formData, setFormData] = useState({
    imageUrl: "",
    name: "",
    description: "",
    phone: "",
    email: "",
    address: {
      street: "",
      city: "",
    },
    businessHours: {
      monday: { open: "", close: "" },
      tuesday: { open: "", close: "" },
      wednesday: { open: "", close: "" },
      thursday: { open: "", close: "" },
      friday: { open: "", close: "" },
      saturday: { open: "", close: "" },
      sunday: { open: "", close: "" },
    },
  });

  useEffect(() => {
    if (user && !hasCheckedRegistration) {
      checkExistingRegistration();
      setHasCheckedRegistration(true);
    }
  }, [user, hasCheckedRegistration]);

  useEffect(() => {
    if (imageFile) {
      uploadImage(imageFile);
    }
  }, [imageFile]);

  const uploadImage = async (file) => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const storageRef = ref(
      storage,
      `restaurants/${new Date().getTime()}_${file.name}`
    );
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(Math.round(progress));
      },
      (error) => {
        console.error("Upload failed:", error);
        Swal.fire({
          title: "Upload Error",
          text: "Failed to upload image. Please try again.",
          icon: "error",
        });
        setIsUploading(false);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setFormData((prev) => ({
            ...prev,
            imageUrl: downloadURL,
          }));
        } catch (error) {
          console.error("Error getting download URL:", error);
        } finally {
          setIsUploading(false);
        }
      }
    );
  };

  const checkExistingRegistration = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:3000/api/restaurants/user/restaurants",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const latestRegistration = data[0];

        if (latestRegistration.registrationStatus === "pending") {
          Swal.fire({
            title: "Pending Registration",
            text: "You already have a pending restaurant registration. Please wait for admin approval.",
            icon: "info",
            confirmButtonText: "OK",
          }).then(() => {
            navigate("/");
          });
        } else if (latestRegistration.registrationStatus === "rejected") {
          Swal.fire({
            title: "Previous Registration Rejected",
            text: "Your previous registration was rejected. Would you like to submit a new registration?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, submit new",
            cancelButtonText: "No, go back",
          }).then((result) => {
            if (!result.isConfirmed) {
              navigate("/");
            }
          });
        } else if (latestRegistration.registrationStatus === "approved") {
          Swal.fire({
            title: "Already Registered",
            text: "You already have an approved restaurant. Would you like to submit a registration for another restaurant?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, register another",
            cancelButtonText: "No, go back",
          }).then((result) => {
            if (!result.isConfirmed) {
              navigate("/");
            }
          });
        }
      }
    } catch (error) {
      console.error("Error checking registration:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else if (name.includes("businessHours")) {
      const [_, day, time] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        businessHours: {
          ...prev.businessHours,
          [day]: {
            ...prev.businessHours[day],
            [time]: value,
          },
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleMapClick = (location) => {
    setSelectedLocation(location);
  };

  const validateForm = () => {
    const requiredFields = [
      "name",
      "description",
      "phone",
      "email",
      "address.street",
      "address.city",
    ];

    const missingFields = requiredFields.filter((field) => {
      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        return !formData[parent]?.[child];
      }
      return !formData[field];
    });

    if (missingFields.length > 0) {
      Swal.fire({
        title: "Missing Information",
        text: `Please fill in all required fields: ${missingFields.join(", ")}`,
        icon: "warning",
      });
      return false;
    }

    if (!selectedLocation) {
      Swal.fire({
        title: "Location Required",
        text: "Please select your restaurant location on the map",
        icon: "warning",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isUploading) {
      Swal.fire({
        title: "Upload in Progress",
        text: "Please wait for the image to finish uploading",
        icon: "warning",
      });
      return;
    }

    setIsLoading(true);
    try {
      const formattedBusinessHours = {};
      Object.keys(formData.businessHours).forEach((day) => {
        formattedBusinessHours[day] = {
          open: formData.businessHours[day].open || "",
          close: formData.businessHours[day].close || "",
        };
      });

      const restaurantData = {
        ...formData,
        location: {
          type: 'Point',
          coordinates: [selectedLocation.lng, selectedLocation.lat]
        },
        businessHours: formattedBusinessHours,
      };

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        "http://localhost:3000/api/restaurants/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(restaurantData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          title: "Success!",
          text: "Registration submitted successfully! We will review your application.",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          navigate("/");
        });
      } else {
        throw new Error(
          data.message || "Registration failed. Please try again."
        );
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        title: "Error!",
        text: error.message || "An error occurred. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <Scroll />
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                Please Log In
              </h2>
              <p className="text-gray-600 mb-6">
                You need to be logged in to register your restaurant.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 mt-6">
      <Scroll />
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-gray-900">
                Register Your Restaurant
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Fill in the details below to get started
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Restaurant Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                      placeholder="Enter restaurant name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Restaurant Image <span className="text-red-500">*</span>
                      {isUploading && (
                        <span className="ml-2 text-blue-600">
                          Uploading... {uploadProgress}%
                        </span>
                      )}
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      className="mt-1 block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                      onChange={(e) => setImageFile(e.target.files[0])}
                      disabled={isUploading}
                    />
                    {formData.imageUrl && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-500 mb-1">Preview:</p>
                        <img
                          src={formData.imageUrl}
                          alt="Restaurant preview"
                          className="h-32 w-32 object-cover rounded-md border border-gray-200"
                        />
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                      rows="3"
                      placeholder="Tell us about your restaurant..."
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Address Information
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                      placeholder="Enter street address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                      placeholder="Enter city"
                    />
                  </div>
                </div>
              </div>

              {/* Location Map Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Restaurant Location <span className="text-red-500">*</span>
                </h3>
                <div className="h-[400px] w-full rounded-lg overflow-hidden">
                  <MapContainer
                    center={[0, 0]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <LocationMarker 
                      onLocationSelect={handleMapClick} 
                      city={formData.address.city}
                    />
                  </MapContainer>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Enter your city above and click on the map to select your restaurant location
                </p>
              </div>

              {/* Business Hours Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Business Hours
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {Object.keys(formData.businessHours).map((day) => (
                    <div key={day} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 capitalize">
                        {day}
                      </label>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">
                            Opening Time
                          </label>
                          <input
                            type="time"
                            name={`businessHours.${day}.open`}
                            value={formData.businessHours[day].open}
                            onChange={handleChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">
                            Closing Time
                          </label>
                          <input
                            type="time"
                            name={`businessHours.${day}.close`}
                            value={formData.businessHours[day].close}
                            onChange={handleChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center pt-6">
                <button
                  type="submit"
                  disabled={isLoading || isUploading}
                  className={`
                    inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm
                    ${
                      isLoading || isUploading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    }
                    transition-colors duration-200
                  `}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Submitting...
                    </>
                  ) : isUploading ? (
                    "Uploading Image..."
                  ) : (
                    "Submit Registration"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantRegistration;
