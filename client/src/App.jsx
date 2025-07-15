import React, { useContext } from 'react';
import { Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
// Components and Pages
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import Home from './components/Home.jsx';
import Home2 from './components/Home2.jsx';
import Login from './components/Login.jsx';
import LoginSelection from './components/LoginSelection.jsx';
import ResetPassword from './components/ResetPassword.jsx';
import EmailVerify from './components/EmailVerify.jsx';
import TicketsPage from './pages/TicketsPage';
import TicketList from './components/TicketList';
import CreateTicket from './components/CreateTicket';
import Ticket from './pages/Ticket';
import AdminDashboard from './admin/AdminDashboard';
import TicketReply from './admin/adminTicketReply.jsx';
// Styling
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
// Context
import { AppContextProvider, AppContent } from './context/AppContext';
// (Optionally) legacy protected route, but will not use for main logic
// import ProtectedRoute from './components/ProtectedRoute';


// ---- AppRoutes handles all route structure, context aware ----
const AppRoutes = () => {
  const location = useLocation();
  const { isLoggedin, userData, loading } = useContext(AppContent);

  // URLs that are NOT part of the main UI shell (navbar/sidebar)
  const isAuthPage = [
    '/login',
    '/loginselection',
    '/reset-password',
    '/email-verify',
    '/register'
  ].includes(location.pathname);

  // PrivateRoute: Guards any routes needing authentication
  function PrivateRoute({ children }) {
    if (loading) return <div>Loading user data...</div>;
    if (!isLoggedin) return <Navigate to="/loginselection" replace />;
    return children;
  }

  // AdminRoute: Guards any admin-only routes
  function AdminRoute({ children }) {
    if (!isLoggedin || userData?.role !== 'admin') {
      return <Navigate to="/" replace />;
    }
    return children;
  }

  // Fallback for any not-found page, redirect base on login
  const FallbackRoute = () =>
    isLoggedin
      ? <Navigate to="/" replace />
      : <Navigate to="/loginselection" replace />;

  // Make sure Home2 is given a key for first render at "/"
  const isDashboard = location.pathname === '/';

  return (
    <div>
      {!isAuthPage && <Navbar />}
      <div className="d-flex" style={{ minHeight: '100vh', background: '#F0F8FF' }}>
        {!isAuthPage && <Sidebar />}
        <div className="flex-grow-1" style={{ flex: 1, padding: '32px 0' }}>
          <ToastContainer />
          <Routes>
            {/* --- Authentication Routes --- */}
            <Route path="/login" element={<Login />} />
            <Route path="/loginselection" element={<LoginSelection />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/email-verify" element={<EmailVerify />} />
            {/* Root/dashboard logic */}
            <Route
              path="/"
              element={
                isLoggedin
                  ? <Home2 key={isDashboard ? location.key : "home2-static"} />
                  : <Navigate to="/loginselection" replace />
              }
            />

            {/* --- Private (protected) routes for logged in users only --- */}
            <Route
              element={
                <PrivateRoute>
                  <Outlet />
                </PrivateRoute>
              }
            >
              {/* User and admin dashboard */}
              <Route path="/home" element={<Home />} />
              <Route path="/tickets-page" element={<TicketsPage />} />
              <Route path="/tickets" element={<TicketsPage />} />
              <Route path="/create-ticket" element={<CreateTicket />} />
              <Route path="/tickets/:id" element={<Ticket />} />

              {/* Admin-only routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/tickets/:id/reply"
                element={
                  <AdminRoute>
                    <TicketReply />
                  </AdminRoute>
                }
              />

              {/* Filtered ticket lists */}
              <Route path="/tickets/open" element={<TicketsPage filter="open" />} />
              <Route path="/tickets/resolved" element={<TicketsPage filter="resolved" />} />
            </Route>
            {/* Fallback: Not found */}
            <Route path="*" element={<FallbackRoute />} />
          </Routes>
        </div>
      </div>
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

          code {
              font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
                  monospace;
          }

          a {
              text-decoration: none !important;
          }

          .flex-grow-1 {
              padding: 32px 20px !important;
              width: 100%;
              box-sizing: border-box;
          }

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

          .hover-effect:hover {
              transform: translateY(-5px);
              box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
              cursor: pointer;
          }
        `}
      </style>
    </div>
  );
};


function App() {
  return (
    <AppContextProvider>
      <AppRoutes />
    </AppContextProvider>
  );
}

export default App;
