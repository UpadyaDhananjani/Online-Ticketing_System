// client/src/App.js
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import Home from './components/Home.jsx';
import Home2 from './components/Home2.jsx';
import Login from './components/Login.jsx';
import ResetPassword from './components/ResetPassword.jsx';
import EmailVerify from './components/EmailVerify.jsx';
import TicketsPage from './pages/TicketsPage';
import TicketList from './components/TicketList';
import CreateTicket from './components/CreateTicket';
import Ticket from './pages/Ticket';
import AdminDashboard from './admin/AdminDashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Keep this for react-toastify's own styles
import 'react-toastify/dist/ReactToastify.css';
import 'react-toastify/dist/ReactToastify.css'; // Keep this for react-toastify's own styles

function App({ token, setToken }) {
  const location = useLocation();

  // Check if it's an auth route (to hide navbar/sidebar)
  // Check if it's an auth route (to hide navbar/sidebar)
  const isAuthPage = [
    '/login',
    '/reset-password',
    '/email-verify',
    '/register'
  ].includes(location.pathname);

  // Determine if the current path is the root (dashboard)
  // Determine if the current path is the root (dashboard)
  const isDashboard = location.pathname === '/';

  return (
    <div>
      {!isAuthPage && <Navbar />}
      <div className="d-flex" style={{ minHeight: '100vh', background: '#F0F8FF' }}>
        {!isAuthPage && <Sidebar />}
        <div className="flex-grow-1" style={{ flex: 1, padding: '32px 0' }}>
          <ToastContainer />
          <Routes>
            <Route path="/" element={<Home2 key={isDashboard ? location.key : "home2-static"} />} />
            <Route path="/home" element={<Home />} /> 
            <Route path="/home" element={<Home />} /> 
            <Route path="/home" element={<Home />} /> 

            <Route path="/login" element={<Login onSuccess={setToken} />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/email-verify" element={<EmailVerify />} />

            <Route path="/tickets-page" element={<TicketsPage token={token} />} />
            <Route path="/tickets" element={<TicketList />} />
            <Route path="/create-ticket" element={<CreateTicket />} />
            <Route path="/tickets/:id" element={<Ticket />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/tickets/open" element={<TicketsPage token={token} filter="open" />} />
            <Route path="/tickets/resolved" element={<TicketsPage token={token} filter="resolved" />} />

          </Routes>
        </div>
      </div>

      {/* --- EMBEDDED CSS STYLES --- */}
      <style jsx>{`
        /* General Reset/Base Styles */
        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
            sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        code {
          font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
            monospace;
        }

        /* Remove default underline from all links */
        a {
          text-decoration: none !important;
        }

        /* Adjust the main content area padding if sidebar affects it */
        .flex-grow-1 {
          padding: 32px 20px !important;
          width: 100%;
          box-sizing: border-box;
        }

        /* --- SIDEBAR LINK STYLES --- */
        .sidebar-nav-link {
          font-weight: 500;
          color: #222 !important;
          font-size: 18px;
          margin-bottom: 8px;
          text-decoration: none;
          transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out;
          padding: 8px 12px;
          border-radius: 4px;
          display: block;
        }

        .sidebar-nav-link:hover {
          color: #0056b3 !important;
          background-color: #f0f2f5;
        }

        .sidebar-nav-link.active {
          font-weight: 700;
          color: #007bff !important;
          background-color: #e9ecef;
          border-left: 4px solid #007bff;
          padding-left: 8px;
        }

        .sidebar-nav-link.active:hover {
          color: #0056b3 !important;
          background-color: #e9ecef;
        }

        /* --- STYLES FOR USER INITIAL AND DROPDOWN IN NAVBAR --- */
        .user-initial-circle {
          width: 40px;
          height: 40px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 50%;
          background-color: #007bff;
          color: white;
          font-weight: bold;
          font-size: 1.2rem;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: background-color 0.2s ease-in-out;
        }

        .user-initial-circle:hover {
          background-color: #0056b3;
        }

        .user-dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          min-width: 150px;
          padding: 8px 0;
          z-index: 1000;
          margin-top: 10px;
        }

        .user-dropdown-menu ul {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .user-dropdown-menu .dropdown-item {
          padding: 10px 15px;
          cursor: pointer;
          font-size: 0.95rem;
          color: #333;
          transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
        }

        .user-dropdown-menu .dropdown-item:hover {
          background-color: #f0f2f5;
          color: #007bff;
        }

        /* --- OPTIONAL: Styles for the hover effect on the dashboard boxes in Home2.jsx --- */
        .hover-effect:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
          cursor: pointer;
        }
      `}</style>

      {/* --- EMBEDDED CSS STYLES --- */}
      <style jsx>{`
        /* General Reset/Base Styles */
        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
            sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        code {
          font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
            monospace;
        }

        /* Remove default underline from all links */
        a {
          text-decoration: none !important;
        }

        /* Adjust the main content area padding if sidebar affects it */
        .flex-grow-1 {
          padding: 32px 20px !important;
          width: 100%;
          box-sizing: border-box;
        }

        /* --- SIDEBAR LINK STYLES --- */
        .sidebar-nav-link {
          font-weight: 500;
          color: #222 !important;
          font-size: 18px;
          margin-bottom: 8px;
          text-decoration: none;
          transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out;
          padding: 8px 12px;
          border-radius: 4px;
          display: block;
        }

        .sidebar-nav-link:hover {
          color: #0056b3 !important;
          background-color: #f0f2f5;
        }

        .sidebar-nav-link.active {
          font-weight: 700;
          color: #007bff !important;
          background-color: #e9ecef;
          border-left: 4px solid #007bff;
          padding-left: 8px;
        }

        .sidebar-nav-link.active:hover {
          color: #0056b3 !important;
          background-color: #e9ecef;
        }

        /* --- STYLES FOR USER INITIAL AND DROPDOWN IN NAVBAR --- */
        .user-initial-circle {
          width: 40px;
          height: 40px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 50%;
          background-color: #007bff;
          color: white;
          font-weight: bold;
          font-size: 1.2rem;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: background-color 0.2s ease-in-out;
        }

        .user-initial-circle:hover {
          background-color: #0056b3;
        }

        /* Dropdown Menu Container (Aligned to the right) */
        .user-dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0; /* Align to the right edge of the initial circle */
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          min-width: 150px;
          padding: 8px 0;
          z-index: 1000;
          margin-top: 10px;
        }

        /* Dropdown List Items */
        .user-dropdown-menu ul {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .user-dropdown-menu .dropdown-item {
          padding: 10px 15px;
          cursor: pointer;
          font-size: 0.95rem;
          color: #333;
          transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
        }

        .user-dropdown-menu .dropdown-item:hover {
          background-color: #f0f2f5;
          color: #007bff;
        }

        /* --- OPTIONAL: Styles for the hover effect on the dashboard boxes in Home2.jsx --- */
        .hover-effect:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
          cursor: pointer;
        }
      `}</style>

      {/* --- EMBEDDED CSS STYLES --- */}
      <style jsx>{`
        /* General Reset/Base Styles */
        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
            sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        code {
          font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
            monospace;
        }

        /* Remove default underline from all links */
        a {
          text-decoration: none !important;
        }

        /* Adjust the main content area padding if sidebar affects it */
        .flex-grow-1 {
          padding: 32px 20px !important;
          width: 100%;
          box-sizing: border-box;
        }

        /* --- SIDEBAR LINK STYLES --- */
        .sidebar-nav-link {
          font-weight: 500;
          color: #222 !important;
          font-size: 18px;
          margin-bottom: 8px;
          text-decoration: none;
          transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out;
          padding: 8px 12px;
          border-radius: 4px;
          display: block;
        }

        .sidebar-nav-link:hover {
          color: #0056b3 !important;
          background-color: #f0f2f5;
        }

        .sidebar-nav-link.active {
          font-weight: 700;
          color: #007bff !important;
          background-color: #e9ecef;
          border-left: 4px solid #007bff;
          padding-left: 8px;
        }

        .sidebar-nav-link.active:hover {
          color: #0056b3 !important;
          background-color: #e9ecef;
        }

        /* --- STYLES FOR USER INITIAL AND DROPDOWN IN NAVBAR --- */
        .user-initial-circle {
          width: 40px;
          height: 40px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 50%;
          background-color: #007bff;
          color: white;
          font-weight: bold;
          font-size: 1.2rem;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: background-color 0.2s ease-in-out;
        }

        .user-initial-circle:hover {
          background-color: #0056b3;
        }

        .user-dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          min-width: 150px;
          padding: 8px 0;
          z-index: 1000;
          margin-top: 10px;
        }

        .user-dropdown-menu ul {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .user-dropdown-menu .dropdown-item {
          padding: 10px 15px;
          cursor: pointer;
          font-size: 0.95rem;
          color: #333;
          transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
        }

        .user-dropdown-menu .dropdown-item:hover {
          background-color: #f0f2f5;
          color: #007bff;
        }

        /* --- OPTIONAL: Styles for the hover effect on the dashboard boxes in Home2.jsx --- */
        .hover-effect:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

export default App;