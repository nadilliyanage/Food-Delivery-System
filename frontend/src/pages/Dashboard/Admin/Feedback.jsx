import { useEffect, useState } from "react";
import useAxiosFetch from "../../../hooks/useAxiosFetch";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { MdDelete, MdPushPin } from "react-icons/md";
import Button from "../../../components/Button/Button";
import Table from "../../../components/Table/Table";
import InputField from "../../../components/InputField/InputField";
import FeedbackCard from "../../../components/FeedbackCard/FeedbackCard";

const Feedbacks = () => {
  const axiosFetch = useAxiosFetch();
  const axiosSecure = useAxiosSecure();
  const [feedbacks, setFeedbacks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchFeedbacks = () => {
    axiosFetch
      .get("/api/garbageRequests")
      .then((res) => {
        setFeedbacks(res.data);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);


  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleClearFeedback = async (id) => {
    try {
      // Find the current feedback object
      const currentFeedback = feedbacks.find(feedback => feedback._id === id);
      if (!currentFeedback) return;

      // Create updated feedback object with all existing fields but empty feedback
      const updatedData = {
        ...currentFeedback,
        feedback: ""
      };

      // Use PUT request with complete object
      await axiosSecure.put(`/api/garbageRequests/${id}`, updatedData);
      
      // Refresh the feedbacks list after clearing
      fetchFeedbacks();
    } catch (err) {
      console.error("Error clearing feedback:", err);
    }
  };

  const filteredFeedback = feedbacks.filter(
    (feedback) =>
      feedback?.username?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      feedback.feedback
  );

  return (
    <div className="px-4 sm:px-0">
      <h1 className="text-center text-4xl font-bold my-7">Customer Feedbacks</h1>

      <div className="mb-4 flex gap-4">
        <InputField
          type="text"
          placeholder="Search feedback by user"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFeedback.length === 0 ? (
          <p className="text-center text-gray-500">No feedback available.</p>
        ) : (
          filteredFeedback.map((feedback) => (
            <FeedbackCard
              key={feedback._id}
              username={feedback?.username}
              feedback={feedback?.feedback}
              onClearFeedback={() => handleClearFeedback(feedback._id)}
            />
          ))
        )}
      </div>
    </div>
  );
};


export default Feedbacks;
