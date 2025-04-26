import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../utils/auth";
import Scroll from "../../hooks/useScroll";
import Swal from "sweetalert2";
import storage from "../../config/firebase.init";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUpload,
  FiMapPin,
  FiClock,
  FiInfo,
  FiCheck,
  FiAlertCircle,
} from "react-icons/fi";

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
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          city
        )}`
      )
        .then((response) => response.json())
        .then((data) => {
          if (data && data[0]) {
            const { lat, lon } = data[0];
            map.setView([lat, lon], 13);
          }
        })
        .catch((error) => {
          console.error("Error geocoding city:", error);
        });
    }
  }, [city, map]);

  return position === null ? null : <Marker position={position} />;
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
  const [useUnifiedHours, setUseUnifiedHours] = useState(true);
  const [unifiedHours, setUnifiedHours] = useState({ open: "", close: "" });
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
    bankDetails: {
      bankName: "",
      accountNumber: "",
      accountHolderName: "",
      branchCode: "",
      branchName: "",
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

  const [focusedField, setFocusedField] = useState(null);
  const [formErrors, setFormErrors] = useState({});

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

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "name":
        if (!value) error = "Restaurant name is required";
        else if (value.length < 3) error = "Name must be at least 3 characters";
        break;
      case "email":
        if (!value) error = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(value)) error = "Invalid email format";
        break;
      case "phone":
        if (!value) error = "Phone number is required";
        else if (!/^\+?[\d\s-]{10,}$/.test(value))
          error = "Invalid phone number";
        break;
      case "address.street":
        if (!value) error = "Street address is required";
        break;
      case "address.city":
        if (!value) error = "City is required";
        break;
      case "bankDetails.bankName":
        if (!value) error = "Bank name is required";
        break;

      case "bankDetails.accountHolderName":
        if (!value) error = "Account holder name is required";
        break;
      case "bankDetails.branchCode":
        if (!value) error = "Branch code is required";
        else if (!/^\d{3,}$/.test(value)) error = "Invalid branch code";
        break;
      case "bankDetails.branchName":
        if (!value) error = "Branch name is required";
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validate field
    const error = validateField(name, value);
    setFormErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

    // Update form data
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

  const handleUnifiedHoursChange = (e) => {
    const { name, value } = e.target;
    setUnifiedHours((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Update all days with the unified hours
    if (useUnifiedHours) {
      const updatedBusinessHours = {};
      Object.keys(formData.businessHours).forEach((day) => {
        updatedBusinessHours[day] = {
          ...formData.businessHours[day],
          [name]: value,
        };
      });
      setFormData((prev) => ({
        ...prev,
        businessHours: updatedBusinessHours,
      }));
    }
  };

  const handleHoursToggle = () => {
    setUseUnifiedHours(!useUnifiedHours);
    if (!useUnifiedHours) {
      // Switching to unified hours - update all days with unified hours
      const updatedBusinessHours = {};
      Object.keys(formData.businessHours).forEach((day) => {
        updatedBusinessHours[day] = {
          open: unifiedHours.open,
          close: unifiedHours.close,
        };
      });
      setFormData((prev) => ({
        ...prev,
        businessHours: updatedBusinessHours,
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
      "bankDetails.bankName",
      "bankDetails.accountNumber",
      "bankDetails.accountHolderName",
      "bankDetails.branchCode",
      "bankDetails.branchName",
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
          type: "Point",
          coordinates: [selectedLocation.lng, selectedLocation.lat],
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl font-extrabold text-gray-900">
                Register Your Restaurant
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Fill in the details below to get started
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow duration-300"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <FiInfo className="mr-2" /> Basic Information
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700">
                      Restaurant Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("name")}
                      onBlur={() => setFocusedField(null)}
                      required
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 ${
                        focusedField === "name" ? "ring-2 ring-blue-500" : ""
                      }`}
                      placeholder="Enter restaurant name"
                    />
                    <AnimatePresence>
                      {formErrors["name"] && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-red-500 text-sm mt-1 flex items-center"
                        >
                          <FiAlertCircle className="mr-1" />{" "}
                          {formErrors["name"]}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700">
                      Restaurant Image <span className="text-red-500">*</span>
                      {isUploading && (
                        <span className="ml-2 text-blue-600">
                          Uploading... {uploadProgress}%
                        </span>
                      )}
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-500 transition-colors duration-200">
                      <div className="space-y-1 text-center">
                        <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                          >
                            <span>Upload a file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={(e) => setImageFile(e.target.files[0])}
                              disabled={isUploading}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    </div>
                    {formData.imageUrl && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-4"
                      >
                        <p className="text-sm text-gray-500 mb-1">Preview:</p>
                        <img
                          src={formData.imageUrl}
                          alt="Restaurant preview"
                          className="h-32 w-32 object-cover rounded-md border border-gray-200 hover:scale-105 transition-transform duration-200"
                        />
                      </motion.div>
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
                      onFocus={() => setFocusedField("description")}
                      onBlur={() => setFocusedField(null)}
                      required
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 ${
                        focusedField === "description"
                          ? "ring-2 ring-blue-500"
                          : ""
                      }`}
                      rows="3"
                      placeholder="Tell us about your restaurant..."
                    />
                  </div>
                </div>
              </motion.div>

              {/* Contact Information Section */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow duration-300"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <FiInfo className="mr-2" /> Contact Information
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("phone")}
                      onBlur={() => setFocusedField(null)}
                      required
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 ${
                        focusedField === "phone" ? "ring-2 ring-blue-500" : ""
                      }`}
                      placeholder="Enter phone number"
                    />
                    <AnimatePresence>
                      {formErrors["phone"] && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-red-500 text-sm mt-1 flex items-center"
                        >
                          <FiAlertCircle className="mr-1" />{" "}
                          {formErrors["phone"]}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      required
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 ${
                        focusedField === "email" ? "ring-2 ring-blue-500" : ""
                      }`}
                      placeholder="Enter email address"
                    />
                    <AnimatePresence>
                      {formErrors["email"] && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-red-500 text-sm mt-1 flex items-center"
                        >
                          <FiAlertCircle className="mr-1" />{" "}
                          {formErrors["email"]}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>

              {/* Address Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow duration-300"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <FiMapPin className="mr-2" /> Address Information
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
                      onFocus={() => setFocusedField("address.street")}
                      onBlur={() => setFocusedField(null)}
                      required
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 ${
                        focusedField === "address.street"
                          ? "ring-2 ring-blue-500"
                          : ""
                      }`}
                      placeholder="Enter street address"
                    />
                    <AnimatePresence>
                      {formErrors["address.street"] && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-red-500 text-sm mt-1 flex items-center"
                        >
                          <FiAlertCircle className="mr-1" />{" "}
                          {formErrors["address.street"]}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("address.city")}
                      onBlur={() => setFocusedField(null)}
                      required
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 ${
                        focusedField === "address.city"
                          ? "ring-2 ring-blue-500"
                          : ""
                      }`}
                      placeholder="Enter city"
                    />
                    <AnimatePresence>
                      {formErrors["address.city"] && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-red-500 text-sm mt-1 flex items-center"
                        >
                          <FiAlertCircle className="mr-1" />{" "}
                          {formErrors["address.city"]}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>

              {/* Location Map Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow duration-300"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <FiMapPin className="mr-2" /> Restaurant Location{" "}
                  <span className="text-red-500">*</span>
                </h3>
                <div className="h-[400px] w-full rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <MapContainer
                    center={[0, 0]}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
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
                <p className="mt-2 text-sm text-gray-500 flex items-center">
                  <FiInfo className="mr-1" /> Enter your city above and click on
                  the map to select your restaurant location
                </p>
                {selectedLocation && (
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mt-2 text-sm text-green-600 flex items-center"
                  >
                    <FiCheck className="mr-1" /> Location selected successfully!
                  </motion.p>
                )}
              </motion.div>

              {/* Business Hours Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow duration-300"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <FiClock className="mr-2" /> Business Hours
                </h3>

                {/* Hours Type Toggle */}
                <div className="mb-6">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={useUnifiedHours}
                        onChange={handleHoursToggle}
                      />
                      <div
                        className={`block w-14 h-8 rounded-full transition-colors duration-200 ${
                          useUnifiedHours ? "bg-blue-600" : "bg-gray-300"
                        }`}
                      ></div>
                      <div
                        className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200 ${
                          useUnifiedHours ? "transform translate-x-6" : ""
                        }`}
                      ></div>
                    </div>
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      {useUnifiedHours
                        ? "Same hours for all days"
                        : "Custom hours for each day"}
                    </span>
                  </label>
                </div>

                {useUnifiedHours ? (
                  // Unified Hours Input
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-4"
                  >
                    <div className="space-y-2 p-4 rounded-lg bg-white">
                      <label className="block text-sm font-medium text-gray-700">
                        Opening Time (All Days)
                      </label>
                      <input
                        type="time"
                        name="open"
                        value={unifiedHours.open}
                        onChange={handleUnifiedHoursChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2 p-4 rounded-lg bg-white">
                      <label className="block text-sm font-medium text-gray-700">
                        Closing Time (All Days)
                      </label>
                      <input
                        type="time"
                        name="close"
                        value={unifiedHours.close}
                        onChange={handleUnifiedHoursChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </motion.div>
                ) : (
                  // Custom Hours Input
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {Object.keys(formData.businessHours).map((day) => (
                      <motion.div
                        key={day}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay:
                            0.1 *
                            Object.keys(formData.businessHours).indexOf(day),
                        }}
                        className="space-y-2 p-4 rounded-lg hover:bg-white transition-colors duration-200"
                      >
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
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
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
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Bank Details Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow duration-300"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <FiInfo className="mr-2" /> Bank Details
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700">
                      Bank Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="bankDetails.bankName"
                      value={formData.bankDetails.bankName}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("bankDetails.bankName")}
                      onBlur={() => setFocusedField(null)}
                      required
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 ${
                        focusedField === "bankDetails.bankName"
                          ? "ring-2 ring-blue-500"
                          : ""
                      }`}
                      placeholder="Enter bank name"
                    />
                    <AnimatePresence>
                      {formErrors["bankDetails.bankName"] && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-red-500 text-sm mt-1 flex items-center"
                        >
                          <FiAlertCircle className="mr-1" />{" "}
                          {formErrors["bankDetails.bankName"]}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700">
                      Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="bankDetails.accountNumber"
                      value={formData.bankDetails.accountNumber}
                      onChange={handleChange}
                      onFocus={() =>
                        setFocusedField("bankDetails.accountNumber")
                      }
                      onBlur={() => setFocusedField(null)}
                      required
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 ${
                        focusedField === "bankDetails.accountNumber"
                          ? "ring-2 ring-blue-500"
                          : ""
                      }`}
                      placeholder="Enter account number"
                    />
                    <AnimatePresence>
                      {formErrors["bankDetails.accountNumber"] && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-red-500 text-sm mt-1 flex items-center"
                        >
                          <FiAlertCircle className="mr-1" />{" "}
                          {formErrors["bankDetails.accountNumber"]}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700">
                      Account Holder Name{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="bankDetails.accountHolderName"
                      value={formData.bankDetails.accountHolderName}
                      onChange={handleChange}
                      onFocus={() =>
                        setFocusedField("bankDetails.accountHolderName")
                      }
                      onBlur={() => setFocusedField(null)}
                      required
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 ${
                        focusedField === "bankDetails.accountHolderName"
                          ? "ring-2 ring-blue-500"
                          : ""
                      }`}
                      placeholder="Enter account holder name"
                    />
                    <AnimatePresence>
                      {formErrors["bankDetails.accountHolderName"] && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-red-500 text-sm mt-1 flex items-center"
                        >
                          <FiAlertCircle className="mr-1" />{" "}
                          {formErrors["bankDetails.accountHolderName"]}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700">
                      Branch Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="bankDetails.branchCode"
                      value={formData.bankDetails.branchCode}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("bankDetails.branchCode")}
                      onBlur={() => setFocusedField(null)}
                      required
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 ${
                        focusedField === "bankDetails.branchCode"
                          ? "ring-2 ring-blue-500"
                          : ""
                      }`}
                      placeholder="Enter branch code"
                    />
                    <AnimatePresence>
                      {formErrors["bankDetails.branchCode"] && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-red-500 text-sm mt-1 flex items-center"
                        >
                          <FiAlertCircle className="mr-1" />{" "}
                          {formErrors["bankDetails.branchCode"]}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="relative md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Branch Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="bankDetails.branchName"
                      value={formData.bankDetails.branchName}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("bankDetails.branchName")}
                      onBlur={() => setFocusedField(null)}
                      required
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 ${
                        focusedField === "bankDetails.branchName"
                          ? "ring-2 ring-blue-500"
                          : ""
                      }`}
                      placeholder="Enter branch name"
                    />
                    <AnimatePresence>
                      {formErrors["bankDetails.branchName"] && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-red-500 text-sm mt-1 flex items-center"
                        >
                          <FiAlertCircle className="mr-1" />{" "}
                          {formErrors["bankDetails.branchName"]}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex justify-center pt-6"
              >
                <button
                  type="submit"
                  disabled={isLoading || isUploading}
                  className={`
                    inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm
                    ${
                      isLoading || isUploading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-105 transition-all duration-200"
                    }
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
              </motion.div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RestaurantRegistration;
