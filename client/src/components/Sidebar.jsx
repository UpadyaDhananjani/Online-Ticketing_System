// client/src/components/Sidebar.jsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Nav, Navbar } from 'react-bootstrap';

function Sidebar() {
  const location = useLocation();

  return (
    <Navbar
      bg="light"
      expand="lg"
      className="flex-column align-items-start p-4"
      style={{
        width: 220,
        minHeight: '100vh',
        borderRight: '1px solid #eee',
        boxShadow: '2px 0 8px rgba(0,0,0,0.03)',
      }}
    >
      <Navbar.Brand className="mb-4" style={{ fontWeight: 700, fontSize: 28 }}>
        
      </Navbar.Brand>
      <Nav className="flex-column w-100">

        {/* Home Link - Navigates to "/" which is mapped to Home2.jsx */}
        <Nav.Link
          as={NavLink}
          to="/"
          className="sidebar-nav-link mt-5" // This class will be styled by the <style> tag below
        >
          Home
        </Nav.Link>

        {/* Other sidebar links */}
        <Nav.Link
          as={NavLink}
          to="/create-ticket"
          className="sidebar-nav-link"
        >
          Create Ticket
        </Nav.Link>

        {/* My Tickets with sub-links */}
        <div>
          <Nav.Link
            as={NavLink}
            to="/tickets"
            className="sidebar-nav-link"
            style={{ fontWeight: 600 }}
          >
            My Tickets
          </Nav.Link>
          <div style={{ paddingLeft: 18 }}>
            <Nav.Link
              as={NavLink}
              to="/tickets/open"
              className="sidebar-nav-link"
              style={{ fontSize: 16 }}
            >
              My Open Tickets
            </Nav.Link>
            <Nav.Link
              as={NavLink}
              to="/tickets/resolved"
              className="sidebar-nav-link"
              style={{ fontSize: 16 }}
            >
              My Resolved Tickets
            </Nav.Link>
          </div>
        </div>

        <Nav.Link
          as={NavLink}
          to="/admin"
          className="sidebar-nav-link"
        >
          Admin Dashboard
        </Nav.Link>
      </Nav>

      {/* Embedded CSS for Sidebar Links */}
      <style jsx>{`
        /* Common styles for all sidebar navigation links */
        .sidebar-nav-link {
          font-weight: 500;
          color: #222 !important; /* Override Bootstrap's default link color */
          font-size: 18px;
          margin-bottom: 8px; /* Spacing between links */
          text-decoration: none; /* Remove underline */
          transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out; /* Smooth transitions */
          padding: 8px 12px; /* Padding inside each link */
          border-radius: 4px; /* Slightly rounded corners */
          display: block; /* Make the entire padded area clickable */
        }

        /* Hover state for sidebar links */
        .sidebar-nav-link:hover {
          color: #0056b3 !important; /* Darker blue on hover */
          background-color: #f0f2f5; /* Light background on hover */
        }

        /* Active state for sidebar links (NavLink automatically adds the 'active' class) */
        .sidebar-nav-link.active {
          font-weight: 700; /* Bold when active */
          color: #007bff !important; /* Bright blue when active */
          background-color: #e9ecef; /* Slightly darker background for active */
          border-left: 4px solid #007bff; /* Visual cue for active state */
          padding-left: 8px; /* Adjust padding if a left border is added */
        }

        /* Ensure active link also has proper hover state */
        .sidebar-nav-link.active:hover {
          color: #0056b3 !important; /* Keep darker blue on hover even when active */
          background-color: #e9ecef; /* Keep active background on hover */
        }

        /* General link underline removal - you might have this in App.css already */
        a {
            text-decoration: none !important;
        }
      `}</style>
    </Navbar>
  );
}

export default Sidebar;