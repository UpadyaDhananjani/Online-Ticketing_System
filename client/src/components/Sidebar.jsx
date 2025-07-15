// client/src/components/Sidebar.jsx
import React, { useContext } from 'react'; // <--- Import useContext
import { NavLink, useLocation } from 'react-router-dom';
import { Nav, Navbar } from 'react-bootstrap';
import { AppContent } from '../context/AppContext'; // <--- Import AppContent

function Sidebar() {
    const location = useLocation();
    // <--- Get userData and loadingAuth from AppContext
    const { userData, loadingAuth, isLoggedin } = useContext(AppContent);

    // Determine if the user is an admin or a regular user
    // We also check !loadingAuth to ensure userData is reliable
    const isAdmin = !loadingAuth && userData && userData.role === 'admin';
    const isRegularUser = !loadingAuth && userData && userData.role === 'user'; // Explicitly check for 'user' role

    // If still loading auth state, don't render sidebar content yet
    // Or if not logged in, only render public links if any (though for sidebar usually null is fine)
    if (loadingAuth || !isLoggedin) {
        // You can return null or a minimal sidebar here if the user is not logged in
        // or if authentication is still loading.
        // For now, returning null to hide it completely when not logged in or loading.
        return null;
    }

    return (
        <Navbar
            bg="light"
            expand="lg"
            className="flex-column align-items-start p-4"
            style={{
                width: 270,
                minHeight: '100vh',
                borderRight: '1px solid #eee',
                boxShadow: '2px 0 8px rgba(0,0,0,0.03)',
            }}
        >
            <Navbar.Brand className="mb-4" style={{ fontWeight: 700, fontSize: 28 }}>
                {/* You can add your brand/logo here if needed */}
            </Navbar.Brand>
            <Nav className="flex-column w-100">

                {/* --- Links for ALL Logged-in Users (conditional on role below) --- */}

                {/* Home Link - Navigates to "/" (App.jsx handles if it goes to Home2 or AdminDashboard) */}
                <Nav.Link
                    as={NavLink}
                    to="/"
                    className="sidebar-nav-link mt-5"
                >
                    Home
                </Nav.Link>

                {/* --- Conditional Links based on Role --- */}

                {isAdmin && (
                    <>
                        {/* Admin-specific links */}
                        <Nav.Link
                            as={NavLink}
                            to="/admin"
                            className="sidebar-nav-link"
                        >
                            Admin Dashboard
                        </Nav.Link>
                    </>
                )}

                {isRegularUser && (
                    <>
                        {/* Regular User-specific links */}
                        <Nav.Link
                            as={NavLink}
                            to="/create-ticket"
                            className="sidebar-nav-link"
                        >
                            Create Ticket
                        </Nav.Link>
                        <Nav.Link
                            as={NavLink}
                            to="/tickets"
                            className="sidebar-nav-link"
                        >
                            My Tickets
                        </Nav.Link>
                        {/* Add "My Open Tickets" and "My Resolved Tickets" if needed, as in your previous version */}
                        <Nav.Link
                            as={NavLink}
                            to="/tickets/open"
                            className="sidebar-nav-link"
                        >
                            My Open Tickets
                        </Nav.Link>
                        <Nav.Link
                            as={NavLink}
                            to="/tickets/resolved"
                            className="sidebar-nav-link"
                        >
                            My Resolved Tickets
                        </Nav.Link>
                    </>
                )}
            </Nav>
            {/* Embedded CSS for Sidebar Links (remains unchanged) */}
            <style>{`
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
                a {
                    text-decoration: none !important;
                }
            `}</style>
        </Navbar>
    );
}

export default Sidebar;