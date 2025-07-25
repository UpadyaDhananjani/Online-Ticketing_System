import React, { useContext } from 'react';
import { Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';

// Components and Pages
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import Home2 from './components/Home2.jsx'; // Assuming this is your main logged-in dashboard
import Login from './components/Login.jsx';
import LoginSelection from './components/LoginSelection.jsx';
import ResetPassword from './components/ResetPassword.jsx';
import EmailVerify from './components/EmailVerify.jsx';

import TicketsPage from './pages/TicketsPage'; // For regular user tickets
import CreateTicket from './components/CreateTicket';
import Ticket from './pages/Ticket';

import AdminDashboard from './admin/AdminDashboard';
import TicketReply from './admin/adminTicketReply.jsx';

// Import ONLY the AllTickets component.
// We will reuse this component for all filtered views.
import AllTickets from './Data/AllTickets';

// Report Components
import ReportPage from './report/ReportPage.jsx';
import AnalyticsPage from './report/AnalyticsPage.jsx';

// Styling
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import './App.css';

// Context
import { AppContextProvider, AppContent } from './context/AppContext';

const AppRoutes = () => {
    const location = useLocation();
    const { isLoggedin, userData, loading } = useContext(AppContent);

    // Define the height of your fixed Navbar
    const NAVBAR_HEIGHT = '80px';

    // Determine if the current path is an authentication-related page
    const isAuthPage = [
        '/login',
        '/loginselection',
        '/reset-password',
        '/email-verify',
    ].includes(location.pathname);

    // PrivateRoute: Component that protects routes requiring user login.
    function PrivateRoute({ children }) {
        if (loading) {
            return <div>Loading user data...</div>; // Show a loading indicator
        }
        if (!isLoggedin) {
            return <Navigate to="/loginselection" replace />; // Redirect to login if not logged in
        }
        return children; // Render the protected content
    }

    // AdminRoute: Component that protects routes requiring an 'admin' role.
    function AdminRoute({ children }) {
        if (loading) {
            return <div>Loading user data...</div>; // Show a loading indicator
        }
        if (!isLoggedin || userData?.role !== 'admin') {
            return <Navigate to="/" replace />; // Redirect if not logged in or not an admin
        }
        return children; // Render the protected content
    }

    // FallbackRoute: Redirects to appropriate page if no route matches.
    const FallbackRoute = () =>
        isLoggedin
            ? <Navigate to="/" replace /> // Logged in goes to Home2 (dashboard)
            : <Navigate to="/loginselection" replace />; // Not logged in goes to login selection

    return (
        <div>
            {/* Navbar is rendered globally unless it's an auth page */}
            {!isAuthPage && <Navbar />}

            {/* This div accounts for the fixed Navbar's height and contains the Sidebar and main content */}
            <div style={{ paddingTop: isAuthPage ? '0' : NAVBAR_HEIGHT, minHeight: '100vh', background: '#F0F8FF' }}>
                <div className="d-flex" style={{ minHeight: 'calc(100vh - 80px)' }}>
                    {/* Sidebar is rendered globally unless it's an auth page */}
                    {!isAuthPage && <Sidebar />}
                    <div className="flex-grow-1" style={{ flex: 1, padding: '32px 20px' }}>
                        <ToastContainer /> {/* Toast notifications container */}
                        <Routes>
                            {/* --- Authentication Routes (Accessible without login) --- */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/loginselection" element={<LoginSelection />} />
                            <Route path="/reset-password" element={<ResetPassword />} />
                            <Route path="/email-verify" element={<EmailVerify />} />

                            {/* Root/dashboard logic: Always render Home2 for logged-in users, otherwise redirect */}
                            <Route
                                path="/"
                                element={
                                    isLoggedin ? (
                                        <Home2 />
                                    ) : (
                                        <Navigate to="/loginselection" replace />
                                    )
                                }
                            />

                            {/* --- Private (protected) routes for logged in users only --- */}
                            <Route
                                element={
                                    <PrivateRoute>
                                        <Outlet /> {/* Renders nested routes */}
                                    </PrivateRoute>
                                }
                            >
                                <Route path="/tickets-page" element={<TicketsPage />} />
                                <Route path="/tickets" element={<TicketsPage />} />
                                <Route path="/create-ticket" element={<CreateTicket />} />
                                <Route path="/tickets/:id" element={<Ticket />} />

                                {/* --- Admin-only routes (protected by AdminRoute) --- */}
                                <Route
                                    element={
                                        <AdminRoute>
                                            <Outlet /> {/* Renders nested admin components */}
                                        </AdminRoute>
                                    }
                                >
                                    <Route path="/admin" element={<AdminDashboard />} />
                                    <Route path="/admin/tickets/:id/reply" element={<TicketReply />} />

                                    {/* Admin Ticket Views: All use the same AllTickets component,
                                        but pass a different initialStatusFilter prop. */}
                                    <Route path="/admin/tickets/all" element={<AllTickets initialStatusFilter="All" />} />
                                    <Route path="/admin/tickets/open" element={<AllTickets initialStatusFilter="open" />} />
                                    <Route path="/admin/tickets/in-progress" element={<AllTickets initialStatusFilter="in progress" />} />
                                    <Route path="/admin/tickets/resolved" element={<AllTickets initialStatusFilter="resolved" />} />
                                    <Route path="/admin/tickets/closed" element={<AllTickets initialStatusFilter="closed" />} />
                                    <Route path="/admin/tickets/reopened" element={<AllTickets initialStatusFilter="reopened" />} />


                                    {/* Report Routes (assuming these are admin-only or at least protected) */}
                                    <Route path="/reports" element={<ReportPage />} />
                                    <Route path="/analytics" element={<AnalyticsPage />} />
                                </Route>
                            </Route>

                            {/* Fallback: Not found page. This should be the last route. */}
                            <Route path="*" element={<FallbackRoute />} />
                        </Routes>
                    </div>
                </div>
            </div>
            {/* Inline styles for global CSS - consider moving to App.css */}
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
                        text-align: left;
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