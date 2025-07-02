// Navbar.jsx
import React, { useContext, useState } from 'react';
import { assets } from '../assets/assets';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, setIsLoggedin, setUserData, backendUrl } = useContext(AppContent);
  const [showDropdown, setShowDropdown] = useState(false);

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
      setShowDropdown(false);
    }
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

      {/* User Profile / Login Button Section */}
      <div className="relative">
        {userData ? (
          <>
            <div className="user-initial-circle" onClick={toggleDropdown}>
              {userData.name?.[0]?.toUpperCase() || 'U'}
            </div>

            {showDropdown && (
              <div className="user-dropdown-menu">
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
