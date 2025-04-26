import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import storage from "../../../config/firebase.init";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const EditMenuItem = () => {
  const { restaurantId, menuItemId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [menuItem, setMenuItem] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    imageUrl: "",
  });

  useEffect(() => {
    fetchMenuItem();
  }, [menuItemId]);

  useEffect(() => {
    if (imageFile) {
      uploadImage(imageFile);
    }
  }, [imageFile]);

  const fetchMenuItem = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/menu/${menuItemId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMenuItem(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching menu item:", error);
      setError("Failed to fetch menu item. Please try again.");
      setLoading(false);
    }
  };

  const uploadImage = async (file) => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const storageRef = ref(
      storage,
      `menu-items/${new Date().getTime()}_${file.name}`
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
          setMenuItem((prev) => ({
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

  const validateForm = () => {
    const errors = {};
    if (!menuItem.name.trim()) errors.name = "Name is required";
    if (!menuItem.description.trim())
      errors.description = "Description is required";
    if (!menuItem.price || menuItem.price <= 0)
      errors.price = "Price must be greater than 0";
    if (!menuItem.category.trim()) errors.category = "Category is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/menu/${menuItemId}`,
        menuItem,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        await Swal.fire({
          title: "Success!",
          text: "Menu item updated successfully",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
        });
        navigate(`/dashboard/restaurant/${restaurantId}`);
      }
    } catch (error) {
      console.error("Error updating menu item:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to update menu item. Please try again.",
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
            onClick={fetchMenuItem}
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
          onClick={() => navigate(`/dashboard/restaurant/${restaurantId}`)}
          className="text-primary hover:text-primary-dark mb-4 flex items-center transition-colors duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Menu Items
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Edit Menu Item
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-md transform transition-all duration-300 hover:shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
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
                  value={menuItem.name}
                  onChange={(e) => {
                    setMenuItem({ ...menuItem, name: e.target.value });
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
                  value={menuItem.description}
                  onChange={(e) => {
                    setMenuItem({ ...menuItem, description: e.target.value });
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 group">
                  <span className="flex items-center">
                    <span className="mr-2">Price</span>
                    {formErrors.price && (
                      <span className="text-red-500 text-xs animate-fade-in">
                        *
                      </span>
                    )}
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    value={menuItem.price}
                    onChange={(e) => {
                      setMenuItem({ ...menuItem, price: e.target.value });
                      if (formErrors.price)
                        setFormErrors({ ...formErrors, price: "" });
                    }}
                    className={`mt-1 block w-full rounded-md border-2 px-4 py-2 shadow-sm pl-8 transition-all duration-200
                      ${
                        formErrors.price
                          ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                          : "border-gray-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      }`}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 group">
                  <span className="flex items-center">
                    <span className="mr-2">Category</span>
                    {formErrors.category && (
                      <span className="text-red-500 text-xs animate-fade-in">
                        *
                      </span>
                    )}
                  </span>
                </label>
                <input
                  type="text"
                  value={menuItem.category}
                  onChange={(e) => {
                    setMenuItem({ ...menuItem, category: e.target.value });
                    if (formErrors.category)
                      setFormErrors({ ...formErrors, category: "" });
                  }}
                  className={`mt-1 block w-full rounded-md border-2 px-4 py-2 shadow-sm transition-all duration-200
                    ${
                      formErrors.category
                        ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                        : "border-gray-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    }`}
                  required
                />
              </div>

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
                {menuItem.imageUrl && (
                  <div className="mt-4 relative group">
                    <img
                      src={menuItem.imageUrl}
                      alt="Preview"
                      className="h-32 w-32 object-cover rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg"></div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() =>
                  navigate(`/dashboard/manage-restaurants/${restaurantId}`)
                }
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
                  "Update Item"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditMenuItem;
