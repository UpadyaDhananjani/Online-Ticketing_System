import React, { useEffect, useState } from 'react';
import { getTickets } from '../api/ticketApi';
import { Link } from 'react-router-dom';

function TicketList({ token, onEdit, onClose, onReopen }) {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    getTickets(token)
      .then(res => setTickets(res.data))
      .catch(err => alert(err.response?.data?.error || err.message));
  }, [token]);

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
            <th style={thStyle}>Subject</th>
            <th style={thStyle}>Type</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Created</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tickets.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', padding: 20, color: '#888' }}>
                No tickets found.
              </td>
            </tr>
          ) : (
            tickets.map(ticket => (
              <tr
                key={ticket._id}
                style={{
                  borderBottom: '1px solid #eee',
                  background: ticket.status === 'open' ? '#e6ffe6' : undefined // Light green for open
                }}
              >
                <td style={tdStyle}>{ticket.subject}</td>
                <td style={tdStyle}>
                  {ticket.type
                    ? ticket.type.charAt(0).toUpperCase() + ticket.type.slice(1)
                    : '—'}
                </td>
                <td style={{ ...tdStyle, color: ticket.status === 'open' ? '#27ae60' : '#c0392b', fontWeight: 500 }}>
                  {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                </td>
                <td style={tdStyle}>{ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : '-'}</td>
                <td style={tdStyle}>
                  <Link to={`/tickets/${ticket._id}`}>
                    <button style={{ ...actionBtn, background: '#6c63ff', marginRight: 8 }}>
                      View
                    </button>
                  </Link>
                  {ticket.status === 'open' && (
                    <button
                      style={{ ...actionBtn, background: '#c0392b', color: '#fff', marginLeft: 8 }}
                      onClick={() => onClose(ticket._id)}
                    >
                      Close
                    </button>
                  )}
                  {ticket.status === 'closed' && (
                    <button
                      style={{ ...actionBtn, background: '#27ae60', color: '#fff', marginLeft: 8 }}
                      onClick={() => onReopen(ticket._id)}
                    >
                      Reopen
                    </button>
                  )}
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

const actionBtn = {
  padding: '6px 16px',
  background: '#2980b9',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer'
};

export default TicketList;
