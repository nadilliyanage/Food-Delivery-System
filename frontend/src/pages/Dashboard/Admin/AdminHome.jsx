import React, { useEffect, useState } from "react";
import useUser from "../../../hooks/useUser";
import useAxiosFetch from "../../../hooks/useAxiosFetch";
import GarbageRequestCount from "../../../components/AdminHome/GarbageRequestCount";
import PendingRequestsCount from "../../../components/AdminHome/PendingRequestsCount";
import AcceptedRequestsCount from "../../../components/AdminHome/AcceptedRequestsCount";
import RejectedRequestsCount from "../../../components/AdminHome/RejectedRequestsCount";
import UsersCount from "../../../components/AdminHome/UsersCount";
import FeedbackCard from "../../../components/FeedbackCard/FeedbackCard";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register the necessary components
ChartJS.register(ArcElement, Tooltip, Legend);

const AdminHome = () => {
  const { currentUser } = useUser();
  const axiosFetch = useAxiosFetch();
  const [users, setUsers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    axiosFetch
      .get("/users")
      .then((res) => setUsers(res.data))
      .catch((err) => console.log(err));
  }, [axiosFetch]);

  useEffect(() => {
    axiosFetch
      .get("/api/garbageRequests")
      .then((res) => setFeedbacks(res.data))
      .catch((err) => console.log(err));
  }, [axiosFetch]);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [
          acceptedResponse,
          pendingResponse,
          rejectedResponse,
          totalResponse,
        ] = await Promise.all([
          axiosFetch.get("api/garbageRequests/accepted"),
          axiosFetch.get("api/garbageRequests/pending"),
          axiosFetch.get("api/garbageRequests/rejected"),
          axiosFetch.get("api/garbageRequests"),
        ]);

        setAcceptedCount(acceptedResponse.data.length);
        setPendingCount(pendingResponse.data.length);
        setRejectedCount(rejectedResponse.data.length);
        setTotalCount(totalResponse.data.length);
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    };

    fetchCounts();
  }, [axiosFetch]);

  const filteredFeedback = feedbacks.filter(
    (feedback) =>
      feedback?.username?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      feedback.feedback
  );

  const latestFeedbacks = filteredFeedback.slice(-3).reverse();

  const createChartData = (value, label, color) => ({
    labels: [label, "Other Requests"],
    datasets: [
      {
        data: [value, 100 - value],
        backgroundColor: [color, "#f0f0f0"],
        hoverBackgroundColor: [color, "#e0e0e0"],
      },
    ],
  });

  const percentageAccepted =
    totalCount > 0 ? (acceptedCount / totalCount) * 100 : 0;
  const percentagePending =
    totalCount > 0 ? (pendingCount / totalCount) * 100 : 0;
  const percentageRejected =
    totalCount > 0 ? (rejectedCount / totalCount) * 100 : 0;

  return (
    <div>
      <h1 className="text-4xl font-bold my-7">
        Welcome Back,{" "}
        <span className="text-secondary">{currentUser?.name}</span>!
      </h1>

      <div
        className="flex flex-col sm:flex-row gap-0 relative w-full"
        data-aos="fade-up"
        data-aos-duration="1500"
      >
        <UsersCount />
        <GarbageRequestCount />
        <PendingRequestsCount />
        <AcceptedRequestsCount />
        <RejectedRequestsCount />
      </div>

      {/* Pie Charts */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-row justify-between gap-4 overflow-x-auto">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold mb-4 text-center">
              Accepted Requests
            </h3>
            <div className="w-44 max-w-xs mx-auto">
              <Doughnut
                data={createChartData(
                  percentageAccepted,
                  "Accepted Requests",
                  "#4CAF50"
                )}
              />
            </div>
            <div className="text-center mt-2 font-bold">
              {percentageAccepted.toFixed(1)}%
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold mb-4 text-center">
              Pending Requests
            </h3>
            <div className="w-44 max-w-xs mx-auto">
              <Doughnut
                data={createChartData(
                  percentagePending,
                  "Pending Requests",
                  "#EAB308"
                )}
              />
            </div>
            <div className="text-center mt-2 font-bold">
              {percentagePending.toFixed(1)}%
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold mb-4 text-center">
              Rejected Requests
            </h3>
            <div className="w-44 max-w-xs mx-auto">
              <Doughnut
                data={createChartData(
                  percentageRejected,
                  "Rejected Requests",
                  "#FF6384"
                )}
              />
            </div>
            <div className="text-center mt-2 font-bold">
              {percentageRejected.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Feedback section */}
      <div className="mt-8 mb-10">
        <h2 className="text-2xl font-bold mb-4">Latest Feedback</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestFeedbacks.length === 0 ? (
            <p className="text-center text-gray-500">No feedback available.</p>
          ) : (
            latestFeedbacks.map((feedback) => (
              <FeedbackCard
                key={feedback._id}
                username={feedback?.username}
                feedback={feedback?.feedback}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
