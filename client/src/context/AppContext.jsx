import React, { createContext, useState, useEffect, useReducer } from "react";
import axios from "axios";
import { toast } from "react-toastify";

// Initial state
const initialState = {
  isLoggedin: false,
  userData: null,
  loadingAuth: true,
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loadingAuth: action.payload };
    case "SET_AUTH_STATE":
      return {
        ...state,
        isLoggedin: action.payload.isLoggedin,
        userData: action.payload.userData,
        loadingAuth: false,
      };
    case "LOGOUT":
      return {
        ...state,
        isLoggedin: false,
        userData: null,
        loadingAuth: false,
      };
    default:
      return state;
  }
};

// Create context
export const AppContext = createContext();
export const AppContent = AppContext; // Alias so old imports still work

export const AppContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Check authentication state
  const checkAuthState = async () => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const response = await axios.get(`${backendUrl}/api/auth/get-user-data`, {
        withCredentials: true,
      });

      if (response.data.success) {
        dispatch({
          type: "SET_AUTH_STATE",
          payload: { isLoggedin: true, userData: response.data.userData },
        });
        localStorage.setItem("userData", JSON.stringify(response.data.userData));
      } else {
        dispatch({ type: "LOGOUT" });
        localStorage.removeItem("userData");
      }
    } catch (error) {
      // Fallback: check localStorage if backend request fails
      const storedUser = localStorage.getItem("userData");
      if (storedUser) {
        dispatch({
          type: "SET_AUTH_STATE",
          payload: { isLoggedin: true, userData: JSON.parse(storedUser) },
        });
      } else {
        dispatch({ type: "LOGOUT" });
      }

      if (error.response?.status !== 401) {
        toast.error(
          error.response?.data?.message ||
            "An error occurred during authentication."
        );
      }
    }
  };

  // Login function (manual)
  const login = (data) => {
    dispatch({
      type: "SET_AUTH_STATE",
      payload: { isLoggedin: true, userData: data },
    });
    localStorage.setItem("userData", JSON.stringify(data));
  };

  // Logout function
  const logout = async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/auth/logout`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        dispatch({ type: "LOGOUT" });
        localStorage.removeItem("userData");
        toast.success(response.data.message || "Logged out successfully!");
      } else {
        toast.error(response.data.message || "Logout failed. Please try again.");
      }
    } catch (error) {
      dispatch({ type: "LOGOUT" });
      localStorage.removeItem("userData");
      toast.error("An error occurred during logout.");
    }
  };

  useEffect(() => {
    checkAuthState();
  }, []);

  const value = {
    ...state,
    backendUrl,
    login,
    logout,
    checkAuthState,
    setUserData: (data) =>
      dispatch({
        type: "SET_AUTH_STATE",
        payload: { isLoggedin: true, userData: data },
      }),
    setIsLoggedin: (val) =>
      dispatch({
        type: "SET_AUTH_STATE",
        payload: { isLoggedin: val, userData: state.userData },
      }),
  };

  return (
    <AppContent.Provider value={value}>
      {!state.loadingAuth ? (
        children
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            fontFamily: "sans-serif",
            color: "#666",
          }}
        >
          Loading application...
        </div>
      )}
    </AppContent.Provider>
  );
};
