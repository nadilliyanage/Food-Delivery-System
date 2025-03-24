import React, { useState, useEffect, useRef } from "react";
import { FaPencilAlt } from "react-icons/fa";
import useUser from "../../../hooks/useUser";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import storage from "../../../config/firebase.init";
import Swal from "sweetalert2";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { IoMdDownload } from "react-icons/io";
import Scroll from "../../../hooks/useScroll";
import InquiryForm from "../../Dashboard/Admin/QRManagement/InquiryForm";
import InquiryImg from "../../../assets/gallery/inquiry.png";
import SmallModal from "../../../components/Modal/Modal";
import { ToastContainer, toast } from "react-toastify";

const Profile = () => {
  const { currentUser } = useUser();
  const userCredentials = currentUser;
  const axiosSecure = useAxiosSecure();
  const [img, setImg] = useState(undefined);
  const [imgPerc, setImgPerc] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal
  const [formData, setFormData] = useState({
    name: userCredentials?.name || "",
    phone: userCredentials?.phone || "",
    address: userCredentials?.address || "",
    photoUrl: userCredentials?.photoUrl || "",
  });
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  const handleInquiryClick = () => {
    setIsInquiryModalOpen(true); // Open the InquiryForm modal
  };

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
          text: "Your details have been updated successfully.",
          icon: "success",
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.reload(); // Reload only after "OK" is clicked
          }
        });
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

  // Function to download the QR code image
  const downloadQRCode = (e) => {
    e.preventDefault(); // Prevent form submission

    Swal.fire({
      title: "Are you sure you want to download the QR code?",
      text: "",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, download!",
    }).then((result) => {
      if (result.isConfirmed) {
        const link = document.createElement("a");
        link.href = currentUser?.qrCodeUrl;
        link.download = `qr-code-of-${currentUser.name}`; // Name of the downloaded file
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        Swal.fire({
          title: "Downloaded!",
          text: "You have successfully downloaded the QR code.",
          icon: "success",
        });
      }
    });
  };

  // Function to toggle modal for full-screen QR code
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="mt-20">
      <Scroll />
      <h1 className="mt-5 text-4xl font-bold text-center dark:text-white">
        Update <span className="text-secondary">Profile</span>
      </h1>
      <p className="text-center">Change your details</p>

      <section>
        <div className="px-4 mx-auto sm:px-6 lg:px-8">
          <div className="p-8 bg-white dark:bg-slate-700 rounded-lg shadow-lg lg:p-12">
            <form className="space-y-4" onSubmit={handleFormSubmit}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 dark:text-white">
                <div className="flex justify-between">
                  <div>
                    <img
                      src={currentUser?.qrCodeUrl}
                      alt="QR code"
                      className="mx-auto cursor-pointer"
                      onClick={openModal}
                    />
                  </div>

                  {isModalOpen && (
                    <div
                      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                      onClick={closeModal}
                    >
                      <div className="relative">
                        <button
                          className="absolute top-0 right-0 bg-white text-black rounded-full px-2 mx-2 text-xl"
                          onClick={closeModal}
                        >
                          &times; {/* Close button */}
                        </button>
                        <img
                          src={currentUser?.qrCodeUrl}
                          alt="QR code"
                          className="w-full h-96"
                        />
                      </div>
                    </div>
                  )}

                  <div className="text-center mt-3 flex-1 justify-center my-auto">
                    <button
                      className="bg-secondary text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-secondary-dark transition duration-300"
                      onClick={downloadQRCode}
                      type="button" // Ensure this button does not submit the form
                    >
                      <IoMdDownload className="text-2xl" />
                      Download QR
                    </button>

                    <div
                      className="flex flex-row my-auto bg-secondary rounded-lg mt-3"
                      onClick={handleInquiryClick}
                    >
                      <img
                        src={InquiryImg}
                        alt="Inquiry"
                        style={{ cursor: "pointer" }}
                      />
                      <p className="my-auto text-white -ml-3">Inquiries</p>
                      
                    </div>
                  </div>
                </div>
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
                      className="w-full p-3 mt-1 text-sm border rounded-lg outline-none border-secondary dark:bg-slate-800"
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
                      className="w-full p-3 mt-3 text-sm border rounded-lg outline-none border-secondary"
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
                    className="w-full p-3 mt-3 text-sm border rounded-lg outline-none border-secondary dark:bg-slate-800"
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
                    className="w-full p-3 mt-3 text-sm border rounded-lg outline-none border-secondary dark:bg-slate-800"
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
                  className="px-10 py-5 text-white rounded-lg bg-secondary hover:bg-red-500"
                  type="submit"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <SmallModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        title="Inquiry Form"
      >
        <InquiryForm onClose={() => setIsInquiryModalOpen(false)} />
      </SmallModal>

      <ToastContainer />
    </div>
  );
};

export default Profile;
