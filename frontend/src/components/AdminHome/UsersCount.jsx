import React, { useEffect, useState } from "react";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { FaUsers } from "react-icons/fa";
import { FaUserSlash } from "react-icons/fa";

const UsersCount = () => {
  const [plantCount, setPlantCount] = useState(0);
  const axiosSecure = useAxiosSecure();

  const fetchPlantCount = async () => {
    try {
      const response = await axiosSecure.get("users");
      setPlantCount(response.data.length);
    } catch (error) {
      console.error("Error fetching plants:", error);
    }
  };

  useEffect(() => {
    fetchPlantCount();
  }, []);

  return (
    <div>
      <div className=" gap-4 relative w-full px-4 mt-8 sm:grid-cols-4">
        <div className="flex items-center bg-white border rounded-sm overflow-hidden shadow dark:bg-gray-800">
          <div className="p-4 bg-blue-400">
          <FaUsers className="text-5xl text-white" />
          </div>
          <div className="px-4 text-gray-700 dark:text-white">
            <h3 className="text-sm tracking-wider">Total Users Count</h3>
            <p className="text-3xl">{plantCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersCount;