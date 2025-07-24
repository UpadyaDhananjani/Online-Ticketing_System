// components/OpenTickets.jsx
import React from 'react';
import AllTickets from './AllTickets'; // Import the base component

function OpenTickets({ onSelect, token, refresh }) {
  // Pass the initialStatusFilter prop to AllTickets
  return (
    <AllTickets
      onSelect={onSelect}
      token={token}
      refresh={refresh}
      initialStatusFilter="open" // Set initial filter to "open"
    />
  );
}

export default OpenTickets;