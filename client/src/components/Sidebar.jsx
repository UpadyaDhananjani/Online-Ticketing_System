import React from 'react';

function Sidebar() {
  return (
    <div style={{ width: 200, height: '100vh', background: '#f4f4f4', padding: 20, boxSizing: 'border-box' }}>
      <h3>Navigation</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li>
          <a href="#ticket-list" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>
            Ticket List
          </a>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar; 