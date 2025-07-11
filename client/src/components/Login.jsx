// client/src/components/Login.jsx
import React, { useContext, useState } from "react"; // Correct import
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom"; // Correct import
import { AppContent } from "../context/AppContext";
import axios from "axios"; // Correct import
import { toast } from "react-toastify"; // Correct import

const Login = () => {
  const navigate = useNavigate();
  const { backendUrl, setIsLoggedin, setUserData, getUserData } = useContext(AppContent);

  const [state, setState] = useState("Sign Up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onsubmitHandler = async (e) => {
    e.preventDefault();
    axios.defaults.withCredentials = true;

    try {
      if (state === "Sign Up") {
        const { data } = await axios.post(`${backendUrl}/api/auth/register`, {
          name,
          email,
          password,
        });

        if (data.success) {
          toast.success(data.message || "Sign up successful!"); 
          setIsLoggedin(true); 
          await getUserData();
          navigate("/");
        } else {
          toast.error(data.message);
        }
      } else { // Login state
        const { data } = await axios.post(`${backendUrl}/api/auth/login`, {
          email,
          password,
        });

        if (data.success) {
          toast.success(data.message || "Login successful!");
          setIsLoggedin(true);
          await getUserData();
          navigate("/");
        } else {
          toast.error(data.message);
        }
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
          {state === "Sign Up" ? "Create account" : "Login to your account!"}
        </h2>
        <p className="text-center text-sm mb-6">
          {state === "Sign Up" ? "Create your account." : "Login to your account."}
        </p>

        <form onSubmit={onsubmitHandler}>
          {state === "Sign Up" && (
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

          <p
            onClick={() => navigate("/reset-password")}
            className="mb-4 text-indigo-500 cursor-pointer"
          >
            Forgot password?
          </p>

          <button
            type="submit"
            className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-400 to-indigo-900 text-white font-medium"
          >
            {state}
          </button>
        </form>

        {state === "Sign Up" ? (
          <p className="text-gray-400 text-center text-xs mt-4">
            Already have an account?{" "}
            <span
              onClick={() => setState("Login")}
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
        )}
      </div>
      {/* Removed 'jsx' prop from the style tag */}
      <style>
        {`
          .login-container {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding-left: 1.5rem; /* px-6 */
            padding-right: 1.5rem; /* px-6 */
            background: linear-gradient(to bottom right, #bfdbfe, #c084fc); /* from-blue-200 to-purple-400 */
          }

          @media (min-width: 640px) { /* sm:px-0 */
            .login-container {
              padding-left: 0;
              padding-right: 0;
            }
          }

          .login-logo {
            position: absolute;
            left: 1.25rem; /* left-5 */
            top: 1.25rem; /* top-5 */
            width: 7rem; /* w-28 */
            cursor: pointer;
          }

          @media (min-width: 640px) { /* sm:left-20, sm:w-32 */
            .login-logo {
              left: 5rem;
              width: 8rem;
            }
          }

          .login-form-card {
            background-color: #1e293b; /* bg-slate-900 */
            padding: 2.5rem; /* p-10 */
            border-radius: 0.5rem; /* rounded-lg */
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* shadow-lg */
            width: 100%;
            max-width: 24rem; /* sm:w-96 */
            color: #a78bfa; /* text-indigo-300 */
            font-size: 0.875rem; /* text-sm */
          }

          .login-title {
            font-size: 1.875rem; /* text-3xl */
            font-weight: 600; /* font-semibold */
            color: #ffffff; /* text-white */
            text-align: center;
            margin-bottom: 0.75rem; /* mb-3 */
          }

          .login-subtitle {
            text-align: center;
            font-size: 0.875rem; /* text-sm */
            margin-bottom: 1.5rem; /* mb-6 */
          }

          .login-input-group {
            margin-bottom: 1rem; /* mb-4 */
            display: flex;
            align-items: center;
            gap: 0.75rem; /* gap-3 */
            width: 100%;
            padding: 0.625rem 1.25rem; /* px-5 py-2.5 */
            border-radius: 9999px; /* rounded-full */
            background-color: #333A5C; /* bg-[#333A5C] */
          }

          .login-input-group img {
            width: 1.25rem; /* Adjust icon size if needed */
            height: 1.25rem;
          }

          .login-input-field {
            background-color: transparent;
            outline: none;
            width: 100%;
            color: #ffffff; /* Ensure input text is visible */
          }
          
          .login-input-field::placeholder { /* Style placeholder text */
            color: #a78bfa; /* text-indigo-300 */
            opacity: 0.7;
          }

          .forgot-password-link {
            margin-bottom: 1rem; /* mb-4 */
            color: #6366f1; /* text-indigo-500 */
            cursor: pointer;
            text-decoration: none; /* Ensure no default underline */
          }

          .forgot-password-link:hover {
            text-decoration: underline; /* Add underline on hover */
          }

          .login-submit-button {
            width: 100%;
            padding-top: 0.625rem; /* py-2.5 */
            padding-bottom: 0.625rem; /* py-2.5 */
            border-radius: 9999px; /* rounded-full */
            background: linear-gradient(to right, #818cf8, #4f46e5); /* bg-gradient-to-r from-indigo-400 to-indigo-900 */
            color: #ffffff; /* text-white */
            font-weight: 500; /* font-medium */
            border: none;
            cursor: pointer;
            transition: background 0.3s ease;
          }

          .login-submit-button:hover {
            background: linear-gradient(to right, #6366f1, #4338ca); /* Darker gradient on hover */
          }

          .login-toggle-text {
            color: #9ca3af; /* text-gray-400 */
            text-align: center;
            font-size: 0.75rem; /* text-xs */
            margin-top: 1rem; /* mt-4 */
          }

          .login-toggle-link {
            color: #60a5fa; /* text-blue-400 */
            cursor: pointer;
            text-decoration: underline;
          }
        `}
      </style>
    </div>
  );
};

export default Login;
