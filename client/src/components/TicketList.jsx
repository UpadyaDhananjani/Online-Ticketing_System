import React, { useEffect, useState } from 'react';
import { getTickets } from '../api/ticketApi';
import { useNavigate } from 'react-router-dom';
import { Badge } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const statusColors = {
  open: "success",
  closed: "danger",
  resolved: "primary",

  reopened: "warning"
};

function TicketList({ token, filter }) {

  reopened: "warning",
  "in progress": "info"
};

// Removed 'token' prop from function signature
function TicketList({ filter }) { 

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Frontend (User TicketList): Fetching tickets...");
        // Now calls getTickets from ticketApi.js which no longer requires 'token' param
        const res = await axios.get('/api/tickets', { 
          withCredentials: true 
        });
        console.log("Frontend (User TicketList): Received tickets data:", res.data);
        setTickets(res.data);
      } catch (err) {
        console.error("Frontend (User TicketList): Error fetching tickets:", err);
        setError(err.response?.data?.error || err.message || "Failed to fetch tickets.");
        toast.error(err.response?.data?.error || err.message || "Failed to fetch tickets.");
      } finally {
        setLoading(false);
      }
    };

    if (location.pathname === '/tickets' || location.pathname === '/tickets-page' || filter) {
        fetchTickets();
    }
  }, [location.pathname, filter]);

  const filteredTickets = filter
    ? tickets.filter(ticket => ticket.status === filter)
    : tickets;

  return (
    <div style={{ maxWidth: 900, margin: '30px auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 20 }}>My Tickets</h2>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        borderRadius: 8,
        overflow: 'hidden'
      }}>
        <thead style={{ background: '#f5f6fa' }}>
          <tr>
            <th style={thStyle}><i className="bi bi-card-text me-1"></i>Subject</th>
            <th style={thStyle}><i className="bi bi-tag me-1"></i>Type</th>
            <th style={thStyle}><i className="bi bi-diagram-3 me-1"></i>Assigned Unit</th>
            <th style={thStyle}><i className="bi bi-info-circle me-1"></i>Status</th>
            <th style={thStyle}><i className="bi bi-calendar me-1"></i>Created</th>
          </tr>
        </thead>
        <tbody>
          {filteredTickets.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', padding: 20, color: '#888' }}>
                No tickets found.
              </td>
            </tr>
          ) : (
            filteredTickets.map(ticket => (
              <tr


                key={ticket._id}
                style={{
                  borderBottom: '1px solid #eee',
                  background: ticket.status === 'open' ? '#e6ffe6' : undefined,
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onClick={() => navigate(`/tickets/${ticket._id}`)}
                onMouseOver={e => e.currentTarget.style.background = '#f0f4ff'}
                onMouseOut={e => e.currentTarget.style.background = ticket.status === 'open' ? '#e6ffe6' : ''}
              >
                <td style={tdStyle}>
                  <i className="bi bi-card-text me-2 text-primary"></i>
                  {ticket.subject}
                </td>
                <td style={tdStyle}>
                  <Badge bg="info" text="dark" className="text-capitalize">
                    <i className="bi bi-tag me-1"></i>
                    {ticket.type ? ticket.type.charAt(0).toUpperCase() + ticket.type.slice(1) : '—'}
                  </Badge>
                </td>
                <td style={tdStyle}>
                  <Badge bg="secondary" className="text-capitalize">
                    <i className="bi bi-diagram-3 me-1"></i>
                    {ticket.assignedUnit || '—'}
                  </Badge>
                </td>
       {/* REMOVED: Requester Data Cell from user-facing TicketList */}

                <td style={tdStyle}>
                  <Badge
                    bg={statusColors[ticket.status] || "secondary"}
                    className="px-3 py-2 text-capitalize"
                  >
                    <i className="bi bi-info-circle me-1"></i>
                    {ticket.status}
                  </Badge>
                </td>
                <td style={tdStyle}>
                  <i className="bi bi-calendar me-2 text-secondary"></i>
                  {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : '-'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  padding: '12px 10px',
  background: '#f5f6fa',
  fontWeight: 600,
  fontSize: 16,
  borderBottom: '2px solid #e1e1e1',
  textAlign: 'left'
};

const tdStyle = {
  padding: '10px 8px',
  fontSize: 15,
  verticalAlign: 'middle'
};

export default TicketList;
