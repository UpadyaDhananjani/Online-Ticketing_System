// src/App.jsx
import React, { useContext, useState } from 'react'; // Added useState for potential local state if needed
import { Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import './styles/toastify-overrides.css';

import './App.css';

// Contexts
import { ThemeProvider } from './context/ThemeContext.jsx'; // <--- IMPORTANT: Ensure this is .jsx now
import { AppContextProvider, AppContent } from './context/AppContext';

// Components and Pages
import Navbar from './components/Navbar.jsx'; // Navbar should contain ThemeToggle
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

import ReportPage from './report/ReportPage.jsx';
import AnalyticsPage from './report/AnalyticsPage.jsx';

// Styling Libraries (these should still be imported as external CSS files in main.jsx/index.js)
import { ToastContainer } from 'react-toastify';



// Import your ticket page components
import AllTickets from './Data/AllTickets';
import OpenTickets from './Data/OpenTickets';
import InProgressTickets from './Data/InProgressTickets';
import ResolvedTickets from './Data/ResolvedTickets';
import ClosedTickets from './Data/ClosedTickets';

const AppRoutes = () => {
    const location = useLocation();
    const { isLoggedin, userData, loading } = useContext(AppContent);

    const NAVBAR_HEIGHT = '80px'; // Define Navbar height for padding

    // Determine if the current page is an authentication-related page
    const isAuthPage = [
        '/login',
        '/loginselection',
        '/reset-password',
        '/email-verify',
    ].includes(location.pathname);

    // PrivateRoute component to protect routes requiring authentication
    function PrivateRoute({ children }) {
        if (loading) {
            return <div>Loading user data...</div>; // Show loading state
        }
        if (!isLoggedin) {
            return <Navigate to="/loginselection" replace />; // Redirect if not logged in
        }
        return children; // Render child components if authenticated
    }

    // AdminRoute component to protect routes requiring admin role
    function AdminRoute({ children }) {
        if (loading) {
            return <div>Loading user data...</div>; // Show loading state
        }
        if (!isLoggedin || userData?.role !== 'admin') {
            return <Navigate to="/" replace />; // Redirect if not admin
        }
        return children; // Render child components if admin
    }

    // FallbackRoute for unmatched paths, redirects based on login status
    const FallbackRoute = () =>
        isLoggedin
            ? <Navigate to="/" replace /> // If logged in, go to home
            : <Navigate to="/loginselection" replace />; // If not, go to login selection

    return (
        // Outer container for the entire application layout
        // This div now directly controls its background and text color using theme variables
        <div className="app-container-outer">
            {/* Render Navbar only if not on an authentication page */}
            {!isAuthPage && <Navbar />}

            {/* Content wrapper, applies top padding to account for Navbar */}
            <div className="content-wrapper" style={{ paddingTop: isAuthPage ? '0' : NAVBAR_HEIGHT }}>
                {/* Flex container for sidebar and main content area */}
                <div className="d-flex main-content-area">
                    {/* Render Sidebar only if not on an authentication page */}
                    {!isAuthPage && <Sidebar />}
                    {/* Main view content area, takes remaining space */}
                    <div className="flex-grow-1 main-view-content">
                        <ToastContainer /> {/* Toast notifications container */}
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/loginselection" element={<LoginSelection />} />
                            <Route path="/reset-password" element={<ResetPassword />} />
                            <Route path="/email-verify" element={<EmailVerify />} />

                            {/* Home Route: Redirects if not logged in */}
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

                            {/* Protected User Routes (requires authentication) */}
                            <Route
                                element={
                                    <PrivateRoute>
                                        <Outlet /> {/* Renders child routes if authenticated */}
                                    </PrivateRoute>
                                }
                            >
                                <Route path="/tickets-page" element={<TicketsPage />} />
                                <Route path="/tickets" element={<TicketsPage />} />
                                <Route path="/create-ticket" element={<CreateTicket />} />
                                <Route path="/tickets/:id" element={<Ticket />} />

                                {/* Nested Protected Admin Routes (requires admin role) */}
                                <Route
                                    element={
                                        <AdminRoute>
                                            <Outlet /> {/* Renders child routes if admin */}
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

                            {/* Catch-all route for any unmatched paths */}
                            <Route path="*" element={<FallbackRoute />} />
                        </Routes>
                    </div>
                </div>
            </div>
            {/* Inline Style Block for App-specific CSS - ALL STYLES ARE HERE */}
            <style>
                {`
                    /* General Body and Root Styles - Note: Global theme variables from themes.css are crucial */
                    body {
                        margin: 0;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
                            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
                            sans-serif;
                        -webkit-font-smoothing: antialiased;
                        -moz-osx-font-smoothing: grayscale;
                        /* Background and text color are managed by the 'body' rules in themes.css,
                           which inherit from :root or [data-theme="dark"] based on data-theme attribute */
                    }

                    code {
                        font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
                            monospace;
                    }

                    a {
                        text-decoration: none !important;
                    }

                    /* App Container Styles - Ensures the very outermost container also follows the theme */
                    .app-container-outer {
                        min-height: 100vh;
                        display: flex;
                        flex-direction: column;
                        background-color: var(--background-color); /* Use theme variable */
                        color: var(--text-color); /* Use theme variable */
                        transition: background-color 0.3s ease, color 0.3s ease;
                    }

                    /* Header Styles - Use theme variables */
                    .app-header {
                        background-color: var(--primary-color); /* Using theme variable */
                        color: var(--background-color); /* Text contrasting primary color */
                        padding: 1rem 2rem;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1); /* Add a subtle shadow */
                        transition: background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
                    }

                    /* Content Wrapper to push content below Navbar */
                    .content-wrapper {
                        min-height: calc(100vh - ${NAVBAR_HEIGHT}); /* Dynamic height calculation */
                        background: var(--background-color); /* Use theme variable for main content background */
                        transition: background-color 0.3s ease;
                        flex-grow: 1; /* Allow it to take available space */
                    }

                    /* Main Content Area (Sidebar + Main View) */
                    .main-content-area {
                        min-height: 100%; /* Ensures this section fills remaining height within content-wrapper */
                        display: flex; /* Assuming it's a flex container for sidebar and main view */
                        flex-grow: 1;
                    }

                    /* Flex-grow-1 equivalent for main content area, now using padding from App.css */
                    .main-view-content {
                        padding: 32px 20px; /* Consolidate padding here */
                        width: 100%; /* Ensure it takes full width within flex context */
                        box-sizing: border-box;
                        background-color: var(--background-color); /* Ensure this also uses theme variable */
                        color: var(--text-color); /* Ensure this also uses theme variable */
                        transition: background-color 0.3s ease, color 0.3s ease;
                    }

                    /* Sidebar Nav Link Styles - Update with theme variables */
                    .sidebar-nav-link {
                        font-weight: 500;
                        color: var(--text-color) !important; /* Use theme variable */
                        font-size: 18px;
                        margin-bottom: 8px;
                        text-decoration: none;
                        transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out, padding 0.3s ease;
                        border-radius: 4px;
                        display: flex;
                        align-items: center;
                        white-space: nowrap;
                        overflow: hidden;
                    }

                    .sidebar-nav-link:hover {
                        color: var(--primary-color-hover) !important; /* Example: hover color from primary */
                        background-color: var(--card-background-light); /* Lighter background on hover */
                    }

                    .sidebar-nav-link.active {
                        font-weight: 700;
                        color: var(--primary-color) !important; /* Active link color from primary */
                        background-color: var(--active-link-background); /* Slightly different background for active */
                        border-left: 4px solid var(--primary-color); /* Border matches primary */
                        padding-left: 8px;
                    }

                    .sidebar-nav-link.active:hover {
                        color: var(--primary-color-hover) !important;
                        background-color: var(--active-link-background);
                    }

                    /* User Initial Circle Styles - Update with theme variables */
                    .user-initial-circle {
                        width: 40px;
                        height: 40px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        border-radius: 50%;
                        background-color: var(--primary-color); /* Use primary color */
                        color: var(--background-color); /* Text contrasting primary */
                        font-weight: bold;
                        font-size: 1.2rem;
                        cursor: pointer;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                        transition: background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
                    }

                    .user-initial-circle:hover {
                        background-color: var(--secondary-color); /* Slightly different color on hover */
                    }

                    /* User Dropdown Menu Styles - Update with theme variables */
                    .user-dropdown-menu {
                        position: absolute;
                        top: 100%;
                        right: 0;
                        background-color: var(--card-background); /* Use card background for dropdown */
                        border-radius: 8px;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                        min-width: 150px;
                        padding: 8px 0;
                        z-index: 1000;
                        margin-top: 10px;
                        transition: background-color 0.3s ease, box-shadow 0.3s ease;
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
                        color: var(--text-color); /* Use text color */
                        transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
                        text-align: left;
                    }

                    .user-dropdown-menu .dropdown-item:hover {
                        background-color: var(--border-color); /* Slightly lighter background on hover */
                        color: var(--primary-color); /* Hover color for text */
                    }

                    .hover-effect:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
                        cursor: pointer;
                    }

                    /* Basic Card Example (from previous Theme explanation) */
                    .card {
                      background-color: var(--card-background); /* Use theme variable */
                      border: 1px solid var(--border-color);
                      color: var(--text-color);
                      padding: 15px;
                      border-radius: 8px;
                      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                      transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
                    }

                    /* Basic Button Example (from previous Theme explanation) */
                    .btn-primary {
                      background-color: var(--primary-color);
                      color: var(--background-color);
                      padding: 10px 20px;
                      border: none;
                      border-radius: 5px;
                      cursor: pointer;
                      font-size: 1rem;
                      transition: background-color 0.3s ease, color 0.3s ease;
                    }

                    .btn-primary:hover {
                      filter: brightness(1.1);
                    }
                `}
            </style>
        </div>
    );
};

// --- Main App Component: Wraps the entire application with ThemeProvider and AppContextProvider ---
function App() {
    return (
        <ThemeProvider> {/* Provides theme context to all children */}
            <AppContextProvider> {/* Provides application context to all children */}
                <AppRoutes /> {/* Renders the main routing and layout */}
            </AppContextProvider>
        </ThemeProvider>
    );
}

export default App;
