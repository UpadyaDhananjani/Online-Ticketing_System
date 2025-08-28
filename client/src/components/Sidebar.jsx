import React, { useContext, useState } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { Nav, Navbar } from 'react-bootstrap';
// Correcting the import paths for the missing modules
// In a real application, you would ensure these files exist at the specified paths.
import { AppContent } from '../context/AppContext'; 
import ThemeToggle from './ThemeToggle';
import NotificationIcon from './notifications/NotificationIcon';
import NotificationPanel from './notifications/NotificationPanel';

/**
 * Renders the responsive and role-based sidebar for the application.
 * It includes navigation links, a collapse/expand toggle, a theme toggle,
 * and dynamic menus for admin-specific data and user notifications.
 */
function Sidebar() {
    // Hooks for managing state and context
    const location = useLocation();
    const { userData, loadingAuth, isLoggedin } = useContext(AppContent);

    // State to manage sidebar collapse/expand
    const [isCollapsed, setIsCollapsed] = useState(false);
    // State to manage visibility of "Data" sub-menu
    const [showDataSubMenu, setShowDataSubMenu] = useState(false);
    // State to manage visibility of "Notifications" panel
    const [showNotificationPanel, setShowNotificationPanel] = useState(false);
    // State to manage visibility of "Management" sub-menu
    const [showManagementSubMenu, setShowManagementSubMenu] = useState(false);

    // Check user roles
    const isAdmin = !loadingAuth && userData && userData.role === 'admin';
    const isRegularUser = !loadingAuth && userData && userData.role === 'user';

    // Do not render sidebar if not logged in or still loading auth state
    if (loadingAuth || !isLoggedin) {
        return null;
    }

    // Determine sidebar width based on collapsed state
    const sidebarWidth = isCollapsed ? '80px' : '270px';
    const linkPadding = isCollapsed ? '8px' : '8px 12px'; // Adjust padding for collapsed state

    /**
     * Toggles the visibility of the notifications panel.
     */
    const handleNotificationsClick = () => {
        setShowNotificationPanel(!showNotificationPanel);
    };

    return (
        <Navbar
            expand="lg"
            className="flex-column align-items-start p-4 transition-all duration-300 ease-in-out sidebar"
            style={{
                width: sidebarWidth,
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
                    title={isCollapsed ? "Sidebar visthaarit karo" : "Sidebar ne sankuchit karo"}
                >
                    <i className={`bi ${isCollapsed ? 'bi-arrow-right-square' : 'bi-arrow-left-square'}`}></i>
                </button>
            </div>

            {/* Theme Toggle Button */}
            <div className={`w-100 d-flex ${isCollapsed ? 'justify-content-center' : 'justify-content-end'} mb-4`}>
                <ThemeToggle />
            </div>

            {/* Navbar Brand - now just a space holder for responsiveness */}
            <Navbar.Brand className="mb-4 text-center" style={{ fontWeight: 700, fontSize: '0', overflow: 'hidden', whiteSpace: 'nowrap', transition: 'font-size 0.3s ease' }}>
            </Navbar.Brand>

            <Nav className="flex-column w-100">
                <Nav.Link
                    as={NavLink}
                    to="/"
                    className="sidebar-nav-link"
                    style={{ padding: linkPadding }}
                >
                    <i className="bi bi-house-door-fill me-2"></i>
                    {!isCollapsed && "Home"}
                </Nav.Link>

                {/* Notifications Link - visible to both admin and regular user */}
                {(isAdmin || isRegularUser) && (
                    <div className="notifications-menu-container">
                        <Nav.Link
                            onClick={handleNotificationsClick}
                            className="sidebar-nav-link"
                            style={{ padding: linkPadding, cursor: 'pointer' }}
                        >
                            <div className="d-flex align-items-center position-relative">
                                <NotificationIcon 
                                    isCollapsed={isCollapsed}
                                    onClick={handleNotificationsClick}
                                />
                                {!isCollapsed && (
                                    <i className={`bi ms-auto ${showNotificationPanel ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                                )}
                            </div>
                        </Nav.Link>
                    </div>
                )}

                {isAdmin && (
                    <>
                        <Nav.Link
                            as={NavLink}
                            to="/admin"
                            className="sidebar-nav-link"
                            style={{ padding: linkPadding }}
                        >
                            <i className="bi bi-speedometer2 me-2"></i>
                            {!isCollapsed && "Admin Dashboard"}
                        </Nav.Link>

                        {/* Data Button and Sub-Menu */}
                        <div className="data-menu-container">
                            <Nav.Link
                                onClick={() => setShowDataSubMenu(!showDataSubMenu)}
                                className="sidebar-nav-link"
                                style={{ padding: linkPadding, cursor: 'pointer' }}
                            >
                                <i className="bi bi-database-fill me-2"></i>
                                {!isCollapsed && "Data"}
                                {!isCollapsed && (
                                    <i className={`bi ms-auto ${showDataSubMenu ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                                )}
                            </Nav.Link>

                            {showDataSubMenu && !isCollapsed && (
                                <div className="data-sub-menu" style={{ marginLeft: '20px', borderLeft: '2px solid var(--border-color)', paddingLeft: '10px' }}>
                                    <Nav.Link
                                        as={NavLink}
                                        to="/admin/tickets/all"
                                        className="sidebar-nav-link sub-link"
                                        style={{ padding: '8px 12px' }}
                                    >
                                        <i className="bi bi-list-ul me-2"></i>
                                        All Tickets
                                    </Nav.Link>
                                    <Nav.Link
                                        as={NavLink}
                                        to="/admin/tickets/open"
                                        className="sidebar-nav-link sub-link"
                                        style={{ padding: '8px 12px' }}
                                    >
                                        <i className="bi bi-folder-symlink-fill me-2"></i>
                                        Open Tickets
                                    </Nav.Link>
                                    <Nav.Link
                                        as={NavLink}
                                        to="/admin/tickets/in-progress"
                                        className="sidebar-nav-link sub-link"
                                        style={{ padding: '8px 12px' }}
                                    >
                                        <i className="bi bi-hourglass-split me-2"></i>
                                        In Progress Tickets
                                    </Nav.Link>
                                    <Nav.Link
                                        as={NavLink}
                                        to="/admin/tickets/resolved"
                                        className="sidebar-nav-link sub-link"
                                        style={{ padding: '8px 12px' }}
                                    >
                                        <i className="bi bi-check-circle-fill me-2"></i>
                                        Resolved Tickets
                                    </Nav.Link>
                                    <Nav.Link
                                        as={NavLink}
                                        to="/admin/tickets/closed"
                                        className="sidebar-nav-link sub-link"
                                        style={{ padding: '8px 12px' }}
                                    >
                                        <i className="bi bi-x-circle-fill me-2"></i>
                                        Closed Tickets
                                    </Nav.Link>
                                </div>
                            )}
                        </div>

                        {/* Management Section */}
                        <div className="management-menu-container">
                            <Nav.Link
                                onClick={() => setShowManagementSubMenu(!showManagementSubMenu)}
                                className="sidebar-nav-link"
                                style={{ padding: linkPadding, cursor: 'pointer' }}
                            >
                                <i className="bi bi-gear-fill me-2"></i>
                                {!isCollapsed && "Management"}
                                {!isCollapsed && (
                                    <i className={`bi ms-auto ${showManagementSubMenu ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                                )}
                            </Nav.Link>

                            {showManagementSubMenu && !isCollapsed && (
                                <div className="management-sub-menu" style={{ marginLeft: '20px', borderLeft: '2px solid var(--border-color)', paddingLeft: '10px' }}>
                                    <Nav.Link
                                        as={NavLink}
                                        to="/admin/users"
                                        className="sidebar-nav-link sub-link"
                                        style={{ padding: '8px 12px' }}
                                    >
                                        <i className="bi bi-people-fill me-2"></i>
                                        All Users
                                    </Nav.Link>
                                    {/* Add other management links here */}
                                </div>
                            )}
                        </div>

                        <Nav.Link
                            as={NavLink}
                            to="/reports"
                            className="sidebar-nav-link"
                            style={{ padding: linkPadding }}
                        >
                            <i className="bi bi-bar-chart-fill me-2"></i>
                            {!isCollapsed && "Reports"}
                        </Nav.Link>
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
                            <i className="bi bi-plus-square-fill me-2"></i>
                            {!isCollapsed && "Create Ticket"}
                        </Nav.Link>
                        <Nav.Link
                            as={NavLink}
                            to="/tickets"
                            className="sidebar-nav-link"
                            style={{ padding: linkPadding }}
                        >
                            <i className="bi bi-ticket-fill me-2"></i>
                            {!isCollapsed && "Track Ticket Status"}
                        </Nav.Link>
                    </>
                )}
            </Nav>

            {/* Notification Panel */}
            {showNotificationPanel && !isCollapsed && (
                <div className="notification-panel-container" style={{ 
                    position: 'absolute',
                    top: '0',
                    left: '100%',
                    width: '400px',
                    height: '100vh',
                    zIndex: 1000,
                    backgroundColor: 'var(--bs-body-bg)',
                    boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
                    borderLeft: '1px solid var(--bs-border-color)'
                }}>
                    <NotificationPanel onClose={() => setShowNotificationPanel(false)} />
                </div>
            )}

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
                    opacity: 0.8; /* Slightly muted for sub-links */
                }
                .sidebar-nav-link.sub-link:hover {
                    opacity: 1;
                }
                .sidebar-nav-link.sub-link.active {
                    border-left: 4px solid var(--primary-color); /* Use theme variable */
                    /* Maintain indent with border */
                    padding-left: calc(${linkPadding} + 15px);
                    opacity: 1; /* Full opacity for active sub-links */
                }
                .sidebar-nav-link.sub-link.unread {
                    font-weight: 600; /* Bold unread messages */
                    color: var(--text-color) !important;
                }
                .data-menu-container, .notifications-menu-container {
                    width: 100%; /* Ensure container takes full width */
                }
                .data-sub-menu, .notifications-sub-menu {
                    transition: all 0.3s ease-in-out; /* Smooth transition for sub-menus */
                    display: flex;
                    flex-direction: column;
                }

                /* Notification badge styling */
                .badge-notification {
                    top: 0;
                    right: 0;
                    padding: 2px 6px;
                    font-size: 12px;
                    font-weight: bold;
                    color: #fff;
                    background-color: #dc3545; /* Red for notifications */
                    border-radius: 10px;
                    border: 1px solid var(--sidebar-bg); /* Add a border to stand out */
                }
            `}</style>
        </Navbar>
    );
}

export default Sidebar;
