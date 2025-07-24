import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { assets } from '../assets/assets';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dropdownRef = useRef(null);

    const { userData, setIsLoggedin, setUserData, backendUrl, isLoggedin } = useContext(AppContent);
    const [showDropdown, setShowDropdown] = useState(false);

    // Memoize the sendVerificationOtp function
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
        
        // Add when component mounts
        document.addEventListener('mousedown', handleClickOutside);
        
        // Clean up on unmount
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="navbar-container">
            {/* Left Section: Logo and "Sri Lanka Customs" text */}
            <div className="navbar-left-section">
                <img
                    src={assets.logo}
                    alt="Sri Lanka Customs Logo"
                    className="h-12 w-auto cursor-pointer"
                    onClick={() => navigate('/')}
                />
                <span className="text-base font-bold text-black pt-1">Sri Lanka Customs</span>
            </div>

            {/* Right Section: Conditional rendering based on login status */}
            <div className="navbar-right-section"> 
                {isLoggedin && userData ? (
                    <div className="profile-dropdown-container" ref={dropdownRef}>
                        <div
                            className="profile-circle"
                            onClick={toggleDropdown}
                            title={userData ? userData.name : "Account"}
                        >
                            {userData?.name?.[0]?.toUpperCase() || 'U'}
                        </div>

                        {showDropdown && (
                            <div className="dropdown-menu show">
                                <div className="dropdown-header">{userData?.name}</div>
                                {userData?.unit && <div className="dropdown-sub">{userData.unit}</div>}

                                {!userData?.isAccountVerified && (
                                    <div className="dropdown-item" onClick={sendVerificationOtp}>
                                        Verify Email
                                    </div>
                                )}

                                <div className="dropdown-item logout" onClick={handleLogout}>
                                    Logout
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <Link
                            to="/CrewUser"
                            className={`text-blue-800 px-3 py-2 rounded hover:bg-blue-100 ${
                                location.pathname === "/CrewUser" ? "bg-blue-100 font-semibold" : ""
                            }`}
                        >
                            Crew Declaration
                        </Link>

                        <button
                            onClick={handleLoginClick}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out"
                        >
                            Login <span className="ml-1">&rarr;</span>
                        </button>
                    </>
                )}
            </div>
            
            {/* Embedded CSS with fixed styles */}
            <style>{`
                .navbar-container {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 80px;
                    background-color: white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    padding: 0 24px;
                    z-index: 1000;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .navbar-left-section {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .navbar-right-section {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    position: relative;
                }

                .profile-dropdown-container {
                    position: relative;
                    height: 42px;
                }

                .profile-circle {
                    width: 42px;
                    height: 42px;
                    background-color: #007bff;
                    color: white;
                    font-weight: bold;
                    font-size: 18px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
                    position: relative;
                    z-index: 1001;
                }

                .profile-circle:hover {
                    background-color: #0056b3;
                }

                .dropdown-menu {
                    position: absolute;
                    top: 50px;
                    right: 0;
                    width: 200px;
                    background-color: white;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    padding: 12px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    z-index: 1002;
                    opacity: 0;
                    transform: translateY(-10px);
                    transition: all 0.2s ease;
                }

                .dropdown-menu.show {
                    opacity: 1;
                    transform: translateY(0);
                }

                .dropdown-header {
                    font-weight: bold;
                    font-size: 16px;
                    color: #333;
                    padding-bottom: 4px;
                }

                .dropdown-sub {
                    font-size: 13px;
                    color: #666;
                    margin-bottom: 10px;
                }

                .dropdown-item {
                    font-size: 14px;
                    color: #007bff;
                    padding: 8px 0;
                    cursor: pointer;
                    border-radius: 6px;
                    transition: background-color 0.2s ease-in-out;
                    text-align: left;
                    padding-left: 8px;
                }

                .dropdown-item:hover {
                    background-color: #f0f0f0;
                }

                .dropdown-item.logout {
                    color: #dc3545;
                }
            `}</style>
        </header>
    );
};

export default Navbar;