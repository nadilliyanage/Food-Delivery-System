import { useState, useEffect } from "react";

/**
 * Custom hook to debounce a value.
 *
 * @param {any} value - The value to debounce (e.g., search query).
 * @param {number} delay - The debounce delay in milliseconds.
 *
 * @returns {any} - Debounced value.
 */
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set a timer to update debounced value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clear the timer if the value or delay changes before the timeout is complete
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
