import React, { useEffect, useRef, useState } from "react";
import { FaArrowLeft, FaPencilAlt } from "react-icons/fa";
import useAuth from "../../../hooks/useAuth";
import { useParams, useNavigate } from "react-router-dom";
import useAxiosFetch from "../../../hooks/useAxiosFetch";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useUser from "../../../hooks/useUser";
import storage from "../../../config/firebase.init";
import Swal from "sweetalert2";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const UpdateUser = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const axiosFetch = useAxiosFetch();
  const axiosSecure = useAxiosSecure();
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const [img, setImg] = useState(undefined);
  const [imgPerc, setImgPerc] = useState(0);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "customer",
    photoUrl: "",
  });

  useEffect(() => {
    // Fetch user data when component mounts
    axiosSecure
      .get(`/api/auth/users/${id}`)
      .then((res) => {
        const user = res.data;
        setUserData(user);
        // Set form data with the user's current role
        setFormData({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          address: user.address || "",
          role: user.role || "customer",
          photoUrl: user.photoUrl || "",
        });
      })
      .catch((err) => {
        console.error("Error fetching user:", err);
        Swal.fire({
          title: "Error!",
          text: "Failed to fetch user data.",
          icon: "error",
        });
        navigate("/dashboard/manage-users");
      });
  }, [id, axiosSecure, navigate]);

  useEffect(() => {
    if (img) {
      uploadFile(img, "photoUrl");
    }
  }, [img]);

  const uploadFile = (file, fileType) => {
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, "images/profilePictures/" + fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);
    setUploading(true);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImgPerc(Math.round(progress));
      },
      (error) => {
        console.error(error);
        setUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData((prev) => ({
            ...prev,
            [fileType]: downloadURL,
          }));
          setUploading(false);
        });
      }
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log("Changing", name, "to", value);

    // Update form data directly
    setFormData((prevData) => {
      const newData = { ...prevData, [name]: value };
      console.log("Updated form data:", newData);
      return newData;
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Create update data object
    const updateData = {
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      photoUrl: formData.photoUrl,
      role: formData.role,
    };
    // Send update request
    axiosSecure
      .patch(`/api/auth/users/${id}`, updateData)
      .then((res) => {
        Swal.fire({
          title: "Updated!",
          text: "Details have been updated successfully.",
          icon: "success",
        });
        navigate("/dashboard/manage-users");
      })
      .catch((err) => {
        console.error("Update error:", err);
        Swal.fire({
          title: "Error!",
          text: "Failed to update user details.",
          icon: "error",
        });
      });
  };

  const handlePencilClick = () => {
    fileInputRef.current.click();
  };

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center">
        <button
          onClick={() => navigate("/dashboard/manage-users")}
          className="inline-flex items-center gap-2 px-4 py-2 text-white bg-blue-500 rounded-md"
        >
          <FaArrowLeft />
        </button>
      </div>
      <h1 className="mt-5 text-4xl font-bold text-center">
        Update: <span className="text-primary">{userData.name}</span>
      </h1>
      <p className="text-center">
        Change details about{" "}
        <span className="font-bold text-red-400">{userData.name}</span>
      </p>

      <div className="text-center text-sm text-gray-600 mb-4">
        Note: Email is read-only. All other fields can be updated.
      </div>

      <div>
        {currentUser?._id === userData._id && (
          <h1 className="text-center text-lg font-semibold text-red-500 bg-green-100 p-2 rounded-md shadow-md mt-10 mx-4 mb-4">
            This is you
          </h1>
        )}
      </div>

      <section>
        <div className="px-4 pb-16 mx-auto sm:px-6 lg:px-8">
          <div className="p-8 bg-white rounded-lg shadow-lg lg:p-12">
            <form className="space-y-4" onSubmit={handleFormSubmit}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="photoUrl"
                    className="block text-gray-700 font-semibold mb-1"
                  >
                    {uploading ? `Uploading: ${imgPerc}%` : "Photo"}
                  </label>

                  <div className="relative w-40 h-40">
                    {formData.photoUrl && !uploading ? (
                      <img
                        src={formData.photoUrl}
                        alt="Uploaded Preview"
                        className="w-full h-full object-cover rounded-md border border-gray-300"
                      />
                    ) : (
                      <div className="w-40 h-40 object-cover rounded-md border border-gray-300"></div>
                    )}

                    <button
                      type="button"
                      onClick={handlePencilClick}
                      className="absolute bottom-2 right-2 bg-gray-100 rounded-full p-2 shadow-md hover:bg-gray-200"
                    >
                      <FaPencilAlt className="text-gray-700" />
                    </button>
                  </div>

                  <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    name="photoUrl"
                    onChange={(e) => setImg(e.target.files[0])}
                  />
                </div>

                <div className="flex-col">
                  <div>
                    <label className="pb-4 ml-2" htmlFor="name">
                      Name
                    </label>
                    <input
                      className="w-full p-3 mt-1 text-sm border rounded-lg outline-none border-primary"
                      placeholder="Your Name"
                      type="text"
                      required
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mt-5">
                    <label className="pb-4 ml-2" htmlFor="email">
                      Email
                    </label>
                    <input
                      className="w-full p-3 mt-3 text-sm border rounded-lg outline-none border-gray-300 bg-gray-50"
                      type="email"
                      id="email"
                      value={formData.email}
                      readOnly
                      disabled
                    />
                  </div>
                </div>

                <div>
                  <label className="ml-2" htmlFor="phone">
                    Phone
                  </label>
                  <input
                    className="w-full p-3 mt-3 text-sm border rounded-lg outline-none border-primary"
                    placeholder="Phone Number"
                    type="tel"
                    required
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="ml-2" htmlFor="address">
                    Address
                  </label>
                  <input
                    className="w-full p-3 mt-3 text-sm border rounded-lg outline-none border-primary"
                    placeholder="Address"
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="mt-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Role
                </label>
                <select
                  className="w-full p-3 text-sm border rounded-lg outline-none border-primary"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="customer">Customer</option>
                  <option value="restaurant_admin">Restaurant Admin</option>
                  <option value="delivery_personnel">Delivery Personnel</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full px-4 py-3 text-white bg-primary rounded-lg hover:bg-primary/90"
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UpdateUser;
