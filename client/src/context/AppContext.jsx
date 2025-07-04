// client/src/context/AppContext.js
import React, { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContent = createContext();

export const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null); // Initialize as null
  const [loadingAuth, setLoadingAuth] = useState(true); // New state to indicate initial auth loading

  // No need for axios.defaults.withCredentials = true here,
  // as we explicitly set it on each relevant request below.

  // This function will now handle both authentication check and user data fetching
  const getAuthState = async () => {
    setLoadingAuth(true); // Start loading when checking auth state
    try {
      // Call the backend endpoint that returns user data if authenticated
      // Your backend's /api/auth/get-user-data should be protected by authMiddleware
      const response = await axios.get(backendUrl + "/api/auth/get-user-data", {
        withCredentials: true, // Important: send cookies with the request
      });

      if (response.data.success) {
        setIsLoggedin(true);
        setUserData(response.data.userData); // Set user data directly from this response
        // toast.success("Authentication state verified!"); // Optional: for debugging
      } else {
        // If backend returns success:false, it means user is not found or token invalid
        console.warn("getAuthState: Backend indicated failure to get user data:", response.data.message);
        setIsLoggedin(false);
        setUserData(null);
        // No toast here, as 401 will be caught below
      }
    } catch (error) {
      console.error("Auth state check failed:", error); // Log the error for debugging

      setIsLoggedin(false);
      setUserData(null); // Ensure state is reset on error

      // Handle specific HTTP status codes
      if (error.response) {
        if (error.response.status === 401) {
          // This means the user is not authenticated (no token, invalid token, expired token)
          // This is the expected behavior for a logged-out user or invalid session
          // No need for a toast here unless you want to explicitly tell the user they are logged out
          // toast.info("You are currently logged out.");
        } else if (error.response.status === 404) {
          toast.error("Authentication endpoint not found.");
        } else {
          toast.error(error.response.data.message || "An error occurred during authentication check.");
        }
      } else if (error.request) {
        // The request was made but no response was received (e.g., network error, backend down)
        toast.error("Cannot connect to the authentication server. Please check your network or try again later.");
      } else {
        // Something happened in setting up the request that triggered an Error
        toast.error("An unexpected error occurred: " + error.message);
      }
    } finally {
      setLoadingAuth(false); // Auth check is complete
    }
  };

  // The separate getUserData is now redundant if getAuthState returns all user data.
  // If you have other parts of your app that need to specifically re-fetch user data
  // without re-checking auth, you can keep it, but ensure it's protected by middleware.
  // For now, I'm assuming getAuthState is the primary way to get user data on app load.
  // If you need a separate getUserData for other purposes, let me know.
  // For the context, we'll keep the name getUserData for consistency with other components.
  const getUserDataOnDemand = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/auth/get-user-data", { // Use the same endpoint
        withCredentials: true,
      });
      if (data.success) {
        setUserData(data.userData);
        setIsLoggedin(true); // Ensure login state is updated if this is called after login
      } else {
        toast.error(data.message || "Failed to retrieve user data.");
        setUserData(null);
        setIsLoggedin(false);
      }
    } catch (error) {
      console.error("Failed to fetch user data on demand:", error);
      // Only show toast if it's not a 401 (which means user is logged out)
      if (error.response?.status !== 401) {
        toast.error("Failed to fetch user data.");
      }
      setUserData(null);
      setIsLoggedin(false);
    }
  };


  const logout = async () => {
    try {
      const { data } = await axios.post(backendUrl + "/api/auth/logout", {}, {
        withCredentials: true,
      });

      if (data.success) {
        setIsLoggedin(false);
        setUserData(null);
        toast.success(data.message || "Logged out successfully!");
        // No navigate here, Navbar component will handle navigation after logout
      } else {
        toast.error(data.message || "Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("An error occurred during logout.");
    }
  };

  useEffect(() => {
    getAuthState(); // Initial check on component mount
  }, []); // Empty dependency array means it runs once on mount

  return (
    <AppContent.Provider
      value={{
        backendUrl,
        isLoggedin,
        setIsLoggedin,
        userData,
        setUserData,
        getUserData: getUserDataOnDemand, // Export the on-demand version
        logout,
        loadingAuth, // Export loading state
      }}
    >
      {/* Render children only when authentication state has been checked */}
      {!loadingAuth ? children : (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          Loading application...
        </div>
      )}
    </AppContent.Provider>
  );
};