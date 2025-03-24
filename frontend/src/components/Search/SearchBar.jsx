import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  const handleChange = (event) => {
    const newQuery = event.target.value;
    setQuery(newQuery);
    onSearch(newQuery); // Call onSearch in real-time
  };

  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent page refresh
    onSearch(query); // Perform search action
  };

  return (
    <div className="flex">
      <form onSubmit={handleSubmit} className="flex items-center p-2">
        <input
          type="text"
          name="query"
          value={query}
          onChange={handleChange}
          placeholder="Search"
          title="Enter search keyword"
          className="flex-1 p-2 border-2 border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-secondary"
        />
        <button
          type="submit"
          title="Search"
          className="p-3 bg-secondary text-white rounded-r-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-secondary"
        >
          <FaSearch />
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
