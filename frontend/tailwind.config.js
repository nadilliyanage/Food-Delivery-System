/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', 
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#f97316', // Primary Orange
          light: '#ffedd5',  // Light Orange
          dark: '#ea580c',   // Dark Orange
        },
        text: {
          primary: '#111827',  // Primary Text
          secondary: '#4b5563', // Secondary Text
          light: '#9ca3af', // Light Text
        },
        background: {
          primary: '#f9fafb', // Primary Background
          white: '#ffffff', // White
          dark: '#1f2937', // Dark Background
        },
        status: {
          success: '#22c55e', // Success
          successLight: '#f0fdf4', // Success Light
          warning: '#facc15', // Warning Yellow
          error: '#ef4444', // Error Red
        },
        border: {
          light: '#e5e7eb', // Light Border
          DEFAULT: '#d1d5db', // Default Border
          dark: '#4b5563', // Dark Border
        },
      },
    },
  },
  plugins: [],
}
