import React, { useState, useEffect } from "react";
import Scroll from "../../hooks/useScroll";
import useUser from "../../hooks/useUser";
import { Link } from "react-router-dom";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import EditRequestModal from "./EditRequestModal";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";

const GarbageRequest = () => {
  const { currentUser } = useUser();
  const userId = currentUser?._id;
  const axiosSecure = useAxiosSecure();
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingRequests, setPendingRequests] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [rejectedRequests, setRejectedRequests] = useState([]);
  const [filter, setFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [feedbacks, setFeedbacks] = useState({}); // State to store feedbacks
  const [isOverDue, setIsOverDue] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const pendingResponse = await axiosSecure.get(
          `api/garbageRequests/user/${userId}/pending`
        );
        setPendingRequests(pendingResponse.data);
      } catch (error) {
        console.error("Error fetching pending requests:", error);
      }

      try {
        const acceptedResponse = await axiosSecure.get(
          `api/garbageRequests/user/${userId}/accepted`
        );
        setAcceptedRequests(acceptedResponse.data);
      } catch (error) {
        console.error("Error fetching accepted requests:", error);
      }

      try {
        const rejectedResponse = await axiosSecure.get(
          `api/garbageRequests/user/${userId}/rejected`
        );
        setRejectedRequests(rejectedResponse.data);
      } catch (error) {
        console.error("Error fetching declined requests:", error);
      }
    };

    fetchRequests();
  }, [userId, axiosSecure]);

  const handleEditClick = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleUpdateRequest = async (updatedRequest) => {
    try {
      await axiosSecure.put(
        `api/garbageRequests/${updatedRequest._id}`,
        updatedRequest
      );
      setPendingRequests((prevRequests) =>
        prevRequests.map((request) =>
          request._id === updatedRequest._id ? updatedRequest : request
        )
      );
    } catch (error) {
      console.error("Error updating request:", error);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    Swal.fire({
      title: "Are you sure you want to delete this request?",
      text: "",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Delete Request!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axiosSecure.delete(
            `api/garbageRequests/${requestId}`
          );

          if (response.status === 200 || response.status === 204) {
            // Update UI after successful deletion
            setPendingRequests((prevRequests) =>
              prevRequests.filter((request) => request._id !== requestId)
            );
          } else {
            // If response is not successful, handle it here
            console.error("Failed to delete request");
          }
        } catch (error) {
          console.error("Error deleting request:", error);
        }
      }
    });
  };

  const handleFeedbackChange = (requestId, value) => {
    setFeedbacks({ ...feedbacks, [requestId]: value });
  };

  const handleSendFeedback = async (requestId) => {
    const feedback = feedbacks[requestId];
    if (!feedback) return;

    try {
      const updatedRequest = {
        feedback, // Add feedback to the request object
      };
      await axiosSecure.put(`api/garbageRequests/${requestId}`, updatedRequest);
      // Optionally update the UI or fetch the updated requests again
      setAcceptedRequests((prevRequests) =>
        prevRequests.map((request) =>
          request._id === requestId ? { ...request, feedback } : request
        )
      );
      setFeedbacks((prevFeedbacks) => ({ ...prevFeedbacks, [requestId]: "" })); // Clear feedback input
    } catch (error) {
      console.error("Error sending feedback:", error);
    }
  };

  const filteredRequests = (requests) => {
    if (filter === "accepted")
      return requests.filter(
        (request) => request.status.toLowerCase() === "accepted"
      );
    if (filter === "rejected")
      return requests.filter(
        (request) => request.status.toLowerCase() === "rejected"
      );
    return requests;
  };

  useEffect(() => {
    const fetchDueAmount = async () => {
      if (currentUser) {
        try {
          const response = await axiosSecure.s.get(
            `api/payments/totalDueAmount/${currentUser._id}`
          );
          if (response.status === HttpStatusCode.Ok) {
            setAmount(Number(response.data.balance));
            setIsOverDue(response.data.isOverDue);
          }
        } catch (error) {
          console.error("Payment error:", error);
        }
      }
    };

    fetchDueAmount();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="mt-20 mx-auto max-w-4xl p-6 bg-white dark:bg-slate-900 dark:shadow-slate-500 shadow-lg rounded-lg text-center">
        <Scroll />
        <h1 className="text-4xl font-bold mb-6 text-gray-800 dark:text-white">
          You have to login first
        </h1>
        <Link to="/login">
          <button className="bg-secondary rounded-xl p-5 text-white px-20 hover:scale-105 duration-300">
            Go to Login
          </button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mt-20 mx-auto max-w-4xl p-6 bg-white dark:bg-slate-900 dark:shadow-slate-500 dark:mt-25 shadow-lg rounded-lg">
        <Scroll />
        <h1 className="text-4xl font-bold mb-6 text-gray-800 text-center dark:text-white">
          Special Waste Collection Request
        </h1>

        {isOverDue && (
          <div className="flex justify-center mb-4">
            <p className="text-red-500 text-lg">
              You have overdue payment. Please pay before scheduling.
            </p>
          </div>
        )}

        {!isOverDue && (
          <div className="flex justify-center mt-6 mb-4">
            <Link to="/scheduleRequest">
              <button className="bg-secondary rounded-xl p-5 text-white px-20 hover:scale-105 duration-300">
                Schedule New Request
              </button>
            </Link>
          </div>
        )}

        <div className="flex justify-center mb-4">
          <button
            className={`p-2 mx-2 ${
              activeTab === "pending"
                ? "bg-secondary text-white"
                : "bg-gray-200"
            } rounded-xl`}
            onClick={() => setActiveTab("pending")}
          >
            Pending Requests
          </button>
          <button
            className={`p-2 mx-2 ${
              activeTab === "previous"
                ? "bg-secondary text-white"
                : "bg-gray-200"
            } rounded-xl`}
            onClick={() => setActiveTab("previous")}
          >
            Previous Requests
          </button>
        </div>

        {activeTab === "pending" && (
          <div>
            <h2 className="text-2xl font-semibold mb-4 dark:text-white">
              Pending Requests
            </h2>
            {pendingRequests.length > 0 ? (
              <ul>
                {pendingRequests.map((request) => (
                  <li
                    key={request._id}
                    className="mb-2 p-2 border rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <p>
                        <strong>Type:</strong> {request.type}
                      </p>
                      <p>
                        <strong>Description:</strong> {request.description}
                      </p>
                      <p>
                        <strong>Status:</strong> {request.status}
                      </p>
                      <p>
                        <strong>Pickup Date: </strong>
                        {new Date(request.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p>
                        <strong>Pickup Time: </strong>
                        {request.time}
                      </p>
                    </div>

                    <div className="flex items-center">
                      <button
                        className="ml-2 text-blue-500"
                        onClick={() => handleEditClick(request)}
                      >
                        <FaRegEdit size={20} />
                      </button>
                      <button
                        className="ml-2 text-red-500"
                        onClick={() => handleDeleteRequest(request._id)}
                      >
                        <FaTrashAlt size={20} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="dark:text-white">No pending requests found.</p>
            )}
          </div>
        )}

        {activeTab === "previous" && (
          <div>
            <h2 className="text-2xl font-semibold mb-4 flex items-center justify-between dark:text-white">
              Previous Requests
              <select
                className="ml-4 p-2 border rounded-lg text-lg dark:text-black"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </h2>
            {filteredRequests([...acceptedRequests, ...rejectedRequests])
              .length > 0 ? (
              <ul>
                {filteredRequests([
                  ...acceptedRequests,
                  ...rejectedRequests,
                ]).map((request) => (
                  <li
                    key={request._id}
                    className="relative mb-2 p-2 border rounded-lg flex justify-between items-center"
                  >
                    <div className="flex-1">
                      <p>
                        <strong>Type:</strong> {request.type}
                      </p>
                      <p>
                        <strong>Description:</strong> {request.description}
                      </p>
                      <p>
                        <strong>Status:</strong> {request.status}
                      </p>
                      <p>
                        <strong>Pickup Date: </strong>
                        {new Date(request.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p>
                        <strong>Pickup Time: </strong> {request.time}
                      </p>
                      {request.feedback && (
                        <p>
                          <strong>Feedback: </strong> {request.feedback}
                        </p>
                      )}
                      {request.status === "Accepted" && (
                        <div>
                          <input
                            type="text"
                            placeholder="Leave your feedback"
                            value={feedbacks[request._id] || ""}
                            onChange={(e) =>
                              handleFeedbackChange(request._id, e.target.value)
                            }
                            className="mt-2 p-2 border rounded-lg"
                          />
                          <button
                            className="ml-2 bg-secondary text-white p-2 rounded-lg"
                            onClick={() => handleSendFeedback(request._id)}
                          >
                            Send Feedback
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Status Circle */}
                    <div className="absolute top-2 right-2">
                      {request.status === "Accepted" && (
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      )}
                      {request.status === "Rejected" && (
                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="dark:text-white">No previous requests found.</p>
            )}
          </div>
        )}
      </div>

      {/* Modal for editing a request */}
      {isModalOpen && (
        <EditRequestModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onUpdate={handleUpdateRequest}
          request={selectedRequest}
        />
      )}
    </>
  );
};

export default GarbageRequest;
