// components/ResolvedTickets.jsx
import React from 'react';
import AllTickets from './AllTickets'; // Import the base component

function ResolvedTickets({ onSelect, token, refresh }) {
  // Pass the initialStatusFilter prop to AllTickets
  return (
    <AllTickets
      onSelect={onSelect}
      token={token}
      refresh={refresh}
      initialStatusFilter="resolved" // Set initial filter to "resolved"
    />
  );
}

export default ResolvedTickets;