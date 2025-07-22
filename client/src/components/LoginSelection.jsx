import React from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets'; // Import assets for the logo

const LoginSelection = () => {
  const navigate = useNavigate();

  const handleLoginAsUser = () => {
    navigate('/login?state=login');
  };

  const handleAdminLogin = () => {
    navigate('/login?role=admin');
  };

  return (
    <div className="auth-page-container"> {/* Uses the common auth page background */}
      <div className="auth-form-wrapper"> {/* Container for the card */}
        <div className="auth-form-card"> {/* Card styling */}
          <img
            src={assets.logo}
            alt="Logo"
            className="auth-form-logo" // Matches logo inside form
            onClick={() => navigate('/')} // Make logo clickable
          />

          <h2 className="auth-form-title">
            Login As
          </h2>
          <p className="auth-form-subtitle">
            To continue, please choose your login type.
          </p>
          <p className="auth-link-text mb-8"> {/* Using auth-link-text for similar style */}
            This helps us direct you to the appropriate dashboard and features.
          </p>

          <div className="space-y-4"> {/* Keep Tailwind's space-y-4 for button spacing */}
            <button
              onClick={handleLoginAsUser}
              className="auth-submit-button" // Use general submit button style
              style={{backgroundColor: '#007bff'}} // Override for blue color for User Login
            >
              <i className="bi bi-person-fill text-xl mr-2"></i> {/* Ensure these icons are available via your setup (e.g., Bootstrap Icons) */}
              Login as User
            </button>

            <button
              onClick={handleAdminLogin}
              className="auth-submit-button" // Use general submit button style
              style={{backgroundColor: '#8a2be2'}} // Override for purple color for Admin Login (example purple)
            >
              <i className="bi bi-person-workspace text-xl mr-2"></i>
              Login as Admin
            </button>
          </div>

          <p className="auth-link-text mt-8"> {/* Use auth-link-text and margin-top */}
            Need assistance? Contact support for help.
          </p>
        </div>
      </div>

      {/* --- Reusing the common authentication page styles --- */}
      <style>
        {`
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
            background: #e0e7ff; /* Lighter background for consistency */
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

          /* Keeping existing auth-input-group, auth-input-field for consistency,
             though not used directly in this component's fields, they contribute to the overall style */
          .auth-input-group {
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            padding: 12px 20px;
            border-radius: 4px;
            background-color: #f5f5f5;
            border: 1px solid #ddd;
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
          }

          .auth-input-field {
            background-color: transparent;
            outline: none;
            border: none;
            width: 100%;
            color: #333;
            font-size: 16px;
          }

          .auth-input-field::placeholder {
            color: #999;
          }

          .auth-submit-button {
            width: 100%;
            padding: 12px 20px;
            border-radius: 4px;
            background-color: #28a745; /* Default green, can be overridden */
            color: #ffffff;
            font-weight: 500;
            border: none;
            cursor: pointer;
            font-size: 18px;
            transition: background-color 0.3s ease, transform 0.2s ease; /* Added transform */
            display: flex; /* For icon alignment */
            align-items: center;
            justify-content: center;
          }

          .auth-submit-button:hover {
            background-color: #218838; /* Darker green default hover */
            transform: scale(1.02); /* Slight scale on hover */
          }

          /* Overrides for specific button colors in this component */
          .auth-submit-button[style*="background-color: rgb(0, 123, 255)"]:hover {
              background-color: #0056b3 !important; /* Darker blue */
          }
          .auth-submit-button[style*="background-color: rgb(138, 43, 226)"]:hover {
              background-color: #6a0dad !important; /* Darker purple */
          }


          .auth-link-text {
            color: #666;
            text-align: center;
            font-size: 14px;
            /* margin-top: 20px; removed specific margin-top here as it's handled by individual elements */
          }

          .auth-link-text a {
            color: #007bff;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.2s ease;
          }

          .auth-link-text a:hover {
            text-decoration: underline;
            color: #0056b3;
          }

          /* Utility class from previous Tailwind structure for consistent spacing */
          .space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 1rem; }
        `}
      </style>
    </div>
  );
};

export default LoginSelection;