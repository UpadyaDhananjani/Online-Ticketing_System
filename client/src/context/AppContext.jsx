import React, { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContent = createContext();

export const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null); // initialize as null

  const getAuthState = async () => {
    try {
      // Important: send credentials to send cookies
      const { data } = await axios.get(backendUrl + "/api/auth/is-auth", {
        withCredentials: true,
      });

      if (data.success) {
        setIsLoggedin(true);
        getUserData(); // Fetch user data if authenticated
      } else {
        setIsLoggedin(false);
        setUserData(null); // Clear user data if not authenticated
      }
    } catch (error) {
      console.error("Auth state check failed:", error); // Log the error for debugging
      toast.error("Failed to verify authentication state."); // More generic error for user
      setIsLoggedin(false);
      setUserData(null); // Ensure state is reset on error
    }
  };

  const getUserData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/data", {
        withCredentials: true,
      });
      if (data.success) {
        setUserData(data.userData);
      } else {
        toast.error(data.message || "Failed to retrieve user data."); // Add fallback message
        setUserData(null); // Clear data if fetch fails
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error); // Log the error for debugging
      toast.error("Failed to fetch user data.");
      setUserData(null); // Ensure user data is cleared on error
    }
  };

  // --- NEW LOGOUT FUNCTION ---
  const logout = async () => {
    try {
      // Make an API call to your backend's logout endpoint
      // This endpoint should clear the session cookie on the server
      const { data } = await axios.post(backendUrl + "/api/auth/logout", {}, {
        withCredentials: true,
      });

      if (data.success) {
        setIsLoggedin(false); // Update login state
        setUserData(null);    // Clear user data
        toast.success(data.message || "Logged out successfully!"); // Show success message
        // You might want to redirect the user to the home page or login page here
        // navigate("/"); // If you pass navigate from Login or use a global navigation hook
      } else {
        toast.error(data.message || "Logout failed. Please try again."); // Show error message
      }
    } catch (error) {
      console.error("Logout error:", error); // Log the error for debugging
      toast.error("An error occurred during logout."); // Generic error message
    }
  };
  // -------------------------

  useEffect(() => {
    getAuthState();
  }, []);

  return (
    <AppContent.Provider
      value={{
        backendUrl,
        isLoggedin,
        setIsLoggedin,
        userData,
        setUserData,
        getUserData,
        logout, // <<< EXPORT THE NEW LOGOUT FUNCTION
      }}
    >
      {children}
    </AppContent.Provider>
  );
};