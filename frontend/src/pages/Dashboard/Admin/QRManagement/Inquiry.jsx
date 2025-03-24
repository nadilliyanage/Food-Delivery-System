import React, { useState, useEffect } from "react";
import useAxiosSecure from "../../../../hooks/useAxiosSecure";
import { ToastContainer, toast } from "react-toastify";
import SmallModal from "../../../../components/Modal/Modal";

const Inquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [isSmallModalOpen, setIsSmallModalOpen] = useState(false);
  const [selectedInquiryId, setSelectedInquiryId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const axiosSecure = useAxiosSecure();

  // Fetch inquiries from the backend
  const fetchInquiries = async () => {
    try {
      const response = await axiosSecure.get("/api/inquiries");
      setInquiries(response.data);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      toast.error("Failed to fetch inquiries");
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  // Handle status update
  const handleUpdateStatus = async () => {
    if (!selectedInquiryId || !selectedStatus) return;
    try {
      await axiosSecure.put(`/api/inquiries/${selectedInquiryId}`, {
        status: selectedStatus,
      });
      setInquiries((prev) =>
        prev.map((inquiry) =>
          inquiry._id === selectedInquiryId
            ? { ...inquiry, status: selectedStatus }
            : inquiry
        )
      );
      toast.success(`Status updated to ${selectedStatus}`);
      setIsSmallModalOpen(false);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const confirmUpdate = (inquiryId, status) => {
    setSelectedInquiryId(inquiryId);
    setSelectedStatus(status);
    setIsSmallModalOpen(true);
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-6">Inquiries</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-4">Inquiry ID</th>

              <th className="border border-gray-300 p-4">Message</th>
              <th className="border border-gray-300 p-4">Status</th>
              <th className="border border-gray-300 p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inquiry) => (
              <tr key={inquiry._id}>
                <td className="border border-gray-300 p-4">{inquiry._id}</td>

                <td className="border border-gray-300 p-4">
                  {inquiry.message}
                </td>
                <td className="border border-gray-300 p-4">
                  <span
                    className={`font-semibold ${
                      inquiry.status === "Pending"
                        ? "text-yellow-500"
                        : inquiry.status === "Resolved"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {inquiry.status}
                  </span>
                </td>
                <td className="border border-gray-300 p-4">
                  <button
                    onClick={() => confirmUpdate(inquiry._id, "Resolved")}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg mr-2"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => confirmUpdate(inquiry._id, "Rejected")}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SmallModal
        isOpen={isSmallModalOpen}
        onClose={() => setIsSmallModalOpen(false)}
        title={`Confirm ${selectedStatus}`}
      >
        <div className="text-center">
          <p>Are you sure you want to mark this inquiry as {selectedStatus}?</p>
          <div className="mt-6 flex justify-center space-x-4">
            <button
              onClick={handleUpdateStatus}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
            >
              Confirm
            </button>
            <button
              onClick={() => setIsSmallModalOpen(false)}
              className="px-6 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      </SmallModal>

      <ToastContainer />
    </div>
  );
};

export default Inquiries;
