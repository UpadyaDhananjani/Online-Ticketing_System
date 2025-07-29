// components/ResolvedTickets.jsx
import React from 'react';
import AllTickets from './AllTickets'; // Import the base component
import { useNavigate } from "react-router-dom";

function ResolvedTickets({ onSelect, token, refresh }) {
  const navigate = useNavigate();

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

function TicketList({ tickets }) {
  const navigate = useNavigate();

  return (
    <table>
      <tbody>
        {tickets.map(ticket => (
          <tr
            key={ticket._id}
            style={{ cursor: "pointer" }}
            onClick={() => navigate(`/admin/tickets/${ticket._id}/reply`)}
          >
            <td>{ticket.subject}</td>
            {/* ...other columns... */}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ResolvedTickets;