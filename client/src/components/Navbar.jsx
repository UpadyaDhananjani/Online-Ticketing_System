// Navbar.jsx
import React, { useContext, useState } from 'react';
import { assets } from '../assets/assets';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';
// No App.css import here, as styles are managed by App.js

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { userData, setIsLoggedin, setUserData, backendUrl } = useContext(AppContent); // Ensure these are available
  const [showDropdown, setShowDropdown] = useState(false);

  const sendVerificationOtp = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + '/api/auth/send-verify-otp');

      if (data.success) {
        navigate('/email-verify');
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setShowDropdown(false); // Close dropdown after action
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
    setShowDropdown(false); // Close dropdown after navigation
  };

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + '/api/auth/logout');
      if (data.success) {
        setIsLoggedin(false);
        setUserData(null);
        navigate('/');
        toast.success("Logged out successfully!");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setShowDropdown(false); // Close dropdown after action
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Logic to hide the separate Login button on auth pages is no longer strictly needed
  // because the "Login" option is now inside the dropdown.
  // const hideLoginBtn = ['/login', '/reset-password', '/email-verify'].includes(location.pathname);

  return (
    // The main Navbar container. 'justify-between' places items at opposite ends.
    <div className="w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0 z-50">
      {/* Left Section: Logo */}
      <img
        src={assets.logo}
        alt="logo"
        className="w-28 sm:w-32 cursor-pointer"
        onClick={() => navigate('/')}
      />

      {/* Right Section: User Initial / Login Button and Dropdown */}
      <div className="relative"> {/* Essential for dropdown positioning */}
        {/* The clickable element (User Initial or Login Button) */}
        {userData ? (
          <div
            className="user-initial-circle" // Styled in App.js
            onClick={toggleDropdown}
          >
            {userData.name?.[0]?.toUpperCase() || 'U'}
          </div>
        ) : (
          // If not logged in, show a default icon/initial or a login button that triggers dropdown
          // For simplicity, let's keep a generic "U" or a "Login" button that triggers the dropdown
          // as per the request to have "Login" *in* the dropdown.
          // If you prefer a "Login" button visible directly, use the old button code outside this relative div.
          // For now, making the "U" visible always, and its click opens the dropdown with Login.
          // Let's use a simplified clickable div if not logged in to consistent trigger dropdown.
          <div
            className="user-initial-circle" // Reusing style, could be another class if design differs
            onClick={toggleDropdown}
            // Add a tooltip or text if not logged in so user knows what it is
            title="Account"
          >
            {/* If you want a specific "Login" text instead of 'U' when not logged in, change this */}
            {'U'}
          </div>
        )}

        {/* The Dropdown Menu (Conditionally rendered) */}
        {showDropdown && (
          // Use 'user-dropdown-menu' class which aligns to the right
          <div className="user-dropdown-menu">
            <ul className="list-none m-0 p-0">
              {userData ? (
                // If logged in: Show Verify Email and Logout
                <>
                  {!userData.isAccountVerified && (
                    <li onClick={sendVerificationOtp} className="dropdown-item">
                      Verify email
                    </li>
                  )}
                  <li onClick={logout} className="dropdown-item">
                    Logout
                  </li>
                </>
              ) : (
                // If NOT logged in: Show Login
                <li onClick={handleLoginClick} className="dropdown-item">
                  Login
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