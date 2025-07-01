// Navbar.jsx
import React, { useContext, useState } from 'react';
import React, { useContext, useState } from 'react'; // Import useState for dropdown visibility
import { assets } from '../assets/assets';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';
//import '../App.css'; // Ensure App.css is imported for styling
//import '../App.css'; // Ensure App.css is imported for styling

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, setIsLoggedin, setUserData, backendUrl } = useContext(AppContent); // Ensure backendUrl is available from context
  const [showDropdown, setShowDropdown] = useState(false); // State to control dropdown visibility
  const { userData, setIsLoggedin, setUserData, backendUrl } = useContext(AppContent); // Ensure backendUrl is available from context
  const [showDropdown, setShowDropdown] = useState(false); // State to control dropdown visibility

  // Hide Login button on auth routes
  const hideLoginBtn = ['/login', '/reset-password', '/email-verify'].includes(location.pathname);

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
  };

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + '/api/auth/logout');
      if (data.success) {
        setIsLoggedin(false);
        setUserData(null); // Set to null instead of false for consistency
        navigate('/');
        toast.success("Logged out successfully!");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setShowDropdown(false); // Close dropdown after action
  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + '/api/auth/logout');
      if (data.success) {
        setIsLoggedin(false);
        setUserData(null); // Set to null instead of false for consistency
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

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };
  };

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    // The main Navbar container. Positioned absolutely to be at the top.
    // The main Navbar container. Positioned absolutely to be at the top.
    <div className="w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0 z-50">
      {/* Left Section: Logo */}
      <img
        src={assets.logo}
        alt="logo"
        className="w-28 sm:w-32 cursor-pointer"
        onClick={() => navigate('/')}
      />

      {/* User Profile / Login Button Section */}
      <div className="relative"> {/* Use relative positioning for the dropdown */}
        {userData ? (
          // User is logged in: Show initial and dropdown
          <>
            <div
              className="user-initial-circle" // Apply a class for styling
              onClick={toggleDropdown} // Toggle dropdown on click
            >
              {userData.name?.[0]?.toUpperCase() || 'U'}
            </div>
      {/* User Profile / Login Button Section */}
      <div className="relative"> {/* Use relative positioning for the dropdown */}
        {userData ? (
          // User is logged in: Show initial and dropdown
          <>
            <div
              className="user-initial-circle" // Apply a class for styling
              onClick={toggleDropdown} // Toggle dropdown on click
            >
              {userData.name?.[0]?.toUpperCase() || 'U'}
            </div>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="user-dropdown-menu"> {/* Apply a class for dropdown styling */}
                <ul className="list-none m-0 p-0">
                  {!userData.isAccountVerified && (
                    <li onClick={sendVerificationOtp} className="dropdown-item">
                      Verify email
                    </li>
                  )}
                  <li onClick={logout} className="dropdown-item">
                    Logout
                  </li>
                </ul>
              </div>
            )}
          </>
        ) : (
          // User is not logged in: Show Login button (if not on auth page)
          !hideLoginBtn && (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100 transition-all"
            >
              Login <img src={assets.arrow_icon} alt="arrow" />
            </button>
          )
        )}
      </div>
            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="user-dropdown-menu"> {/* Apply a class for dropdown styling */}
                <ul className="list-none m-0 p-0">
                  {!userData.isAccountVerified && (
                    <li onClick={sendVerificationOtp} className="dropdown-item">
                      Verify email
                    </li>
                  )}
                  <li onClick={logout} className="dropdown-item">
                    Logout
                  </li>
                </ul>
              </div>
            )}
          </>
        ) : (
          // User is not logged in: Show Login button (if not on auth page)
          !hideLoginBtn && (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100 transition-all"
            >
              Login <img src={assets.arrow_icon} alt="arrow" />
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default Navbar;