// components/InquiryForm.jsx
import React, { useState } from "react";
import useAxiosSecure from "../../../../hooks/useAxiosSecure";
import { toast } from "react-toastify";

function InquiryForm({ onClose }) {
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const axiosSecure = useAxiosSecure();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosSecure.post("/api/inquiries", {
        topic,
        message,
      });
      toast.success(response.data.message); // Show success toast
      // Reset form
      setTopic("");
      setMessage("");
    } catch (error) {
      toast.error("Failed to submit inquiry"); // Show error toast
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
      <input
        type="text"
        placeholder="Topic"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        required
        className="border p-2"
      />
      <textarea
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        className="border p-2"
      />
      <button type="submit" className="bg-blue-500 text-white p-2">
        Submit Inquiry
      </button>
    </form>
  );
}

export default InquiryForm;
