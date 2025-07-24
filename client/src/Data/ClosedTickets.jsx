// components/ClosedTickets.jsx
import React from 'react';
import AllTickets from './AllTickets'; // Import the base component

function ClosedTickets({ onSelect, token, refresh }) {
  // Pass the initialStatusFilter prop to AllTickets
  return (
    <AllTickets
      onSelect={onSelect}
      token={token}
      refresh={refresh}
      initialStatusFilter="closed" // Set initial filter to "closed"
    />
  );
}

export default ClosedTickets;