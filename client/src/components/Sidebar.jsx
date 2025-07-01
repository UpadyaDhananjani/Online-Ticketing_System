import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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

        {/* Home Link */}
        <Nav.Link
          as={Link}
          to="/"
          active={location.pathname === '/'}
          style={{
            fontWeight: location.pathname === '/' ? 700 : 500,
            color: '#222',
            fontSize: 18,
            marginBottom: 8,
          }}
        >
          Home
        </Nav.Link>

        <Nav.Link
          as={Link}
          to="/tickets"
          active={location.pathname === '/tickets'}
          style={{
            fontWeight: location.pathname === '/tickets' ? 700 : 500,
            color: '#222',
            fontSize: 18,
            marginBottom: 8,
          }}
        >
          Ticket List
        </Nav.Link>
        <Nav.Link
          as={Link}
          to="/create-ticket"
          active={location.pathname === '/create-ticket'}
          style={{
            fontWeight: location.pathname === '/create-ticket' ? 700 : 500,
            color: '#222',
            fontSize: 18,
            marginBottom: 8,
          }}
        >
          Create Ticket
        </Nav.Link>
        <Nav.Link
          as={Link}
          to="/tickets/open"
          active={location.pathname === '/tickets/open'}
          style={{
            fontWeight: location.pathname === '/tickets/open' ? 700 : 500,
            color: '#222',
            fontSize: 18,
            marginBottom: 8,
          }}
        >
          Open Tickets
        </Nav.Link>
        <Nav.Link
          as={Link}
          to="/tickets/resolved"
          active={location.pathname === '/tickets/resolved'}
          style={{
            fontWeight: location.pathname === '/tickets/resolved' ? 700 : 500,
            color: '#222',
            fontSize: 18,
            marginBottom: 8,
          }}
        >
          Resolved Tickets
        </Nav.Link>
        <Nav.Link
          as={Link}
          to="/admin"
          active={location.pathname === '/admin'}
          style={{
            fontWeight: location.pathname === '/admin' ? 700 : 500,
            color: '#222',
            fontSize: 18,
          }}
        >
          Admin Dashboard
        </Nav.Link>
      </Nav>
    </Navbar>
  );
}

export default Sidebar;
