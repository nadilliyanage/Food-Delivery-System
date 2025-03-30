import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import storage from '../../../config/firebase.init';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const EditMenuItem = () => {
  const { restaurantId, menuItemId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [menuItem, setMenuItem] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: ''
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
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/menu/${menuItemId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setMenuItem(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching menu item:', error);
      setError('Failed to fetch menu item. Please try again.');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/menu/${menuItemId}`,
        menuItem,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data) {
        Swal.fire({
          title: 'Success!',
          text: 'Menu item updated successfully',
          icon: 'success'
        });
        navigate(`/dashboard/restaurant/${restaurantId}`);
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update menu item. Please try again.',
        icon: 'error'
      });
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
          className="text-primary hover:text-primary-dark mb-4 flex items-center"
        >
          ← Back to Menu Items
        </button>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Menu Item</h1>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={menuItem.name}
                onChange={(e) => setMenuItem({ ...menuItem, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={menuItem.description}
                onChange={(e) => setMenuItem({ ...menuItem, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                rows="3"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Price</label>
              <input
                type="number"
                value={menuItem.price}
                onChange={(e) => setMenuItem({ ...menuItem, price: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <input
                type="text"
                value={menuItem.category}
                onChange={(e) => setMenuItem({ ...menuItem, category: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Image</label>
              <div className="mt-1 flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary file:text-white
                    hover:file:bg-primary-dark"
                />
                {isUploading && (
                  <div className="w-32 bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>
              {menuItem.imageUrl && (
                <img
                  src={menuItem.imageUrl}
                  alt="Preview"
                  className="mt-2 h-32 w-32 object-cover rounded-lg"
                />
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => navigate(`/dashboard/manage-restaurants/${restaurantId}`)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
              >
                Update Item
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditMenuItem; 