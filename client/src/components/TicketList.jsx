import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const statusColors = {
  open: "success",
  closed: "danger",
  resolved: "primary",
  reopened: "warning",
  "in progress": "info"
};

function TicketList({ filter, mode = 'created', userId }) { 
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get('/api/tickets', { 
          withCredentials: true 
        });
        setTickets(res.data);
      } catch (err) {
        const msg = err.response?.data?.error || err.message || "Failed to fetch tickets.";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  // Filtering logic
  let filteredTickets = tickets;
  if (mode === 'created' && userId) {
    filteredTickets = tickets.filter(ticket => ticket.user === userId || ticket.user?._id === userId);
  } else if (mode === 'received' && userId) {
    filteredTickets = tickets.filter(ticket => ticket.assignedTo === userId || ticket.assignedTo?._id === userId);
  }
  if (filter) {
    filteredTickets = filteredTickets.filter(ticket => ticket.status === filter);
  }

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: 50 }}>Loading tickets...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', marginTop: 50, color: 'red' }}>{error}</div>;
  }

  return (
    <div style={{ maxWidth: 900, margin: '30px auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 20 }}>
        {mode === 'created' ? 'My Created Tickets' : 'Tickets Assigned to Me'}
      </h2>
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
            {mode === 'created' ? (
              <th style={thStyle}><i className="bi bi-person me-1"></i>Assigned To</th>
            ) : (
              <th style={thStyle}><i className="bi bi-person me-1"></i>Requester</th>
            )}
            <th style={thStyle}><i className="bi bi-info-circle me-1"></i>Status</th>
            <th style={thStyle}><i className="bi bi-calendar me-1"></i>Created</th>
          </tr>
        </thead>
        <tbody>
          {filteredTickets.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: 20, color: '#888' }}>
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
                <td style={tdStyle}>
                  {mode === 'created'
                    ? (ticket.assignedTo?.name
                        ? `${ticket.assignedTo.name}${ticket.assignedTo.email ? ' (' + ticket.assignedTo.email + ')' : ''}`
                        : (ticket.assignedTo || '—'))
                    : (ticket.user?.name
                        ? `${ticket.user.name}${ticket.user.email ? ' (' + ticket.user.email + ')' : ''}`
                        : (ticket.user || '—'))}
                </td>
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
