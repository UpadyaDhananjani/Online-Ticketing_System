// src/components/Navbar.jsx
import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Navbar as BSNavbar, Nav } from 'react-bootstrap'; // Removed NavDropdown as it's not used
// import ThemeToggle from './ThemeToggle'; // REMOVED: No longer needed
import { assets } from '../assets/assets'; // Assuming you have an assets file with a logo

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dropdownRef = useRef(null);

    const { userData, setIsLoggedin, setUserData, backendUrl, isLoggedin } = useContext(AppContent);
    const [showDropdown, setShowDropdown] = useState(false);

    const sendVerificationOtp = useCallback(async () => {
        if (!userData || !userData.id) {
            toast.error("User not logged in or user ID is missing. Cannot send OTP.");
            setShowDropdown(false);
            return;
        }

        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.post(`${backendUrl}/api/auth/send-verify-otp`, {
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
    }, [userData, backendUrl, navigate]);

    const handleLoginClick = () => {
        navigate('/login');
        setShowDropdown(false);
    };

    const handleLogout = async () => {
        try {
            await axios.post(`${backendUrl}/api/auth/logout`, {}, { withCredentials: true });
            setIsLoggedin(false);
            setUserData(null);
            toast.success("Logged out successfully!");
            navigate('/login');
        } catch (error) {
            console.error("Logout error:", error);
            toast.error(error.response?.data?.message || "An error occurred during logout.");
        } finally {
            setShowDropdown(false);
        }
    };

    const toggleDropdown = (event) => {
        event.stopPropagation();
        setShowDropdown(prev => !prev);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const getUserInitials = (user) => {
        if (!user || !user.name) return '';
        const names = user.name.split(' ');
        if (names.length > 1) {
            return (names[0][0] + names[names.length - 1][0]).toUpperCase();
        }
        return names[0][0].toUpperCase();
    };

    return (
        <BSNavbar
            className="w-full h-20 flex items-center justify-between px-6 text-white shadow-md shadow-shadow-color transition-colors duration-300 ease-in-out"
            style={{ backgroundColor: '#1a237e' }} // Direct inline style for fixed dark blue background
            fixed="top"
        >
            <BSNavbar.Brand as={Link} to="/" className="d-flex align-items-center no-underline text-white hover:text-gray-200 transition-colors duration-200">
                {assets.logo && (
                    <img
                        src={assets.logo}
                        alt="Sri Lanka Customs Logo"
                        className="h-12 w-auto mr-3"
                    />
                )}
                <span className="text-2xl font-bold text-white pt-1">Sri Lanka Customs</span>
            </BSNavbar.Brand>

            <Nav className="flex items-center space-x-4">
                {/* ThemeToggle component removed from here */}

                {isLoggedin && userData ? (
                    <div className="relative" ref={dropdownRef}>
                        <div
                            className="user-initial-circle cursor-pointer flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-lg shadow-md transition-all duration-200 ease-in-out hover:bg-blue-700"
                            onClick={toggleDropdown}
                            title={userData ? userData.name : "Account"}
                        >
                            {getUserInitials(userData)}
                        </div>

                        {showDropdown && (
                            <div className="user-dropdown-menu absolute top-full right-0 mt-2 bg-card-background rounded-lg shadow-lg min-w-[150px] py-2 z-50 transition-all duration-200 ease-in-out">
                                <ul className="list-none m-0 p-0">
                                    <li className="px-4 py-2 text-text-color text-sm font-semibold border-b border-border-color">
                                        Hello, {userData.name}
                                    </li>
                                    {userData?.unit && <li className="px-4 py-2 text-text-muted-color text-xs">{userData.unit}</li>}
                                    {!userData?.isAccountVerified && (
                                        <li className="dropdown-item px-4 py-2 cursor-pointer text-primary-color text-sm hover:bg-border-color hover:text-primary-color-hover transition-colors duration-200 ease-in-out" onClick={sendVerificationOtp}>
                                            Verify Email
                                        </li>
                                    )}
                                    <li className="dropdown-item px-4 py-2 cursor-pointer text-red-500 text-sm hover:bg-border-color hover:text-red-600 transition-colors duration-200 ease-in-out" onClick={handleLogout}>
                                        Logout
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <Link
                            to="/CrewUser"
                            className={`text-white px-3 py-2 rounded hover:bg-blue-800 ${
                                location.pathname === "/CrewUser" ? "bg-blue-800 font-semibold" : ""
                            }`}
                        >
                            Crew Declaration
                        </Link>

                        <button
                            onClick={handleLoginClick}
                            className="bg-white hover:bg-gray-200 text-blue-700 font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out"
                        >
                            Login <span className="ml-1">&rarr;</span>
                        </button>
                    </>
                )}
            </Nav>
        </BSNavbar>
    );
};

export default Navbar;