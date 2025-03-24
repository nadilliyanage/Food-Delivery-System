// Reusable Button Component: Button.jsx
import React from "react";

const Button = ({ onClick, children, className }) => {
  return (
    <button onClick={onClick} className={`py-2 px-4 rounded-md ${className}`}>
      {children}
    </button>
  );
};

export default Button;
