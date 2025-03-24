import React from "react";
import { SyncLoader } from "react-spinners";

const Loader = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <SyncLoader color="#97C14B" size={18} />
    </div>
  );
};

export default Loader;
