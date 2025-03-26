// Authentication utilities for JWT

const API_URL = import.meta.env.VITE_API_URL;

// Function to handle user registration
export const registerUser = async (userData) => {
  // Make sure we include a role to avoid "Invalid role specified" error
  const registrationData = {
    ...userData,
    role: userData.role || "customer" // Default to "customer" if role not provided
  };

  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(registrationData),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Registration failed');
  }
  
  // If the backend returns a token on registration, store it
  if (data.token) {
    localStorage.setItem('token', data.token);
    
    // Make sure user data includes photoUrl if it was provided
    if (userData.photoUrl && data.user && !data.user.photoUrl) {
      data.user.photoUrl = userData.photoUrl;
    }
    
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  
  return data;
};

// Function to handle user login
export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    // Store token and user info
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  } catch (error) {
    throw error;
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Get the current user
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Get the auth token
export const getToken = () => {
  return localStorage.getItem('token');
};

// Log out user
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Create auth header for protected API requests
export const authHeader = () => {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}; 