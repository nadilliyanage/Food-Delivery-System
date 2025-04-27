import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import storage from "../../../config/firebase.init";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { FaArrowLeft } from "react-icons/fa";
import { FiClock } from "react-icons/fi";

const EditRestaurant = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [useUnifiedHours, setUseUnifiedHours] = useState(true);
  const [unifiedHours, setUnifiedHours] = useState({ open: "", close: "" });
  const [restaurant, setRestaurant] = useState({
    name: "",
    description: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    phone: "",
    email: "",
    imageUrl: "",
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

  useEffect(() => {
    fetchRestaurant();
  }, [restaurantId]);

  useEffect(() => {
    if (imageFile) {
      uploadImage(imageFile);
    }
  }, [imageFile]);

  const fetchRestaurant = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/restaurants/${restaurantId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Log the response data to check bank details
      console.log("Restaurant data:", response.data);

      // Initialize restaurant data with proper bank details
      const restaurantData = {
        ...response.data,
        bankDetails: {
          bankName: response.data.bankDetails?.bankName || "",
          accountNumber: response.data.bankDetails?.accountNumber || "",
          accountHolderName: response.data.bankDetails?.accountHolderName || "",
          branchCode: response.data.bankDetails?.branchCode || "",
          branchName: response.data.bankDetails?.branchName || "",
        },
      };

      console.log("Processed restaurant data:", restaurantData);
      setRestaurant(restaurantData);

      // Check if all days have the same hours
      const businessHours = response.data.businessHours;
      if (businessHours) {
        const days = Object.keys(businessHours);
        const firstDay = days[0];
        const firstHours = businessHours[firstDay];
        const allSameHours = days.every(
          (day) =>
            businessHours[day].open === firstHours.open &&
            businessHours[day].close === firstHours.close
        );

        setUseUnifiedHours(allSameHours);
        if (allSameHours) {
          setUnifiedHours({
            open: firstHours.open,
            close: firstHours.close,
          });
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching restaurant:", error);
      setError("Failed to fetch restaurant details. Please try again.");
      setLoading(false);
    }
  };

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
          setRestaurant((prev) => ({
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
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
      Object.keys(restaurant.businessHours).forEach((day) => {
        updatedBusinessHours[day] = {
          ...restaurant.businessHours[day],
          [name]: value,
        };
      });
      setRestaurant((prev) => ({
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
      Object.keys(restaurant.businessHours).forEach((day) => {
        updatedBusinessHours[day] = {
          open: unifiedHours.open,
          close: unifiedHours.close,
        };
      });
      setRestaurant((prev) => ({
        ...prev,
        businessHours: updatedBusinessHours,
      }));
    }
  };

  const handleBusinessHoursChange = (e) => {
    const { name, value } = e.target;
    const [_, day, time] = name.split(".");
    setRestaurant((prev) => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [time]: value,
        },
      },
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!restaurant.name.trim()) errors.name = "Name is required";
    if (!restaurant.description.trim())
      errors.description = "Description is required";
    if (!restaurant.address.street.trim())
      errors.street = "Street address is required";
    if (!restaurant.address.city.trim()) errors.city = "City is required";
    if (!restaurant.phone.trim()) errors.phone = "Phone number is required";
    if (!restaurant.email.trim()) errors.email = "Email is required";
    if (!restaurant.bankDetails.bankName.trim())
      errors.bankName = "Bank name is required";
    if (!restaurant.bankDetails.accountNumber.trim())
      errors.accountNumber = "Account number is required";
    if (!restaurant.bankDetails.accountHolderName.trim())
      errors.accountHolderName = "Account holder name is required";
    if (!restaurant.bankDetails.branchCode.trim())
      errors.branchCode = "Branch code is required";
    if (!restaurant.bankDetails.branchName.trim())
      errors.branchName = "Branch name is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      console.log("Sending update data:", restaurant);

      // Ensure all required fields are present
      const updateData = {
        name: restaurant.name,
        description: restaurant.description,
        phone: restaurant.phone,
        email: restaurant.email,
        address: {
          street: restaurant.address.street,
          city: restaurant.address.city,
          state: restaurant.address.state,
          zipCode: restaurant.address.zipCode,
          country: restaurant.address.country,
        },
        bankDetails: {
          bankName: restaurant.bankDetails.bankName,
          accountNumber: restaurant.bankDetails.accountNumber,
          accountHolderName: restaurant.bankDetails.accountHolderName,
          branchCode: restaurant.bankDetails.branchCode,
          branchName: restaurant.bankDetails.branchName,
        },
        businessHours: restaurant.businessHours,
        imageUrl: restaurant.imageUrl,
      };

      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/restaurants/${restaurantId}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Update response:", response.data);

      if (response.data) {
        await Swal.fire({
          title: "Success!",
          text: "Restaurant updated successfully",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
        });
        navigate("/dashboard/manage-restaurants");
      }
    } catch (error) {
      console.error("Error updating restaurant:", error);
      console.error("Error details:", error.response?.data);
      Swal.fire({
        title: "Error!",
        text:
          error.response?.data?.message ||
          "Failed to update restaurant. Please try again.",
        icon: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold mb-2">{error}</p>
          <button
            onClick={fetchRestaurant}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate("/dashboard/manage-restaurants")}
          className="text-primary hover:text-primary-dark mb-4 flex items-center transition-colors duration-200"
        >
          <FaArrowLeft className="h-5 w-5 mr-2" />
          Back to Restaurants
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Edit Restaurant
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-md transform transition-all duration-300 hover:shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Basic Information
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 group">
                    <span className="flex items-center">
                      <span className="mr-2">Name</span>
                      {formErrors.name && (
                        <span className="text-red-500 text-xs animate-fade-in">
                          *
                        </span>
                      )}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={restaurant.name}
                    onChange={(e) => {
                      setRestaurant({ ...restaurant, name: e.target.value });
                      if (formErrors.name)
                        setFormErrors({ ...formErrors, name: "" });
                    }}
                    className={`mt-1 block w-full rounded-md border-2 px-4 py-2 shadow-sm transition-all duration-200
                      ${
                        formErrors.name
                          ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                          : "border-gray-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 group">
                    <span className="flex items-center">
                      <span className="mr-2">Description</span>
                      {formErrors.description && (
                        <span className="text-red-500 text-xs animate-fade-in">
                          *
                        </span>
                      )}
                    </span>
                  </label>
                  <textarea
                    value={restaurant.description}
                    onChange={(e) => {
                      setRestaurant({
                        ...restaurant,
                        description: e.target.value,
                      });
                      if (formErrors.description)
                        setFormErrors({ ...formErrors, description: "" });
                    }}
                    className={`mt-1 block w-full rounded-md border-2 px-4 py-2 shadow-sm transition-all duration-200
                      ${
                        formErrors.description
                          ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                          : "border-gray-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      }`}
                    rows="3"
                    required
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Contact Information
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 group">
                    <span className="flex items-center">
                      <span className="mr-2">Phone</span>
                      {formErrors.phone && (
                        <span className="text-red-500 text-xs animate-fade-in">
                          *
                        </span>
                      )}
                    </span>
                  </label>
                  <input
                    type="tel"
                    value={restaurant.phone}
                    onChange={(e) => {
                      setRestaurant({ ...restaurant, phone: e.target.value });
                      if (formErrors.phone)
                        setFormErrors({ ...formErrors, phone: "" });
                    }}
                    className={`mt-1 block w-full rounded-md border-2 px-4 py-2 shadow-sm transition-all duration-200
                      ${
                        formErrors.phone
                          ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                          : "border-gray-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 group">
                    <span className="flex items-center">
                      <span className="mr-2">Email</span>
                      {formErrors.email && (
                        <span className="text-red-500 text-xs animate-fade-in">
                          *
                        </span>
                      )}
                    </span>
                  </label>
                  <input
                    type="email"
                    value={restaurant.email}
                    onChange={(e) => {
                      setRestaurant({ ...restaurant, email: e.target.value });
                      if (formErrors.email)
                        setFormErrors({ ...formErrors, email: "" });
                    }}
                    className={`mt-1 block w-full rounded-md border-2 px-4 py-2 shadow-sm transition-all duration-200
                      ${
                        formErrors.email
                          ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                          : "border-gray-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      }`}
                    required
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4 md:col-span-2">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Address Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 group">
                      <span className="flex items-center">
                        <span className="mr-2">Street</span>
                        {formErrors.street && (
                          <span className="text-red-500 text-xs animate-fade-in">
                            *
                          </span>
                        )}
                      </span>
                    </label>
                    <input
                      type="text"
                      value={restaurant.address.street}
                      onChange={(e) => {
                        setRestaurant({
                          ...restaurant,
                          address: {
                            ...restaurant.address,
                            street: e.target.value,
                          },
                        });
                        if (formErrors.street)
                          setFormErrors({ ...formErrors, street: "" });
                      }}
                      className={`mt-1 block w-full rounded-md border-2 px-4 py-2 shadow-sm transition-all duration-200
                        ${
                          formErrors.street
                            ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                            : "border-gray-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        }`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 group">
                      <span className="flex items-center">
                        <span className="mr-2">City</span>
                        {formErrors.city && (
                          <span className="text-red-500 text-xs animate-fade-in">
                            *
                          </span>
                        )}
                      </span>
                    </label>
                    <input
                      type="text"
                      value={restaurant.address.city}
                      onChange={(e) => {
                        setRestaurant({
                          ...restaurant,
                          address: {
                            ...restaurant.address,
                            city: e.target.value,
                          },
                        });
                        if (formErrors.city)
                          setFormErrors({ ...formErrors, city: "" });
                      }}
                      className={`mt-1 block w-full rounded-md border-2 px-4 py-2 shadow-sm transition-all duration-200
                        ${
                          formErrors.city
                            ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                            : "border-gray-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        }`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 group">
                      <span className="flex items-center">
                        <span className="mr-2">State</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      value={restaurant.address.state}
                      onChange={(e) => {
                        setRestaurant({
                          ...restaurant,
                          address: {
                            ...restaurant.address,
                            state: e.target.value,
                          },
                        });
                      }}
                      className="mt-1 block w-full rounded-md border-2 px-4 py-2 shadow-sm transition-all duration-200 border-gray-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 group">
                      <span className="flex items-center">
                        <span className="mr-2">Zip Code</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      value={restaurant.address.zipCode}
                      onChange={(e) => {
                        setRestaurant({
                          ...restaurant,
                          address: {
                            ...restaurant.address,
                            zipCode: e.target.value,
                          },
                        });
                      }}
                      className="mt-1 block w-full rounded-md border-2 px-4 py-2 shadow-sm transition-all duration-200 border-gray-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 group">
                      <span className="flex items-center">
                        <span className="mr-2">Country</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      value={restaurant.address.country}
                      onChange={(e) => {
                        setRestaurant({
                          ...restaurant,
                          address: {
                            ...restaurant.address,
                            country: e.target.value,
                          },
                        });
                      }}
                      className="mt-1 block w-full rounded-md border-2 px-4 py-2 shadow-sm transition-all duration-200 border-gray-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-4 md:col-span-2">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Restaurant Image
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image
                  </label>
                  <div className="mt-1 flex items-center space-x-4">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary transition-all duration-200">
                      <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-4 rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                        Choose Image
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                    {isUploading && (
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-primary h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Uploading: {uploadProgress}%
                        </p>
                      </div>
                    )}
                  </div>
                  {restaurant.imageUrl && (
                    <div className="mt-4 relative group">
                      <img
                        src={restaurant.imageUrl}
                        alt="Preview"
                        className="h-48 w-full object-cover rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bank Details Section */}
              <div className="space-y-4 md:col-span-2">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Bank Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 group">
                      <span className="flex items-center">
                        <span className="mr-2">Bank Name</span>
                        {formErrors.bankName && (
                          <span className="text-red-500 text-xs animate-fade-in">
                            *
                          </span>
                        )}
                      </span>
                    </label>
                    <input
                      type="text"
                      value={restaurant.bankDetails.bankName}
                      onChange={(e) => {
                        setRestaurant({
                          ...restaurant,
                          bankDetails: {
                            ...restaurant.bankDetails,
                            bankName: e.target.value,
                          },
                        });
                        if (formErrors.bankName)
                          setFormErrors({ ...formErrors, bankName: "" });
                      }}
                      className={`mt-1 block w-full rounded-md border-2 px-4 py-2 shadow-sm transition-all duration-200
                        ${
                          formErrors.bankName
                            ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                            : "border-gray-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        }`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 group">
                      <span className="flex items-center">
                        <span className="mr-2">Account Number</span>
                        {formErrors.accountNumber && (
                          <span className="text-red-500 text-xs animate-fade-in">
                            *
                          </span>
                        )}
                      </span>
                    </label>
                    <input
                      type="text"
                      value={restaurant.bankDetails.accountNumber}
                      onChange={(e) => {
                        setRestaurant({
                          ...restaurant,
                          bankDetails: {
                            ...restaurant.bankDetails,
                            accountNumber: e.target.value,
                          },
                        });
                        if (formErrors.accountNumber)
                          setFormErrors({ ...formErrors, accountNumber: "" });
                      }}
                      className={`mt-1 block w-full rounded-md border-2 px-4 py-2 shadow-sm transition-all duration-200
                        ${
                          formErrors.accountNumber
                            ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                            : "border-gray-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        }`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 group">
                      <span className="flex items-center">
                        <span className="mr-2">Account Holder Name</span>
                        {formErrors.accountHolderName && (
                          <span className="text-red-500 text-xs animate-fade-in">
                            *
                          </span>
                        )}
                      </span>
                    </label>
                    <input
                      type="text"
                      value={restaurant.bankDetails.accountHolderName}
                      onChange={(e) => {
                        setRestaurant({
                          ...restaurant,
                          bankDetails: {
                            ...restaurant.bankDetails,
                            accountHolderName: e.target.value,
                          },
                        });
                        if (formErrors.accountHolderName)
                          setFormErrors({
                            ...formErrors,
                            accountHolderName: "",
                          });
                      }}
                      className={`mt-1 block w-full rounded-md border-2 px-4 py-2 shadow-sm transition-all duration-200
                        ${
                          formErrors.accountHolderName
                            ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                            : "border-gray-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        }`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 group">
                      <span className="flex items-center">
                        <span className="mr-2">Branch Code</span>
                        {formErrors.branchCode && (
                          <span className="text-red-500 text-xs animate-fade-in">
                            *
                          </span>
                        )}
                      </span>
                    </label>
                    <input
                      type="text"
                      value={restaurant.bankDetails.branchCode}
                      onChange={(e) => {
                        setRestaurant({
                          ...restaurant,
                          bankDetails: {
                            ...restaurant.bankDetails,
                            branchCode: e.target.value,
                          },
                        });
                        if (formErrors.branchCode)
                          setFormErrors({ ...formErrors, branchCode: "" });
                      }}
                      className={`mt-1 block w-full rounded-md border-2 px-4 py-2 shadow-sm transition-all duration-200
                        ${
                          formErrors.branchCode
                            ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                            : "border-gray-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        }`}
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1 group">
                      <span className="flex items-center">
                        <span className="mr-2">Branch Name</span>
                        {formErrors.branchName && (
                          <span className="text-red-500 text-xs animate-fade-in">
                            *
                          </span>
                        )}
                      </span>
                    </label>
                    <input
                      type="text"
                      value={restaurant.bankDetails.branchName}
                      onChange={(e) => {
                        setRestaurant({
                          ...restaurant,
                          bankDetails: {
                            ...restaurant.bankDetails,
                            branchName: e.target.value,
                          },
                        });
                        if (formErrors.branchName)
                          setFormErrors({ ...formErrors, branchName: "" });
                      }}
                      className={`mt-1 block w-full rounded-md border-2 px-4 py-2 shadow-sm transition-all duration-200
                        ${
                          formErrors.branchName
                            ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                            : "border-gray-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        }`}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Business Hours Section */}
              <div className="space-y-4 md:col-span-2">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Business Hours
                </h2>

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
                          useUnifiedHours ? "bg-primary" : "bg-gray-300"
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Opening Time (All Days)
                      </label>
                      <input
                        type="time"
                        name="open"
                        value={unifiedHours.open}
                        onChange={handleUnifiedHoursChange}
                        className="mt-1 block w-full rounded-md border-2 px-4 py-2 shadow-sm transition-all duration-200 border-gray-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Closing Time (All Days)
                      </label>
                      <input
                        type="time"
                        name="close"
                        value={unifiedHours.close}
                        onChange={handleUnifiedHoursChange}
                        className="mt-1 block w-full rounded-md border-2 px-4 py-2 shadow-sm transition-all duration-200 border-gray-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                ) : (
                  // Custom Hours Input
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.keys(restaurant.businessHours).map((day) => (
                      <div
                        key={day}
                        className="space-y-2 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200"
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
                              value={restaurant.businessHours[day].open}
                              onChange={handleBusinessHoursChange}
                              className="block w-full rounded-md border-2 px-4 py-2 shadow-sm transition-all duration-200 border-gray-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-xs text-gray-500 mb-1">
                              Closing Time
                            </label>
                            <input
                              type="time"
                              name={`businessHours.${day}.close`}
                              value={restaurant.businessHours[day].close}
                              onChange={handleBusinessHoursChange}
                              className="block w-full rounded-md border-2 px-4 py-2 shadow-sm transition-all duration-200 border-gray-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => navigate("/dashboard/manage-restaurants")}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`relative px-6 py-2 rounded-md text-white transition-all duration-200
                  ${
                    isSubmitting
                      ? "bg-primary/70 cursor-not-allowed"
                      : "bg-primary hover:bg-primary-dark"
                  }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    Updating...
                  </span>
                ) : (
                  "Update Restaurant"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditRestaurant;
