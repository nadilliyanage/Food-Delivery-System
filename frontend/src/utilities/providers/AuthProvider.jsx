import React, { createContext, useEffect, useState } from "react";
import axios from "axios";
import {
  registerUser as registerUserFn,
  loginUser as loginUserFn,
  logout as logoutUserFn,
  getCurrentUser,
  isAuthenticated,
} from "../../utils/auth";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loader, setLoader] = useState(true);
  const [error, setError] = useState("");

  // Sign up new user
  const signUp = async (userData) => {
    try {
      setLoader(true);
      const result = await registerUserFn(userData);

      // Ensure the user data is properly set
      if (result && result.user) {
        // Make sure photoUrl is included in the user data
        if (userData.photoUrl && !result.user.photoUrl) {
          result.user.photoUrl = userData.photoUrl;
        }
        setUser(result.user);
      }

      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoader(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      setLoader(true);
      const result = await loginUserFn(credentials);
      setUser(result.user);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoader(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await logoutUserFn();
      setUser(null);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Update user profile
  const updateUser = async (userData) => {
    try {
      // Make API call to update user
      const response = await axios.patch(
        `http://localhost:3000/api/auth/users/${userData._id}`,
        userData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Update local storage
      if (response.data) {
        localStorage.setItem("user", JSON.stringify(response.data));
        setUser(response.data);
      }

      return response.data;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Google login - you would implement this with your backend
  const googleLogin = async () => {
    try {
      setLoader(true);
      // This would call your backend's Google auth endpoint
      throw new Error("Google login not implemented with JWT yet");
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoader(false);
    }
  };

  // Check authentication status on mount and when localStorage changes
  useEffect(() => {
    const checkAuth = () => {
      if (isAuthenticated()) {
        const currentUser = getCurrentUser();
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setLoader(false);
    };

    checkAuth();

    // Listen for storage events to sync auth state across tabs
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const contextValue = {
    user,
    signUp,
    login,
    logout,
    updateUser,
    googleLogin,
    error,
    setError,
    loader,
    setLoader,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
