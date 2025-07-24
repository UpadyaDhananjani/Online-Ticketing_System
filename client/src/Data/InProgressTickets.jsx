// components/InProgressTickets.jsx
import React from 'react';
import AllTickets from './AllTickets'; // Import the base component

function InProgressTickets({ onSelect, token, refresh }) {
  // Pass the initialStatusFilter prop to AllTickets
  return (
    <AllTickets
      onSelect={onSelect}
      token={token}
      refresh={refresh}
      initialStatusFilter="in progress" // Set initial filter to "in progress"
    />
  );
}

export default InProgressTickets;