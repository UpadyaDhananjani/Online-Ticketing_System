import React, { useEffect, useState } from 'react';
import { getTickets } from '../api/ticketApi';
import { useNavigate } from 'react-router-dom';
import { Badge } from 'react-bootstrap';

const UNIT_OPTIONS = [
  "System and Network Administration",
  "Asyhub Unit",
  "Statistics Unit",
  "Audit Unit",
  "Helpdesk Unit",
  "Functional Unit"
];

const STATUS_OPTIONS = [
  "All",
  "open",
  "in progress",
  "closed",
  "resolved",
  "reopened"
];

const TYPE_OPTIONS = [
  "All",
  "incident",
  "bug",
  "maintenance",
  "request",
  "service"
];

const statusColors = {
  open: "success",
  closed: "danger",
  resolved: "primary",
  reopened: "warning",
  "in progress": "warning" // <-- Add this line
};

function TicketList({ token, filter }) {
  const [tickets, setTickets] = useState([]);
  const [unitFilter, setUnitFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    getTickets(token)
      .then(res => setTickets(res.data))
      .catch(err => alert(err.response?.data?.error || err.message));
  }, [token]);

  const filteredTickets = tickets.filter(ticket => {
    const unitMatch = unitFilter === "All" || ticket.assignedUnit === unitFilter;
    const statusMatch = statusFilter === "All" || ticket.status === statusFilter;
    const typeMatch = typeFilter === "All" || ticket.type === typeFilter;
    return unitMatch && statusMatch && typeMatch;
  });

  return (
    <div style={{ maxWidth: 1100, margin: 'auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 20 }}>My Tickets</h2>
      {/* Filter dropdowns */}
      <div className="mb-3">
        <div className="row">
          <div className="col-md-4 mb-2">
            <select
              value={unitFilter}
              onChange={e => setUnitFilter(e.target.value)}
              className="form-select"
            >
              <option value="All">All Units</option>
              {UNIT_OPTIONS.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4 mb-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="form-select"
            >
              {STATUS_OPTIONS.map(status => (
                <option key={status} value={status}>
                  {status === "All"
                    ? "All Statuses"
                    : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4 mb-2">
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="form-select"
            >
              {TYPE_OPTIONS.map(type => (
                <option key={type} value={type}>
                  {type === "All"
                    ? "All Types"
                    : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
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
