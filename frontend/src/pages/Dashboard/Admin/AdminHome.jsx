import React, { useEffect, useState } from "react";
import useUser from "../../../hooks/useUser";

const AdminHome = () => {

  const { currentUser } = useUser();
  
  return (
    <div>
      <h1 className="text-4xl font-bold my-7">
        Welcome Back,{" "}
        <span className="text-secondary">{currentUser?.name}</span>!
      </h1>
    </div>
  );
};

export default AdminHome;
