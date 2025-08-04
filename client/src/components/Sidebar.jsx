import React, { useContext, useState } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { Nav, Navbar } from 'react-bootstrap';
import { AppContent } from '../context/AppContext';
import ThemeToggle from './ThemeToggle'; // <--- NEW: Import ThemeToggle

function Sidebar() {
    const location = useLocation();
    const { userData, loadingAuth, isLoggedin } = useContext(AppContent);

    // State to manage sidebar collapse/expand
    const [isCollapsed, setIsCollapsed] = useState(false);
    // State to manage visibility of "Data" sub-menu
    const [showDataSubMenu, setShowDataSubMenu] = useState(false);

    const isAdmin = !loadingAuth && userData && userData.role === 'admin';
    const isRegularUser = !loadingAuth && userData && userData.role === 'user';

    // Don't render sidebar if not logged in or still loading auth state
    if (loadingAuth || !isLoggedin) {
        return null;
    }

    // Determine sidebar width based on collapsed state
    const sidebarWidth = isCollapsed ? '80px' : '270px';
    const linkPadding = isCollapsed ? '8px' : '8px 12px'; // Adjust padding for collapsed state

    return (
        <Navbar
            // Removed bg="light" and added 'sidebar' class for theme-controlled styling
            expand="lg"
            className="flex-column align-items-start p-4 transition-all duration-300 ease-in-out sidebar" // <--- NEW: Added 'sidebar' class
            style={{
                width: sidebarWidth, // Dynamic width
                minHeight: '100vh',
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

            {/* NEW: Theme Toggle Button */}
            <div className={`w-100 d-flex ${isCollapsed ? 'justify-content-center' : 'justify-content-end'} mb-4`}>
                <ThemeToggle /> {/* <--- NEW: Placed ThemeToggle here */}
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
                    <>
                        <Nav.Link
                            as={NavLink}
                            to="/admin"
                            className="sidebar-nav-link"
                            style={{ padding: linkPadding }}
                        >
                            <i className="bi bi-speedometer2 me-2"></i> {/* Dashboard icon */}
                            {!isCollapsed && "Admin Dashboard"}
                        </Nav.Link>

                        {/* NEW: Data Button and Sub-Menu */}
                        <div className="data-menu-container">
                            <Nav.Link
                                onClick={() => setShowDataSubMenu(!showDataSubMenu)}
                                className="sidebar-nav-link"
                                style={{ padding: linkPadding, cursor: 'pointer' }}
                            >
                                <i className="bi bi-database-fill me-2"></i> {/* Data icon */}
                                {!isCollapsed && "Data"}
                                {!isCollapsed && (
                                    <i className={`bi ms-auto ${showDataSubMenu ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                                )}
                            </Nav.Link>

                            {showDataSubMenu && !isCollapsed && (
                                <div className="data-sub-menu" style={{ marginLeft: '20px', borderLeft: '2px solid var(--border-color)', paddingLeft: '10px' }}> {/* <--- Using theme variable */}
                                    <Nav.Link
                                        as={NavLink}
                                        to="/admin/tickets/all" // Example path for all tickets
                                        className="sidebar-nav-link sub-link"
                                        style={{ padding: '8px 12px' }}
                                    >
                                        <i className="bi bi-list-ul me-2"></i>
                                        All Tickets
                                    </Nav.Link>
                                    <Nav.Link
                                        as={NavLink}
                                        to="/admin/tickets/open" // Example path for open tickets
                                        className="sidebar-nav-link sub-link"
                                        style={{ padding: '8px 12px' }}
                                    >
                                        <i className="bi bi-folder-symlink-fill me-2"></i>
                                        Open Tickets
                                    </Nav.Link>
                                    <Nav.Link
                                        as={NavLink}
                                        to="/admin/tickets/in-progress" // Example path for in progress tickets
                                        className="sidebar-nav-link sub-link"
                                        style={{ padding: '8px 12px' }}
                                    >
                                        <i className="bi bi-hourglass-split me-2"></i>
                                        In Progress Tickets
                                    </Nav.Link>
                                    <Nav.Link
                                        as={NavLink}
                                        to="/admin/tickets/resolved" // Example path for resolved tickets
                                        className="sidebar-nav-link sub-link"
                                        style={{ padding: '8px 12px' }}
                                    >
                                        <i className="bi bi-check-circle-fill me-2"></i>
                                        Resolved Tickets
                                    </Nav.Link>
                                    <Nav.Link
                                        as={NavLink}
                                        to="/admin/tickets/closed" // Example path for closed tickets
                                        className="sidebar-nav-link sub-link"
                                        style={{ padding: '8px 12px' }}
                                    >
                                        <i className="bi bi-x-circle-fill me-2"></i>
                                        Closed Tickets
                                    </Nav.Link>
                                </div>
                            )}
                        </div>
                    </>
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
                <Nav.Link
                    as={NavLink}
                    to="/reports"
                    className="sidebar-nav-link"
                    style={{ padding: linkPadding }}
                >
                    <i className="bi bi-bar-chart-fill me-2"></i> {/* Reports icon */}
                    {!isCollapsed && "Reports"}
                </Nav.Link>
            </Nav>

            <style>{`
                /* Ensure Bootstrap icons are loaded (though typically done in main.jsx/index.js) */
                @import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css");

                /* Sidebar container styling - now uses theme variables */
                .sidebar {
                    background-color: var(--sidebar-bg); /* Use theme variable */
                    border-right: 1px solid var(--sidebar-border); /* Use theme variable */
                    box-shadow: 2px 0 8px var(--sidebar-shadow); /* Use theme variable */
                    transition: width 0.3s ease, background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
                }

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
                    color: var(--primary-color-hover) !important; /* Use theme variable for hover */
                    background-color: var(--card-background-light); /* Use theme variable for hover background */
                }
                .sidebar-nav-link.active {
                    font-weight: 700;
                    color: var(--primary-color) !important; /* Use theme variable */
                    background-color: var(--active-link-background); /* Use theme variable */
                    border-left: 4px solid var(--primary-color); /* Use theme variable */
                    padding-left: 8px;
                }
                .sidebar-nav-link.active:hover {
                    color: var(--primary-color-hover) !important; /* Use theme variable */
                    background-color: var(--active-link-background); /* Use theme variable */
                }
                a {
                    text-decoration: none !important;
                }
                /* Styling for sub-links */
                .sidebar-nav-link.sub-link {
                    font-size: 16px; /* Slightly smaller font for sub-links */
                    /* Calculate padding based on linkPadding variable from JS */
                    padding-left: calc(${linkPadding} + 15px); /* Indent sub-links */
                    margin-bottom: 4px; /* Less margin between sub-links */
                    color: var(--text-color-secondary) !important; /* Use theme variable */
                }
                .sidebar-nav-link.sub-link.active {
                    border-left: 4px solid var(--primary-color); /* Use theme variable */
                    /* Maintain indent with border */
                    padding-left: calc(${linkPadding} + 15px);
                }
                .data-menu-container {
                    width: 100%; /* Ensure container takes full width */
                }
                .data-sub-menu {
                    transition: all 0.3s ease-in-out; /* Smooth transition for sub-menu */
                }
            `}</style>
        </Navbar>
    );
}

export default Sidebar;