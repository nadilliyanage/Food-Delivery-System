import React from "react";
import useUser from "../../hooks/useUser";
import DashboardNavigate from "../../routes/DashboardNavigate";
import Loader from "../../components/Loader/Loader";

const Dashboard = () => {
  const { currentUser, isLoading } = useUser();
  const role = currentUser?.role;

  if (isLoading) {
    return <Loader />;
  }

  return <DashboardNavigate />;
};

export default Dashboard;
