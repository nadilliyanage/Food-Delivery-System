import React from "react";
import { Link } from "react-router-dom";

const GarbageCollectionSection = () => {
  return (
    <div className="md:w-[80%] mx-auto my-28 px-6 lg:px-0">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-800 dark:text-white">
          Request Garbage Collection
        </h1>
        <p className="mt-4 text-lg font-medium text-gray-600 dark:text-gray-300">
          Submit a request for garbage collection in your area. Provide details on the type of waste and schedule a convenient pickup time.
        </p>
        <Link to="/garbageRequest">
          <div className="mt-8 bg-secondary rounded-md text-white font-bold hover:scale-125 transition-transform duration-300 hover:shadow-lg py-3 px-6 inline-block">
            Request Now
          </div>
        </Link>
      </div>
    </div>
  );
};

export default GarbageCollectionSection;
