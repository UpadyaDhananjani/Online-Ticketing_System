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
        {/* Home Link - Navigates to "/" which is mapped to Home2.jsx */}
        <Nav.Link
          as={NavLink}
          to="/"
          className="sidebar-nav-link mt-5"
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
        <Nav.Link
          as={NavLink}
          to="/tickets"
          className="sidebar-nav-link"
        >
          My Tickets
        </Nav.Link>
        
      
       
        <Nav.Link
          as={NavLink}
          to="/admin"
          className="sidebar-nav-link"
        >
          Admin Dashboard
        </Nav.Link>
      </Nav>
      {/* Embedded CSS for Sidebar Links */}
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
