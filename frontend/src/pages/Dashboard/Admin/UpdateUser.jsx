import React, { useEffect, useRef, useState } from "react";
import { FaArrowLeft, FaPencilAlt } from "react-icons/fa";
import useAuth from "../../../hooks/useAuth";
import { useLoaderData, useNavigate } from "react-router-dom";
import useAxiosFetch from "../../../hooks/useAxiosFetch";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useUser from "../../../hooks/useUser";
import storage from "../../../config/firebase.init";
import Swal from "sweetalert2";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const UpdateUser = () => {
  const { user } = useAuth();
  const userCredentials = useLoaderData();
  const axiosFetch = useAxiosFetch();
  const axiosSecure = useAxiosSecure();
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const [img, setImg] = useState(undefined);
  const [imgPerc, setImgPerc] = useState(0);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: userCredentials?.name || "",
    email: userCredentials?.email || "",
    phone: userCredentials?.phone || "",
    address: userCredentials?.address || "",
    role: userCredentials?.role || "customer",
    photoUrl: userCredentials?.photoUrl || "",
  });

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

  const handleFormSubmit = (e) => {
    e.preventDefault();
    axiosSecure
      .put(`/update-user/${userCredentials._id}`, formData)
      .then(() => {
        Swal.fire({
          title: "Updated!",
          text: "Details have been updated successfully.",
          icon: "success",
        });
        navigate(`/dashboard/manage-users`);
      })
      .catch((err) => console.error(err));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePencilClick = () => {
    fileInputRef.current.click(); // Trigger file input on pencil icon click
  };

  return (
    <div>
      <div className="flex items-center my-4">
        <button
          onClick={() => navigate("/dashboard/manage-users")}
          className="inline-flex items-center gap-2 px-4 py-2 text-white bg-blue-500 rounded-md"
        >
          <FaArrowLeft />
        </button>
      </div>
      <h1 className="mt-5 text-4xl font-bold text-center">
        Update: <span className="text-secondary">{userCredentials?.name}</span>
      </h1>
      <p className="text-center">
        Change details about{" "}
        <span className="font-bold text-red-400">{userCredentials?.name}</span>
      </p>

      <div>
        {currentUser?._id === userCredentials?._id && (
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

                  {/* Pencil Icon to trigger file input */}
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

                    {/* Pencil Icon */}
                    <button
                      type="button"
                      onClick={handlePencilClick}
                      className="absolute bottom-2 right-2 bg-gray-100 rounded-full p-2 shadow-md hover:bg-gray-200"
                    >
                      <FaPencilAlt className="text-gray-700" />
                    </button>
                  </div>

                  {/* Hidden file input */}
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
                      className="w-full p-3 mt-1 text-sm border rounded-lg outline-none border-secondary"
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
                      className="w-full p-3 mt-3 text-sm border rounded-lg outline-none border-secondary"
                      placeholder="Email Address"
                      type="email"
                      required
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="ml-2" htmlFor="phone">
                    Phone
                  </label>
                  <input
                    className="w-full p-3 mt-3 text-sm border rounded-lg outline-none border-secondary"
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
                    className="w-full p-3 mt-3 text-sm border rounded-lg outline-none border-secondary"
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
              <h1>Please select a role</h1>
              <div className="grid grid-cols-1 gap-4 text-center sm:grid-cols-2">
                <div>
                  <input
                    className="sr-only peer"
                    id="option1"
                    type="radio"
                    value="customer"
                    name="role"
                    checked={formData.role === "user"}
                    onChange={handleChange}
                  />
                  <label
                    htmlFor="option1"
                    className="block w-full p-3 border rounded-lg peer-checked:border-secondary peer-checked:bg-secondary peer-checked:text-white"
                  >
                    <span className="text-sm font-medium">User</span>
                  </label>
                </div>
                <div>
                  <input
                    className="sr-only peer"
                    id="option2"
                    type="radio"
                    value="admin"
                    name="role"
                    checked={formData.role === "admin"}
                    onChange={handleChange}
                  />
                  <label
                    htmlFor="option2"
                    className="block w-full p-3 border rounded-lg peer-checked:border-secondary peer-checked:bg-secondary peer-checked:text-white"
                  >
                    <span className="text-sm font-medium">Admin</span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  className="px-10 py-5 text-white rounded-lg bg-secondary hover:bg-red-500"
                  type="submit"
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
