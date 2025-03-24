// Reusable Input Component: InputField.jsx
import React from "react";

const InputField = ({ type = "text", placeholder, value, onChange, options }) => {
  return type === "select" ? (
    <select value={value} onChange={onChange} className="px-4 py-2 border rounded-md">
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ) : (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2 border rounded-md"
    />
  );
};

export default InputField;
