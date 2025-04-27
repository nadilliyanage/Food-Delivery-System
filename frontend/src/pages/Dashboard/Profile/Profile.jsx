import React, { useState, useEffect, useRef } from "react";
import { FaPencilAlt } from "react-icons/fa";
import useUser from "../../../hooks/useUser";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import storage from "../../../config/firebase.init";
import Swal from "sweetalert2";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import Scroll from "../../../hooks/useScroll";
import { ToastContainer, toast } from "react-toastify";

const Profile = () => {
  const { currentUser, refetch } = useUser();
  const userCredentials = currentUser;
  const axiosSecure = useAxiosSecure();
  const [img, setImg] = useState(undefined);
  const [imgPerc, setImgPerc] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imgUploaded, setImgUploaded] = useState(false);
  const [formData, setFormData] = useState({
    name: userCredentials?.name || "",
    phone: userCredentials?.phone || "",
    address: userCredentials?.address || "",
    photoUrl: userCredentials?.photoUrl || "",
  });

  // Update formData when userCredentials changes
  useEffect(() => {
    if (userCredentials) {
      setFormData({
        name: userCredentials.name || "",
        phone: userCredentials.phone || "",
        address: userCredentials.address || "",
        photoUrl: userCredentials.photoUrl || "",
      });
    }
  }, [userCredentials]);

  useEffect(() => {
    if (img) {
      uploadFile(img, "photoUrl");
    }
  }, [img]);

  const uploadFile = (file, fileType) => {
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, "images/profilePictures/" + fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    setIsUploading(true);
    setImgUploaded(false);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImgPerc(Math.round(progress));
      },
      (error) => {
        console.error(error);
        setIsUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setFormData((prev) => ({
          ...prev,
          [fileType]: downloadURL,
        }));
        setIsUploading(false);
        setImgUploaded(true);
        toast.success("Image uploaded successfully!");
      }
    );
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (isUploading) {
      toast.warning("Please wait until the image finishes uploading.");
      return;
    }

    if (!imgUploaded && img) {
      toast.warning(
        "Please wait until the image is fully uploaded before submitting."
      );
      return;
    }

    try {
      const response = await axiosSecure.patch(
        `/api/auth/users/${userCredentials._id}`,
        formData
      );

      // Update local storage with new user data
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Refetch user data to update the state
      await refetch();

      Swal.fire({
        title: "Updated!",
        text: "Your details have been updated successfully.",
        icon: "success",
      });
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while updating!");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePencilClick = () => {
    fileInputRef.current.click(); // Trigger file input on pencil icon click
  };

  return (
    <div className=" mt-0 md:mt-20 lg:mt-20">
      <Scroll />
      <h1 className="text-4xl font-bold text-center dark:text-white">
        Update <span className="text-primary">Profile</span>
      </h1>
      <p className="text-center">Change your details</p>

      <section>
        <div className="px-4 mx-auto sm:px-6 lg:px-8">
          <div className="p-8 bg-white dark:bg-slate-700 rounded-lg shadow-lg lg:p-12">
            <form className="space-y-4" onSubmit={handleFormSubmit}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 dark:text-white">
                <div>
                  <label
                    htmlFor="photoUrl"
                    className="block text-gray-700 font-semibold mb-1 mx-auto"
                  >
                    {uploading ? `Uploading: ${imgPerc}%` : "Photo"}
                  </label>

                  {/* Pencil Icon to trigger file input */}
                  <div className="relative w-40 h-40 mx-auto">
                    {formData.photoUrl && !uploading ? (
                      <img
                        src={formData.photoUrl}
                        alt="Uploaded Preview"
                        className="w-full h-full object-cover rounded-md border border-gray-300"
                      />
                    ) : (
                      <div className="w-40 h-40 rounded-md border object-cover border-gray-300"></div>
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
                      className="w-full p-3 mt-1 text-sm border rounded-lg outline-none border-primary dark:bg-slate-800"
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
                    <span className="text-red-400 ml-3 text-sm">
                      You can't edit your email
                    </span>
                    <input
                      className="w-full p-3 mt-3 text-sm border rounded-lg outline-none border-primary"
                      placeholder="Email Address"
                      disabled
                      type="email"
                      required
                      defaultValue={userCredentials?.email}
                      id="email"
                      name="email"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 dark:text-white">
                <div>
                  <label className="ml-2" htmlFor="phone">
                    Phone
                  </label>
                  <input
                    className="w-full p-3 mt-3 text-sm border rounded-lg outline-none border-primary dark:bg-slate-800"
                    placeholder="Phone Number"
                    type="tel"
                    required
                    value={formData.phone}
                    id="phone"
                    name="phone"
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="ml-2" htmlFor="address">
                    Address
                  </label>
                  <input
                    className="w-full p-3 mt-3 text-sm border rounded-lg outline-none border-primary dark:bg-slate-800"
                    placeholder="Address"
                    type="text"
                    value={formData.address}
                    id="address"
                    name="address"
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  className="px-10 py-5 text-white rounded-lg bg-primary hover:bg-red-500"
                  type="submit"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <ToastContainer />
    </div>
  );
};

export default Profile;
