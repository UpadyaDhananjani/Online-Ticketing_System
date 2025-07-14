import React, { useContext, useState } from 'react';
import { assets } from '../assets/assets';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { userData, setIsLoggedin, setUserData, backendUrl, isLoggedin } = useContext(AppContent);
  const [showDropdown, setShowDropdown] = useState(false);

  // --- DEBUG LOG START ---
  console.log("Navbar: userData:", userData);
  console.log("Navbar: isLoggedin:", isLoggedin);
  if (userData) {
    console.log("Navbar: userData.isAccountVerified:", userData.isAccountVerified);
  }
  // --- DEBUG LOG END ---

  const sendVerificationOtp = async () => {
    if (!userData || !userData.id) { // Use userData.id as per AppContext structure
      toast.error("User not logged in or user ID is missing. Cannot send OTP.");
      setShowDropdown(false);
      return;
    }

    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + '/api/auth/send-verify-otp', {
        userId: userData.id // Send the userId in the request body
      });

      if (data.success) {
        navigate('/email-verify');
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "An error occurred while sending OTP.";
      toast.error(errorMsg);
    } finally {
      setShowDropdown(false);
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
    setShowDropdown(false);
  };

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + '/api/auth/logout');
      if (data.success) {
        setIsLoggedin(false); // Set login status to false
        setUserData(null);    // Clear user data
        navigate('/login');   // Navigate to login page
        toast.success("Logged out successfully!");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setShowDropdown(false);
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0 z-50">
      {/* Left Section: Logo */}
      <img
        src={assets.logo}
        alt="logo"
        className="w-28 sm:w-32 cursor-pointer"
        onClick={() => navigate('/')}
      />

      {/* Right Section: User Initial / Login Button and Dropdown */}
      <div className="relative">
        {isLoggedin && userData ? ( // Render user initial if logged in and user data exists
          <div
            className="user-initial-circle"
            onClick={toggleDropdown}
            title={userData ? userData.name : "Account"}
          >
            {userData?.name?.[0]?.toUpperCase() || 'U'}
          </div>
        ) : ( // Render login button if not logged in
          <button
            onClick={handleLoginClick}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out"
          >
            Login <span className="ml-1">&rarr;</span>
          </button>
        )}

        {showDropdown && isLoggedin && userData && ( // Only show dropdown if logged in and data exists
          <div className="user-dropdown-menu">
            <ul className="list-none m-0 p-0">
              {userData && userData.name && (
                <li className="dropdown-item font-bold text-indigo-900 cursor-default" style={{cursor:'default'}}>
                  {userData.name}
                </li>
              )}
              {userData && userData.unit && (
                <li className="dropdown-item font-semibold text-indigo-700 cursor-default" style={{cursor:'default'}}>
                  {userData.unit}
                </li>
              )}
              {userData && !userData.isAccountVerified && ( // Show verify email only if user data exists and not verified
                <li onClick={sendVerificationOtp} className="dropdown-item">
                  Verify email
                </li>
              )}
              {userData && ( // Show logout only if user data exists
                <li onClick={logout} className="dropdown-item">
                  Logout
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
