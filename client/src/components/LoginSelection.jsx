import React from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets'; // Assuming assets are available and path is correct

const LoginSelection = () => {
  const navigate = useNavigate();

  // Function to handle navigation for User Login
  const handleLoginAsUser = () => {
    // Navigate to the Login page with a 'state=login' query parameter
    // This will tell Login.jsx to directly show the Login form for a user.
    navigate('/login?state=login'); // -- CHANGED THIS LINE --
  };

  // Function to handle navigation for Admin Login
  const handleAdminLogin = () => {
    // Navigate to the Login page with a 'role=admin' query parameter.
    // Login.jsx will then show the admin login form.
    navigate('/login?role=admin');
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400">
      {/* Logo at the top left, clickable to navigate to the homepage */}
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt="logo"
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />

      <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm text-center">
        <h2 className="text-3xl font-semibold text-white mb-6">
          Login As
        </h2>
        {/* Optional descriptive text */}
        <p className="text-center text-sm mb-4">
          To continue, please choose your login type.
        </p>
        <p className="text-center text-xs text-gray-400 mb-8">
          This helps us direct you to the appropriate dashboard and features.
        </p>

        <div className="space-y-4">
          {/* User Login Button */}
          <button
            onClick={handleLoginAsUser}
            className="w-full py-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-medium shadow-md hover:from-blue-600 hover:to-blue-800 transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
          >
            <i className="bi bi-person-fill text-xl mr-2"></i> {/* User Icon */}
            Login as User
          </button>

          {/* Admin Login Button */}
          <button
            onClick={handleAdminLogin}
            className="w-full py-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 text-white font-medium shadow-md hover:from-purple-600 hover:to-purple-800 transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
          >
            <i className="bi bi-person-workspace text-xl mr-2"></i> {/* Admin Icon */}
            Login as Admin
          </button>
        </div>

        {/* Optional footer text */}
        <p className="text-gray-500 text-center text-xs mt-8">
          Need assistance? Contact support for help.
        </p>
      </div>

      {/* --- Inline Styles for TailwindCSS (if not using a separate CSS file or PostCSS) --- */}
      <style>
        {`
          .flex { display: flex; }
          .items-center { align-items: center; }
          .justify-center { justify-content: center; }
          .min-h-screen { min-height: 100vh; }
          .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
          .sm\\:px-0 { /* For small screens, remove horizontal padding */ }
          .bg-gradient-to-br { background-image: linear-gradient(to bottom right, var(--tw-gradient-stops)); }
          .from-blue-200 { --tw-gradient-from: #bfdbfe; --tw-gradient-to: #bfdbfe; }
          .to-purple-400 { --tw-gradient-to: #c084fc; }
          .absolute { position: absolute; }
          .left-5 { left: 1.25rem; }
          .sm\\:left-20 { /* For small screens, adjust left position */ }
          .top-5 { top: 1.25rem; }
          .w-28 { width: 7rem; }
          .sm\\:w-32 { /* For small screens, adjust width */ }
          .cursor-pointer { cursor: pointer; }

          .bg-slate-900 { background-color: #1e293b; }
          .p-10 { padding: 2.5rem; }
          .rounded-lg { border-radius: 0.5rem; }
          .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
          .w-full { width: 100%; }
          .sm\\:w-96 { max-width: 24rem; }
          .text-indigo-300 { color: #a78bfa; }
          .text-sm { font-size: 0.875rem; }
          .text-center { text-align: center; }
          .text-white { color: #ffffff; }
          .text-3xl { font-size: 1.875rem; }
          .font-semibold { font-weight: 600; }
          .mb-6 { margin-bottom: 1.5rem; }
          .mb-4 { margin-bottom: 1rem; } /* Added for new paragraph spacing */
          .mb-8 { margin-bottom: 2rem; }
          .space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 1rem; }

          .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
          .rounded-full { border-radius: 9999px; }
          .bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }
          .from-blue-500 { --tw-gradient-from: #3b82f6; --tw-gradient-to: #3b82f6; }
          .to-blue-700 { --tw-gradient-to: #1d4ed8; }
          .from-purple-500 { --tw-gradient-from: #a855f7; --tw-gradient-to: #a855f7; }
          .to-purple-700 { --tw-gradient-to: #7e22ce; }
          .font-medium { font-weight: 500; }
          .shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
          .hover\\:from-blue-600:hover { --tw-gradient-from: #2563eb; --tw-gradient-to: #2563eb; }
          .hover\\:to-blue-800:hover { --tw-gradient-to: #1e40af; }
          .hover\\:from-purple-600:hover { --tw-gradient-from: #9333ea; --tw-gradient-to: #9333ea; }
          .hover\\:to-purple-800:hover { --tw-gradient-to: #6b21a8; }
          .transition { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
          .duration-300 { transition-duration: 300ms; }
          .ease-in-out { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
          .transform { transform: var(--tw-transform); }
          .hover\\:scale-105:hover { --tw-scale-x: 1.05; --tw-scale-y: 1.05; }
          .text-xs { font-size: 0.75rem; } /* Added for smaller text */
          .text-gray-400 { color: #9ca3af; } /* Added for gray text */
          .text-gray-500 { color: #6b7280; } /* Added for slightly darker gray text */
          .mr-2 { margin-right: 0.5rem; } /* Margin for icons */
          .text-xl { font-size: 1.25rem; } /* Icon size */
        `}
      </style>
    </div>
  );
};

export default LoginSelection;