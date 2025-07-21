import React, { useContext, useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppContent } from "../context/AppContext";
// Removed direct axios import here, as all API calls should go through ticketApi.js
// import axios from "axios"; // This line remains commented out or removed
import { toast } from "react-toastify";
// CORRECTED IMPORT: Ensure adminLogin is imported along with others
import { getPublicUnits, registerUser, loginUser, adminLogin } from "../api/ticketApi";

const Login = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    // backendUrl is no longer directly used for admin login if using ticketApi.js
    const { setIsLoggedin, getUserData } = useContext(AppContent);

    const roleFromUrl = searchParams.get("role");
    const stateFromUrl = searchParams.get("state");

    const [state, setState] = useState(
        roleFromUrl === "admin"
            ? "Login"
            : stateFromUrl === "login"
                ? "Login"
                : "Sign Up"
    );
    const [currentRole, setCurrentRole] = useState(roleFromUrl || "user");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [unit, setUnit] = useState("");
    const [units, setUnits] = useState([]); // State to store fetched units

    // Fetch units when component mounts
    useEffect(() => {
        const fetchUnits = async () => {
            try {
                const data = await getPublicUnits(); // getPublicUnits returns data directly
                setUnits(data);
            } catch (error) {
                console.error("Error fetching public units:", error);
                toast.error("Failed to load units for signup.");
            }
        };
        fetchUnits();
    }, []); // Empty dependency array means this runs once on mount

    useEffect(() => {
        const newRole = searchParams.get("role");
        const newStateParam = searchParams.get("state");

        if (newRole && newRole !== currentRole) {
            setCurrentRole(newRole);
            setState("Login");
        } else if (newStateParam === "login" && state !== "Login") {
            setState("Login");
            setCurrentRole("user");
        } else if (!newRole && !newStateParam && currentRole !== "user") {
            setCurrentRole("user");
            setState("Sign Up");
        } else if (!newRole && !newStateParam && state !== "Sign Up") {
            setCurrentRole("user");
            setState("Sign Up");
        }

        // Reset form fields on URL param change
        setName("");
        setEmail("");
        setPassword("");
        setUnit("");
    }, [searchParams, currentRole, state]);

    const onsubmitHandler = async (e) => {
        e.preventDefault();

        try {
            let responseData;

            if (currentRole === "admin") {
                // CHANGED: Now using the adminLogin function from ticketApi.js
                responseData = await adminLogin({
                    email,
                    password,
                });
            } else if (state === "Sign Up") {
                // Using the registerUser function from ticketApi.js
                responseData = await registerUser({
                    name,
                    email,
                    password,
                    unit,
                });
            } else { // state === "Login"
                // Using the loginUser function from ticketApi.js
                responseData = await loginUser({
                    email,
                    password,
                });
            }

            if (responseData.success) {
                toast.success(responseData.message || "Operation successful!");
                setIsLoggedin(true);
                await getUserData(); // Fetch updated user data after login/signup
                navigate("/dashboard"); // Navigate to dashboard on success
            } else {
                toast.error(responseData.message);
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || "Something went wrong";
            toast.error(errorMsg);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400">
            <img
                onClick={() => navigate("/")}
                src={assets.logo}
                alt="logo"
                className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
            />

            <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
                <h2 className="text-3xl font-semibold text-white text-center mb-3">
                    {currentRole === "admin"
                        ? "Admin Login"
                        : state === "Sign Up"
                            ? "Create account"
                            : "Login to your account!"}
                </h2>
                <p className="text-center text-sm mb-6">
                    {currentRole === "admin"
                        ? "Enter admin credentials."
                        : state === "Sign Up"
                            ? "Create your account."
                            : "Login to your account."}
                </p>

                <form onSubmit={onsubmitHandler}>
                    {/* Show name and unit only for user sign up */}
                    {currentRole !== "admin" && state === "Sign Up" && (
                        <>
                            <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
                                <img src={assets.person_icon} alt="" />
                                <input
                                    onChange={(e) => setName(e.target.value)}
                                    value={name}
                                    className="bg-transparent outline-none w-full"
                                    type="text"
                                    placeholder="Full Name"
                                    required
                                />
                            </div>
                            <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
                                <select
                                    value={unit}
                                    onChange={(e) => setUnit(e.target.value)}
                                    className="bg-transparent outline-none w-full text-indigo-300"
                                    required
                                >
                                    <option value="" disabled>
                                        Select your unit
                                    </option>
                                    {units.length > 0 ? ( // Use fetched units here
                                        units.map(u => (
                                            <option key={u._id} value={u._id}>{u.name}</option>
                                        ))
                                    ) : (
                                        <option value="" disabled>Loading units...</option>
                                    )}
                                </select>
                            </div>
                        </>
                    )}

                    <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
                        <img src={assets.mail_icon} alt="" />
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            className="bg-transparent outline-none w-full"
                            type="email"
                            placeholder="Email"
                            required
                        />
                    </div>

                    <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
                        <img src={assets.lock_icon} alt="" />
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            className="bg-transparent outline-none w-full"
                            type="password"
                            placeholder="Password"
                            required
                        />
                    </div>

                    {/* Show forgot password only if user is logging in */}
                    {currentRole !== "admin" && state === "Login" && (
                        <p
                            onClick={() => navigate("/reset-password")}
                            className="mb-4 text-indigo-500 cursor-pointer"
                        >
                            Forgot password?
                        </p>
                    )}

                    <button
                        type="submit"
                        className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-400 to-indigo-900 text-white font-medium"
                    >
                        {currentRole === "admin" ? "Login as Admin" : state}
                    </button>
                </form>

                {/* Toggle links below form */}
                {currentRole !== "admin" ? (
                    state === "Sign Up" ? (
                        <p className="text-gray-400 text-center text-xs mt-4">
                            Already have an account?{" "}
                            <span
                                onClick={() => navigate("/loginselection")}
                                className="text-blue-400 cursor-pointer underline"
                            >
                                Login here
                            </span>
                        </p>
                    ) : (
                        <p className="text-gray-400 text-center text-xs mt-4">
                            Don't have an account?{" "}
                            <span
                                onClick={() => setState("Sign Up")}
                                className="text-blue-400 cursor-pointer underline"
                            >
                                Sign up here
                            </span>
                        </p>
                    )
                ) : (
                    <p className="text-gray-400 text-center text-xs mt-4">
                        <span
                            onClick={() => navigate("/loginselection")}
                            className="text-blue-400 cursor-pointer underline"
                        >
                            &larr; Back to Role Selection
                        </span>
                    </p>
                )}
            </div>

            <style>
                {`
                    /* Login component styles */

                    .login-container {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        padding-left: 1.5rem;
                        padding-right: 1.5rem;
                        background: linear-gradient(to bottom right, #bfdbfe, #c084fc);
                    }

                    @media (min-width: 640px) {
                        .login-container {
                            padding-left: 0;
                            padding-right: 0;
                        }
                    }

                    .login-logo {
                        position: absolute;
                        left: 1.25rem;
                        top: 1.25rem;
                        width: 7rem;
                        cursor: pointer;
                    }

                    @media (min-width: 640px) {
                        .login-logo {
                            left: 5rem;
                            width: 8rem;
                        }
                    }

                    .login-form-card {
                        background-color: #1e293b;
                        padding: 2.5rem;
                        border-radius: 0.5rem;
                        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
                            0 4px 6px -2px rgba(0, 0, 0, 0.05);
                        width: 100%;
                        max-width: 24rem;
                        color: #a78b4fa;
                        font-size: 0.875rem;
                    }

                    .login-title {
                        font-size: 1.875rem;
                        font-weight: 600;
                        color: #ffffff;
                        text-align: center;
                        margin-bottom: 0.75rem;
                    }

                    .login-subtitle {
                        text-align: center;
                        font-size: 0.875rem;
                        margin-bottom: 1.5rem;
                    }

                    .login-input-group {
                        margin-bottom: 1rem;
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        width: 100%;
                        padding: 0.625rem 1.25rem;
                        border-radius: 9999px;
                        background-color: #333A5C;
                    }

                    .login-input-group img {
                        width: 1.25rem;
                        height: 1.25rem;
                    }

                    .login-input-field {
                        background-color: transparent;
                        outline: none;
                        width: 100%;
                        color: #ffffff;
                    }

                    .login-input-field::placeholder {
                        color: #a78bfa;
                        opacity: 0.7;
                    }

                    .forgot-password-link {
                        margin-bottom: 1rem;
                        color: #6366f1;
                        cursor: pointer;
                        text-decoration: none;
                    }

                    .forgot-password-link:hover {
                        text-decoration: underline;
                    }

                    .login-submit-button {
                        width: 100%;
                        padding-top: 0.625rem;
                        padding-bottom: 0.625rem;
                        border-radius: 9999px;
                        background: linear-gradient(to right, #818cf8, #4f46e5);
                        color: #ffffff;
                        font-weight: 500;
                        border: none;
                        cursor: pointer;
                        transition: background 0.3s ease;
                    }

                    .login-submit-button:hover {
                        background: linear-gradient(to right, #6366f1, #4338ca);
                    }

                    .login-toggle-text {
                        color: #9ca3af;
                        text-align: center;
                        font-size: 0.75rem;
                        margin-top: 1rem;
                    }

                    .login-toggle-link {
                        color: #60a5fa;
                        cursor: pointer;
                        text-decoration: underline;
                    }
                `}
            </style>
        </div>
    );
};

export default Login;