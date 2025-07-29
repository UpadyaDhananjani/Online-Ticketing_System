// client/src/App.jsx
import React, { useContext } from 'react';
// IMPORTANT: Removed 'BrowserRouter as Router' from this import.
// We only need Routes, Route, useLocation, Navigate, Outlet here.
import { Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import './styles/toastify-overrides.css';

import './App.css';

// Components and Pages
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import Home2 from './components/Home2.jsx';
import Login from './components/Login.jsx';
import LoginSelection from './components/LoginSelection.jsx';
import ResetPassword from './components/ResetPassword.jsx';
import EmailVerify from './components/EmailVerify.jsx';

import TicketsPage from './pages/TicketsPage';
import CreateTicket from './components/CreateTicket';
import Ticket from './pages/Ticket';

// Paths confirmed from previous steps
import AdminDashboard from './report/AdminDashboard.jsx';
import TicketReply from './admin/adminTicketReply.jsx';

// Report Components - Paths confirmed from previous steps
import ReportPage from './report/ReportPage.jsx';
import AnalyticsPage from './report/AnalyticsPage.jsx';

// Styling
import { ToastContainer } from 'react-toastify';



// Context
import { AppContextProvider, AppContent } from './context/AppContext';

// Import your ticket page components
import AllTickets from './Data/AllTickets';
import OpenTickets from './Data/OpenTickets';
import InProgressTickets from './Data/InProgressTickets';
import ResolvedTickets from './Data/ResolvedTickets';
import ClosedTickets from './Data/ClosedTickets';

const AppRoutes = () => {
    const location = useLocation();
    const { isLoggedin, userData, loading } = useContext(AppContent);

    const NAVBAR_HEIGHT = '80px';

    const isAuthPage = [
        '/login',
        '/loginselection',
        '/reset-password',
        '/email-verify',
    ].includes(location.pathname);

    function PrivateRoute({ children }) {
        if (loading) {
            return <div>Loading user data...</div>;
        }
        if (!isLoggedin) {
            return <Navigate to="/loginselection" replace />;
        }
        return children;
    }

    function AdminRoute({ children }) {
        if (loading) {
            return <div>Loading user data...</div>;
        }
        if (!isLoggedin || userData?.role !== 'admin') {
            return <Navigate to="/" replace />;
        }
        return children;
    }

    const FallbackRoute = () =>
        isLoggedin
            ? <Navigate to="/" replace />
            : <Navigate to="/loginselection" replace />;

    return (
        <div>
            {!isAuthPage && <Navbar />}

            <div style={{ paddingTop: isAuthPage ? '0' : NAVBAR_HEIGHT, minHeight: '100vh', background: '#F0F8FF' }}>
                <div className="d-flex" style={{ minHeight: 'calc(100vh - 80px)' }}>
                    {!isAuthPage && <Sidebar />}
                    <div className="flex-grow-1" style={{ flex: 1, padding: '32px 20px' }}>
                        <ToastContainer />
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/loginselection" element={<LoginSelection />} />
                            <Route path="/reset-password" element={<ResetPassword />} />
                            <Route path="/email-verify" element={<EmailVerify />} />

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

                            <Route
                                element={
                                    <PrivateRoute>
                                        <Outlet />
                                    </PrivateRoute>
                                }
                            >
                                <Route path="/tickets-page" element={<TicketsPage />} />
                                <Route path="/tickets" element={<TicketsPage />} />
                                <Route path="/create-ticket" element={<CreateTicket />} />
                                <Route path="/tickets/:id" element={<Ticket />} />

                                <Route
                                    element={
                                        <AdminRoute>
                                            <Outlet />
                                        </AdminRoute>
                                    }
                                >
                                    <Route path="/admin" element={<AdminDashboard initialStatusFilter="All" />} />
                                    <Route path="/admin/tickets/all" element={<AllTickets />} />
                                    <Route path="/admin/tickets/open" element={<OpenTickets />} />
                                    <Route path="/admin/tickets/in-progress" element={<InProgressTickets />} />
                                    <Route path="/admin/tickets/resolved" element={<ResolvedTickets />} />
                                    <Route path="/admin/tickets/closed" element={<ClosedTickets />} />

                                    <Route path="/admin/tickets/:id/reply" element={<TicketReply />} />

                                    <Route path="/reports" element={<ReportPage />} />
                                    <Route path="/analytics" element={<AnalyticsPage />} />
                                </Route>
                            </Route>

                            <Route path="*" element={<FallbackRoute />} />
                        </Routes>
                    </div>
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
            {/* Removed the <Router> tag here, as it's now in main.jsx */}
            <AppRoutes />
        </AppContextProvider>
    );
}

export default App;
