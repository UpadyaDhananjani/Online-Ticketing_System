// client/src/components/Login.jsx
import React, { useState, useContext, useEffect } from "react";
import { assets } from "../assets/assets";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";

// Add direct import as fallback
import unitsIcon from '../assets/units.png';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleFromUrl = searchParams.get("role");
  const stateFromUrl = searchParams.get("state");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [units, setUnits] = useState([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [loadingButton, setLoadingButton] = useState(false);

  const [state, setState] = useState(
    roleFromUrl === "admin"
      ? "Login"
      : stateFromUrl?.toLowerCase() === "login"
      ? "Login"
      : "Sign Up"
  );

  const { setIsLoggedin, setUserData, backendUrl } = useContext(AppContent);

  useEffect(() => {
    setState(
      roleFromUrl === "admin"
        ? "Login"
        : stateFromUrl?.toLowerCase() === "login"
        ? "Login"
        : "Sign Up"
    );
  }, [roleFromUrl, stateFromUrl]);

  useEffect(() => {
    const fetchUnits = async () => {
      if (state === "Sign Up") {
        setLoadingUnits(true);
        try {
          const response = await axios.get(`${backendUrl}/api/public/units`);
          if (response.data.success) {
            setUnits(response.data.units);
          } else {
            toast.error(response.data.message || "Failed to fetch units from backend.");
          }
        } catch (error) {
          console.error("Failed to fetch units:", error);
          toast.error("Failed to fetch units. Please check backend /api/public/units endpoint.");
        } finally {
          setLoadingUnits(false);
        }
      }
    };
    fetchUnits();
  }, [state, backendUrl]);

  const onLogin = async (e) => {
    e.preventDefault();
    setLoadingButton(true);

    if (!email || !password) {
      toast.error("All fields are required");
      setLoadingButton(false);
      return;
    }

    try {
      axios.defaults.withCredentials = true;

      let res;
      if (roleFromUrl === "admin" && email === "admin@gmail.com" && password === "admin123") {
        res = await axios.post(`${backendUrl}/api/auth/admin-login`, { email, password });
      } else {
        res = await axios.post(`${backendUrl}/api/auth/login`, { email, password });
      }

      if (res.data.success) {
        toast.success(res.data.message);
        setIsLoggedin(true);
        setUserData(res.data.userData);
        navigate("/");
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error("Login failed error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Login failed due to an unexpected error.");
    } finally {
      setLoadingButton(false);
    }
  };

  const onSignUp = async (e) => {
    e.preventDefault();
    setLoadingButton(true);

    if (!name || !email || !password || !selectedUnit) {
      toast.error("All fields are required");
      setLoadingButton(false);
      return;
    }

    try {
      axios.defaults.withCredentials = true;

      const res = await axios.post(`${backendUrl}/api/auth/register`, {
        name,
        email,
        password,
        unit: selectedUnit,
        role: roleFromUrl || "User",
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setIsLoggedin(true);
        setUserData(res.data.userData);
        navigate("/");
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error("Sign up failed error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Sign up failed due to an unexpected error.");
    } finally {
      setLoadingButton(false);
    }
  };

  const handleStateChange = (newState) => {
    setState(newState);
    navigate(`/login?state=${newState.toLowerCase()}&role=${roleFromUrl || "User"}`);
  };

  return (
    <div className="auth-page-container">
      <div className="auth-form-wrapper">
        <div className="auth-form-card">
          <img
            src={assets.logo}
            alt="Logo"
            className="auth-form-logo"
            onClick={() => navigate('/')}
          />

          <h2 className="auth-form-title">
            {state === "Login" ? "Login" : "Sign Up"}
          </h2>

          {roleFromUrl && (
            <p className="auth-form-subtitle">
              Logging as: <span className="font-semibold">{roleFromUrl}</span>
            </p>
          )}

          <form
            onSubmit={state === "Login" ? onLogin : onSignUp}
            className="space-y-4"
          >
            {state === "Sign Up" && (
              <>
                <div className="auth-input-group">
                  <img src={assets.person_icon} alt="Person icon" className="auth-icon" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="auth-input-field"
                    required
                  />
                </div>
                <div className="auth-input-group relative">
                  <img 
                    src={assets.units || unitsIcon} 
                    alt="Units icon" 
                    className="auth-icon"
                    style={{ width: '18px', height: '18px' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = unitsIcon;
                    }}
                  />
                  <select
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                    className="auth-input-field appearance-none pr-8"
                    required
                  >
                    <option value="" disabled>
                      {loadingUnits ? "Loading units..." : "Select your unit"}
                    </option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.name}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z"/></svg>
                  </div>
                </div>
              </>
            )}

            <div className="auth-input-group">
              <img src={assets.mail_icon} alt="Email icon" className="auth-icon" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input-field"
                required
              />
            </div>

            <div className="auth-input-group">
              <img src={assets.lock_icon} alt="Lock icon" className="auth-icon" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input-field"
                required
              />
            </div>

            {state === "Login" && (
              <p className="auth-link-text text-right -mt-2">
                <span
                  onClick={() => navigate("/reset-password")}
                  className="auth-link"
                >
                  Forgot Password?
                </span>
              </p>
            )}

            <button
              type="submit"
              className="auth-submit-button"
              disabled={loadingButton}
            >
              {loadingButton ? (state === "Login" ? "Logging in..." : "Signing up...") : (state === "Login" ? "Login" : "Sign Up")}
            </button>
          </form>

          <div className="auth-link-text mt-4">
            {state === "Login" ? (
              <p>
                Don't have an account?{" "}
                <span
                  onClick={() => handleStateChange("Sign Up")}
                  className="auth-link"
                >
                  Sign up here
                </span>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <span
                  onClick={() => handleStateChange("Login")}
                  className="auth-link"
                >
                  Login here
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
              'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
              sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        a {
          text-decoration: none !important;
        }

        .auth-page-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: #e0e7ff;
          padding: 20px;
        }

        .auth-form-wrapper {
          display: flex;
          gap: 24px;
          background: transparent;
          padding: 16px;
        }

        .auth-form-card {
          background-color: #fff;
          padding: 32px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 400px;
          text-align: center;
        }

        .auth-form-logo {
          width: 80px;
          margin: 0 auto 20px;
          display: block;
          cursor: pointer;
        }

        .auth-form-title {
          font-size: 28px;
          font-weight: 600;
          color: #333;
          margin-bottom: 20px;
        }

        .auth-form-subtitle {
          text-align: center;
          font-size: 15px;
          margin-bottom: 25px;
          color: #666;
        }

        .auth-input-group {
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          padding: 12px 20px;
          border-radius: 4px;
          background-color: #f5f5f5;
          border: 1px solid #ddd;
          position: relative;
        }

        .auth-input-group:focus-within {
            border-color: #007bff;
            box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }

        .auth-icon {
          width: 18px;
          height: 18px;
          margin-right: 10px;
          color: #666;
          display: block;
          object-fit: contain;
        }

        .auth-input-field {
          background-color: transparent;
          outline: none;
          border: none;
          width: 100%;
          color: #333;
          font-size: 16px;
          appearance: none;
        }

        .auth-input-field::placeholder {
          color: #999;
        }

        .auth-submit-button {
          width: 100%;
          padding: 12px 20px;
          border-radius: 4px;
          background-color: #28a745;
          color: #ffffff;
          font-weight: 500;
          border: none;
          cursor: pointer;
          font-size: 18px;
          transition: background-color 0.3s ease;
        }

        .auth-submit-button:hover:not(:disabled) {
          background-color: #218838;
        }
        
        .auth-submit-button:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
        }

        .auth-link-text {
          color: #666;
          text-align: center;
          font-size: 14px;
        }

        .auth-link {
          color: #007bff;
          text-decoration: none;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .auth-link:hover {
          text-decoration: underline;
          color: #0056b3;
        }

        .space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 1rem; }
      `}</style>
    </div>
  );
};

export default Login;