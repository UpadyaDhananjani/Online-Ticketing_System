import React, { useContext, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Nav, Navbar } from 'react-bootstrap';
import { AppContent } from '../context/AppContext';

function Sidebar() {
    const location = useLocation();
    const { userData, loadingAuth, isLoggedin } = useContext(AppContent);

    // State to manage sidebar collapse/expand
    const [isCollapsed, setIsCollapsed] = useState(false);

    const isAdmin = !loadingAuth && userData && userData.role === 'admin';
    const isRegularUser = !loadingAuth && userData && userData.role === 'user';

    // Don't render sidebar if not logged in or still loading auth state
    if (loadingAuth || !isLoggedin) {
        return null;
    }

    // Determine sidebar width based on collapsed state
    const sidebarWidth = isCollapsed ? '80px' : '270px';
    const linkPadding = isCollapsed ? '8px' : '8px 12px'; // Adjust padding for collapsed state
    // Removed brandFontSize as "Menu" text is removed
    // const brandFontSize = isCollapsed ? '0' : '28px'; 

    return (
        <Navbar
            bg="light"
            expand="lg"
            className="flex-column align-items-start p-4 transition-all duration-300 ease-in-out"
            style={{
                width: sidebarWidth, // Dynamic width
                minHeight: '100vh',
                borderRight: '1px solid #eee',
                boxShadow: '2px 0 8px rgba(0,0,0,0.03)',
                position: 'sticky',
                top: 0,
                left: 0,
                zIndex: 999
            }}
        >
            {/* Toggle Button for Sidebar */}
            <div className={`w-100 d-flex ${isCollapsed ? 'justify-content-center' : 'justify-content-end'} mb-4`}>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
                    style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    <i className={`bi ${isCollapsed ? 'bi-arrow-right-square' : 'bi-arrow-left-square'}`} style={{ fontSize: '1.2rem' }}></i>
                </button>
            </div>

            {/* Navbar Brand - "Menu" text removed */}
            <Navbar.Brand className="mb-4 text-center" style={{ fontWeight: 700, fontSize: '0', overflow: 'hidden', whiteSpace: 'nowrap', transition: 'font-size 0.3s ease' }}>
                {/* No text here now */}
            </Navbar.Brand>

            <Nav className="flex-column w-100">
                <Nav.Link
                    as={NavLink}
                    to="/"
                    className="sidebar-nav-link"
                    style={{ padding: linkPadding }}
                >
                    <i className="bi bi-house-door-fill me-2"></i> {/* Home icon */}
                    {!isCollapsed && "Home"} {/* Conditionally render text */}
                </Nav.Link>

                {isAdmin && (
                    <Nav.Link
                        as={NavLink}
                        to="/admin"
                        className="sidebar-nav-link"
                        style={{ padding: linkPadding }}
                    >
                        <i className="bi bi-speedometer2 me-2"></i> {/* Dashboard icon */}
                        {!isCollapsed && "Admin Dashboard"}
                    </Nav.Link>
                )}

                {isRegularUser && (
                    <>
                        <Nav.Link
                            as={NavLink}
                            to="/create-ticket"
                            className="sidebar-nav-link"
                            style={{ padding: linkPadding }}
                        >
                            <i className="bi bi-plus-square-fill me-2"></i> {/* Create Ticket icon */}
                            {!isCollapsed && "Create Ticket"}
                        </Nav.Link>
                        <Nav.Link
                            as={NavLink}
                            to="/tickets"
                            className="sidebar-nav-link"
                            style={{ padding: linkPadding }}
                        >
                            <i className="bi bi-ticket-fill me-2"></i> {/* Track Ticket Status icon */}
                            {!isCollapsed && "Track Ticket Status"}
                        </Nav.Link>
                    </>
                )}
            </Nav>

            <style>{`
                /* Ensure Bootstrap icons are loaded */
                @import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css");

                .sidebar-nav-link {
                    font-weight: 500;
                    color: #222 !important;
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