import React, { useContext, useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";

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

  const [state, setState] = useState(
    roleFromUrl === "admin"
      ? "Login"
      : stateFromUrl?.toLowerCase() === "login"
      ? "Login"
      : "Sign Up"
  );

  const { setIsLoggedin, setUserData, backend } = useContext(AppContent);

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
          const response = await axios.get(`${backend}/api/units`);
          if (response.data.success) {
            setUnits(response.data.units);
          } else {
            toast.error(response.data.message);
          }
        } catch (error) {
          toast.error("Failed to fetch units.");
        } finally {
          setLoadingUnits(false);
        }
      }
    };
    fetchUnits();
  }, [state, backend]);

  const onLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error("All fields are required");

    try {
      const res = await axios.post(`${backend}/api/login`, {
        email,
        password,
        role: roleFromUrl || "customer",
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setIsLoggedin(true);
        setUserData(res.data.user);
        localStorage.setItem("token", res.data.token);
        navigate("/");
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("Login failed");
    }
  };

  const onSignUp = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !selectedUnit)
      return toast.error("All fields are required");

    try {
      const res = await axios.post(`${backend}/api/signup`, {
        name,
        email,
        password,
        unit: selectedUnit,
        role: roleFromUrl || "customer",
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setIsLoggedin(true);
        setUserData(res.data.user);
        localStorage.setItem("token", res.data.token);
        navigate("/");
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("Sign up failed");
    }
  };

  const handleStateChange = (newState) => {
    setState(newState);
    navigate(`/login?state=${newState.toLowerCase()}&role=${roleFromUrl || "customer"}`);
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 shadow-xl rounded-xl relative">
        <img src={assets.logo} alt="Logo" className="w-20 mx-auto mb-4" />

        <h2 className="text-2xl font-bold text-center mb-2">
          {state === "Login" ? "Login" : "Sign Up"}
        </h2>

        {roleFromUrl && (
          <p className="text-sm text-center text-gray-500 mb-4">
            Logging in as: <span className="font-semibold">{roleFromUrl}</span>
          </p>
        )}

        <form
          onSubmit={state === "Login" ? onLogin : onSignUp}
          className="space-y-4"
        >
          {state === "Sign Up" && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
              <div className="relative">
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded appearance-none pr-8"
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
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />

          {/* Forgot Password Link - Only visible on the Login state */}
          {state === "Login" && (
            <p className="text-right text-sm -mt-2">
              <span
                onClick={() => navigate("/reset-password")} // <--- THIS IS THE CHANGED LINE
                className="text-blue-500 hover:underline cursor-pointer"
              >
                Forgot Password?
              </span>
            </p>
          )}

          <button
            type="submit"
            className="w-full py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700"
          >
            {state === "Login" ? "Login" : "Sign Up"}
          </button>
        </form>

        <div className="text-center mt-4">
          {state === "Login" ? (
            <p>
              Don't have an account?{" "}
              <span
                onClick={() => handleStateChange("Sign Up")}
                className="text-blue-500 underline cursor-pointer"
              >
                Sign up here
              </span>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <span
                onClick={() => handleStateChange("Login")}
                className="text-blue-500 underline cursor-pointer"
              >
                Login here
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;