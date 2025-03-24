import React, { useState, useEffect } from "react";
import useAxiosSecure from "../../../../hooks/useAxiosSecure";
import { ToastContainer, toast } from "react-toastify";
import QrScanner from "react-qr-scanner";
import jsQR from "jsqr";
import "../../../../components/Toast/customToast.css";
import "react-toastify/dist/ReactToastify.css";
import LargeModal from "../../../../components/Modal/LargeModal";
import SmallModal from "../../../../components/Modal/Modal";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Scroll from "../../../../hooks/useScroll";
import ScanImg from "../../../../assets/gallery/scanning.jpg";
import InquiryForm from "./InquiryForm";
import InquiryImg from "../../../../assets/gallery/inquiry.png";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import Button from "../../../../components/Button/Button";
import Swal from "sweetalert2";

function App() {
  const [scanResult, setScanResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [qrImage, setQrImage] = useState(null);
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    userId: "",
  });

  const [garbageRequests, setGarbageRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSmallModalOpen, setIsSmallModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState("Cash Back");
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [activeTab, setActiveTab] = useState("cashBack");
  const [isCashBackExpanded, setIsCashBackExpanded] = useState(false);
  const [isAdditionalFeeExpanded, setIsAdditionalFeeExpanded] = useState(false);

  const axiosSecure = useAxiosSecure();

  useEffect(() => {
    if (userDetails.userId) {
      setUserId(userDetails.userId); // Set userId based on fetched userDetails
    }
  }, [userDetails]);

  // Handle QR code scanning
  const handleScan = (data) => {
    if (data) {
      const phone = data.text;
      setScanResult(phone);
      setCameraActive(false);
      fetchUserDetails(phone);
    }
  };

  const handleError = (err) => {
    console.error("QR Scan Error: ", err);
    toast.error("Error scanning QR code");
  };

  const toggleCashBack = () => {
    setIsCashBackExpanded(!isCashBackExpanded);
    setIsAdditionalFeeExpanded(false); // Close other section
  };

  const toggleAdditionalFee = () => {
    setIsAdditionalFeeExpanded(!isAdditionalFeeExpanded);
    setIsCashBackExpanded(false); // Close other section
  };

  // Fetch user details based on scanned result
  const fetchUserDetails = async (userId) => {
    try {
      const response = await fetch(userId);
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();

      setUserDetails({
        userId: data._id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
      });
      const garbageRequestsResponse = await axiosSecure.get(
        `api/garbageRequests/user?userId=${data._id}`
      );
      console.log(data._id);
      setGarbageRequests(
        garbageRequestsResponse.data.map((request) => ({
          ...request,
          isInEditMode: false,
        }))
      );

      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("No data found");
    }
  };

  // Toggle camera visibility
  const toggleCamera = () => {
    setCameraActive((prev) => !prev);
    setQrImage(null);
  };

  // Handle image upload for QR code
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    setQrImage(img.src);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const qrCode = jsQR(imageData.data, canvas.width, canvas.height);

      if (qrCode) {
        const userId = qrCode.data;
        setScanResult(userId);
        fetchUserDetails(userId);
        setCameraActive(false);
      } else {
        toast.error("No QR code found in the image");
      }
    };
  };

  // Confirm action on a garbage request
  const confirmAction = (requestId, action) => {
    setSelectedRequestId(requestId);
    setSelectedAction(action);
    setIsSmallModalOpen(true);
  };

  // Handle status update for garbage requests
  const addUpdateStatus = async () => {
    if (!selectedRequestId || !selectedAction) return;
    try {
      await axiosSecure.put(`/api/garbageRequests/${selectedRequestId}`, {
        status: selectedAction,
      });
      setGarbageRequests((prevRequests) =>
        prevRequests.map((request) =>
          request._id === selectedRequestId
            ? {
                ...request,
                status: selectedAction,
                isInEditMode: false,
              }
            : request
        )
      );
      if (selectedAction === "Accepted") {
        Swal.fire({
          title: "Accepted!",
          text: "User Request Accepted successfully.",
          icon: "success",
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.reload(); // Reload only after "OK" is clicked
          }
        });
      }
      if (selectedAction === "Rejected") {
        toast.warn(`Request ${selectedAction}`);
      }

      setIsSmallModalOpen(false);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  // Toggle edit mode for garbage requests
  const toggleEditMode = (requestId) => {
    setGarbageRequests((prevRequests) =>
      prevRequests.map((request) =>
        request._id === requestId
          ? { ...request, isInEditMode: !request.isInEditMode }
          : request
      )
    );
  };

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  const handleInquiryClick = () => {
    setIsInquiryModalOpen(true); // Open the InquiryForm modal
  };

  const addCashBack = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosSecure.post(`api/collector/addCashBack`, {
        userId,
        amount,
        transactionType,
      });

      if (response.status === 200) {
        toast.success("Account balance updated successfully!");
      }
    } catch (error) {
      toast.error(
        "Error updating account balance: " + error.response?.data?.message ||
          error.message
      );
    }
  };

  const addAdditionalPrice = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosSecure.post(
        `api/collector/addAdditionalPrice`,
        {
          userId,
          amount,
          transactionType,
        }
      );

      if (response.status === 200) {
        toast.success("Account balance updated successfully!");
      }
    } catch (error) {
      toast.error(
        "Error updating account balance: " + error.response?.data?.message ||
          error.message
      );
    }
  };

  return (
    <div className="bg-white pt-20 min-h-screen flex flex-col items-center justify-center">
      <Scroll />
      <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-gray-800 text-center">
        QR Code Scanner
      </h1>
      <div className="absolute right-1 top-1" onClick={handleInquiryClick}>
        <img src={InquiryImg} alt="Inquiry" style={{ cursor: "pointer" }} />
      </div>

      {qrImage ? (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2 text-center">
            Uploaded QR Code:
          </h2>
          <img
            src={qrImage}
            alt="Uploaded QR Code"
            className="max-w-full sm:max-w-xs rounded-lg shadow-md"
          />
        </div>
      ) : cameraActive ? (
        <div className="border-4 border-gray-300 p-4 rounded-lg mb-6 max-w-xs sm:max-w-md">
          <QrScanner
            delay={300}
            className="mx-auto"
            style={{ height: 200, width: 300 }}
            onError={handleError}
            onScan={handleScan}
          />
        </div>
      ) : (
        <img
          src={ScanImg}
          alt="Scan QR Code"
          className="max-w-[70%] sm:max-w-xs rounded-lg shadow-md my-4"
        />
      )}

      <Button
        onClick={toggleCamera}
        className={`px-6 py-3 rounded-lg text-white mb-6 transition-all duration-300 ${
          cameraActive
            ? "bg-red-500 hover:bg-red-600"
            : "bg-indigo-500 hover:bg-indigo-600"
        }`}
      >
        {cameraActive ? "Turn off Camera" : "Turn on Camera"}
      </Button>

      <div className="flex flex-col items-center mb-6">
        <label
          htmlFor="qr-upload"
          className="px-6 py-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white cursor-pointer transition-all"
        >
          Upload QR Code Image
        </label>
        <input
          id="qr-upload"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      <LargeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="User Details"
      >
        {loading ? (
          <p className="text-lg text-gray-600">Loading user details...</p>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-md text-left w-full max-w-2xl mx-auto">
            <p className="mb-4">
              <strong>Name:</strong> {userDetails.name}
            </p>
            <p className="mb-4">
              <strong>Email:</strong> {userDetails.email}
            </p>
            <p className="mb-4">
              <strong>Phone:</strong> {userDetails.phone}
            </p>
            <p className="mb-4">
              <strong>Address:</strong> {userDetails.address}
            </p>

            {garbageRequests.length > 0 ? (
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-700">
                  Garbage Requests
                </h3>
                <Slider {...sliderSettings}>
                  {garbageRequests.map((request) => (
                    <div
                      key={request._id}
                      className="p-4 bg-gray-100 rounded-lg shadow-sm border border-gray-300"
                    >
                      <p className="mb-2">
                        <strong>Type:</strong> {request.type}
                      </p>

                      <p className="mb-2">
                        <strong>Description:</strong> {request.description}
                      </p>
                      <p className="mb-2">
                        <strong>Status:</strong>{" "}
                        <span
                          className={`font-semibold ${
                            request.status === "pending"
                              ? "text-yellow-500"
                              : request.status === "Accepted"
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {request.status}
                        </span>
                      </p>
                      <div className="space-y-4 bg-white px-4 py-2 rounded-lg">
                        <div className="flex space-x-4 border-b border-gray-300 mb-4">
                          <Button
                            onClick={() => {
                              setActiveTab("cashBack");
                              toggleCashBack();
                            }}
                            className={`py-2 px-4 flex items-center ${
                              activeTab === "cashBack"
                                ? "border-b-2 border-blue-500 text-blue-500"
                                : "text-gray-500"
                            }`}
                          >
                            Cash Back
                            {isCashBackExpanded ? (
                              <FaChevronUp className="w-5 h-5 ml-2" />
                            ) : (
                              <FaChevronDown className="w-5 h-5 ml-2" />
                            )}
                          </Button>
                          <Button
                            onClick={() => {
                              setActiveTab("additionalFee");
                              toggleAdditionalFee();
                            }}
                            className={`py-2 px-4 flex items-center ${
                              activeTab === "additionalFee"
                                ? "border-b-2 border-blue-500 text-blue-500"
                                : "text-gray-500"
                            }`}
                          >
                            Special Fee
                            {isAdditionalFeeExpanded ? (
                              <FaChevronUp className="w-5 h-5 ml-2" />
                            ) : (
                              <FaChevronDown className="w-5 h-5 ml-2" />
                            )}
                          </Button>
                        </div>

                        {/* Cash Back Form */}
                        {activeTab === "cashBack" && isCashBackExpanded && (
                          <form onSubmit={addCashBack} className="space-y-4 ">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Cash Back Amount
                              </label>
                              <div className="relative mt-1">
                                <span className="absolute left-2 top-2 text-gray-500">
                                  Rs:
                                </span>
                                <input
                                  type="number"
                                  value={amount}
                                  onChange={(e) => setAmount(e.target.value)}
                                  className="pl-10 p-2 block w-full border border-gray-300 rounded-md shadow-sm"
                                  required
                                />
                              </div>
                            </div>

                            <Button
                              type="submit"
                              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                            >
                              Update Balance
                            </Button>
                          </form>
                        )}

                        {/* Additional Fee Form */}
                        {activeTab === "additionalFee" &&
                          isAdditionalFeeExpanded && (
                            <form
                              onSubmit={addAdditionalPrice}
                              className="space-y-4"
                            >
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Special Waste Fee
                                </label>
                                <div className="relative mt-1">
                                  <span className="absolute left-2 top-2 text-gray-500">
                                    Rs:
                                  </span>
                                  <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="pl-10 p-2 block w-full border border-gray-300 rounded-md shadow-sm"
                                    required
                                  />
                                </div>
                              </div>

                              <Button
                                type="submit"
                                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                              >
                                Update Balance
                              </Button>
                            </form>
                          )}
                      </div>

                      {!request.isInEditMode ? (
                        <div className="flex items-center justify-center mt-4">
                          <Button
                            onClick={() => toggleEditMode(request._id)}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                          >
                            Update Request Status
                          </Button>
                        </div>
                      ) : (
                        <div className="mt-4 flex space-x-4 justify-center">
                          <Button
                            onClick={() =>
                              confirmAction(request._id, "Accepted")
                            }
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
                          >
                            Accept
                          </Button>
                          <Button
                            onClick={() =>
                              confirmAction(request._id, "Rejected")
                            }
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </Slider>
              </div>
            ) : (
              <p>No garbage requests available.</p>
            )}
          </div>
        )}
      </LargeModal>

      <SmallModal
        isOpen={isSmallModalOpen}
        onClose={() => setIsSmallModalOpen(false)}
        title={`Confirm ${selectedAction}`}
      >
        <div className="text-center">
          <p>Are you sure you want to {selectedAction} this request?</p>
          <div className="mt-6 flex justify-center space-x-4">
            <Button
              onClick={addUpdateStatus}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
            >
              Confirm
            </Button>
            <Button
              onClick={() => setIsSmallModalOpen(false)}
              className="px-6 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg"
            >
              Cancel
            </Button>
          </div>
        </div>
      </SmallModal>

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
}

export default App;
