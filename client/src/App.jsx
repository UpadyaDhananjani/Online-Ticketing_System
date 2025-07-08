// client/src/App.jsx
import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import Home from './components/Home.jsx';
import Home2 from './components/Home2.jsx';
import ResetPassword from './components/ResetPassword.jsx';
import EmailVerify from './components/EmailVerify.jsx';
import TicketsPage from './pages/TicketsPage';
import TicketList from './components/TicketList'; // User-facing TicketList
import CreateTicket from './components/CreateTicket';
import Ticket from './pages/Ticket';
import AdminDashboard from './admin/AdminDashboard'; // This imports the Admin Dashboard component
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Keep this for react-toastify's own styles
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS for styling
import 'bootstrap-icons/font/bootstrap-icons.css'; // Import Bootstrap Icons for icons
import './App.css'; // Import your custom CSS styles
import 'react-toastify/dist/ReactToastify.css'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css'; // Keep this import for your Tailwind CSS setup
import { AppContextProvider } from './context/AppContext';
import ProtectedRoute from './components/ProtectedRoute';

// Removed 'token', 'setToken' props from App function signature as they are not directly used here for rendering
function App() { 
  const location = useLocation();

  const isAuthPage = [
    '/login',
    '/reset-password',
    '/email-verify',
    '/register'
  ].includes(location.pathname);

  const isDashboard = location.pathname === '/'; 

  return (
    <AppContextProvider>
      <div>
        {!isAuthPage && <Navbar />}
        <div className="d-flex" style={{ minHeight: '100vh', background: '#F0F8FF' }}>
          {!isAuthPage && <Sidebar />}
          <div className="flex-grow-1" style={{ flex: 1, padding: '32px 0' }}>
            <ToastContainer />
            <Routes>
              {/* Public Routes - accessible without authentication */}
              {/* Removed onSuccess={setToken} from Login as AppContext handles login state */}
              <Route path="/login" element={<Login />} /> 
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/email-verify" element={<EmailVerify />} />

              {/* Protected Routes - all routes below this will require authentication */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Home2 key={isDashboard ? location.key : "home2-static"} />} />
                <Route path="/home" element={<Home />} /> 
                <Route path="/home" element={<Home />} /> 
                <Route path="/home" element={<Home />} /> 

                {/* TicketsPage might render TicketList internally, ensure it doesn't pass 'token' */}
                <Route path="/tickets-page" element={<TicketsPage />} /> 
                {/* Removed token prop from TicketList */}
                <Route path="/tickets" element={<TicketList />} />
                <Route path="/create-ticket" element={<CreateTicket />} />
                <Route path="/tickets/:id" element={<Ticket />} />
                {/* AdminDashboard now renders src/admin/TicketList, ensure it doesn't pass 'token' */}
                <Route path="/admin" element={<AdminDashboard />} /> 
                {/* Removed token prop from TicketList */}
                <Route path="/tickets/open" element={<TicketsPage filter="open" />} /> 
                <Route path="/tickets/resolved" element={<TicketsPage filter="resolved" />} />
              </Route>
              
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </div>

        {/* --- Removed 'jsx' prop from the style tag --- */}
        <style>
          {`
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
          `}
        </style>
      </div>
    </AppContextProvider>
  );
}

export default App;
