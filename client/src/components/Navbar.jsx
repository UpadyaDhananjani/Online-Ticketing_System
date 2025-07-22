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

    const sendVerificationOtp = async () => {
        if (!userData || !userData.id) {
            toast.error("User not logged in or user ID is missing. Cannot send OTP.");
            setShowDropdown(false);
            return;
        }

        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.post(backendUrl + '/api/auth/send-verify-otp', {
                userId: userData.id
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
                setIsLoggedin(false);
                setUserData(null);
                navigate('/login');
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
        <div className="w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 relative">
            {/* Left Section: Logo */}
            <img
                src={assets.logo}
                alt="logo"
                // FIX: Changed width classes to set a specific height and auto-adjust width.
                // This makes the logo larger and prevents distortion.
                // You can adjust 'h-12' to 'h-16', 'h-20', etc., based on desired size.
                className="h-12 w-auto cursor-pointer" // Adjusted sizing here
                onClick={() => navigate('/')}
            />

            {/* Right Section: User Initial / Login Button and Dropdown */}
            <div className="relative">
                {isLoggedin && userData ? (
                    <div
                        className="user-initial-circle"
                        onClick={toggleDropdown}
                        title={userData ? userData.name : "Account"}
                    >
                        {userData?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                ) : (
                    <button
                        onClick={handleLoginClick}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out"
                    >
                        Login <span className="ml-1">&rarr;</span>
                    </button>
                )}

                {showDropdown && isLoggedin && userData && (
                    <div className="user-dropdown-menu">
                        <ul className="list-none m-0 p-0">
                            {userData.name && (
                                <li className="dropdown-item font-bold text-indigo-900 cursor-default">
                                    {userData.name}
                                </li>
                            )}
                            {userData.unit && (
                                <li className="dropdown-item font-semibold text-indigo-700 cursor-default">
                                    {userData.unit}
                                </li>
                            )}
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
            </div>
        </div>
    );
};

export default Navbar;