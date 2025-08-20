//TicketList.jsx


import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button, Container, Table, Form } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BsTrash } from 'react-icons/bs';

const statusColors = {
  'open': { className: 'bg-danger-subtle text-danger' },
  'in progress': { className: 'bg-warning-subtle text-warning' },
  'resolved': { className: 'bg-success-subtle text-success' },
  'closed': { className: 'bg-secondary-subtle text-secondary' },
  'reopened': { className: 'bg-danger-subtle text-danger' }
};

const priorityColors = {
  'Critical': { className: 'bg-danger text-white' },
  'High': { className: 'bg-warning text-dark' },
  'Medium': { className: 'bg-info text-white' },
  'Normal': { className: 'bg-secondary text-white' }
};

function TicketList({ filter, mode = 'created', userId, onOpenReceivedCountChange, refresh }) { 
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = '/api/tickets';
        if (mode === 'reassigned') {
          url += '?mode=reassigned';
        }
        const res = await axios.get(url, { 
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
    // eslint-disable-next-line
  }, [mode, refresh]);

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

  // Notify parent of open received tickets count
  useEffect(() => {
    if (mode === 'received' && typeof onOpenReceivedCountChange === 'function') {
      const openReceivedCount = tickets.filter(ticket => (ticket.assignedTo === userId || ticket.assignedTo?._id === userId) && ticket.status === 'open').length;
      onOpenReceivedCountChange(openReceivedCount);
    }
  }, [tickets, mode, userId, onOpenReceivedCountChange]);

  // Selection logic
  const toggleSelect = (ticketId) => {
    setSelected(prev => 
      prev.includes(ticketId) 
        ? prev.filter(id => id !== ticketId) 
        : [...prev, ticketId]
    );
  };

  const toggleSelectAll = (checked) => {
    if (checked) {
      setSelected(filteredTickets.map(ticket => ticket._id));
    } else {
      setSelected([]);
    }
  };

  const isAllSelected = filteredTickets.length > 0 && selected.length === filteredTickets.length;
  const isIndeterminate = selected.length > 0 && selected.length < filteredTickets.length;

  // Delete selected tickets
  const handleDeleteSelected = async () => {
    if (!window.confirm('Are you sure you want to delete the selected tickets?')) return;
    let successCount = 0;
    let failCount = 0;
    for (const id of selected) {
      try {
        await axios.delete(`/api/tickets/${id}`, { withCredentials: true });
        successCount++;
      } catch (err) {
        failCount++;
      }
    }
    if (successCount > 0) toast.success(`${successCount} ticket(s) deleted.`);
    if (failCount > 0) toast.error(`${failCount} ticket(s) failed to delete.`);
    setSelected([]);
    // Refresh tickets
    setLoading(true);
    try {
      const res = await axios.get('/api/tickets', { withCredentials: true });
      setTickets(res.data);
    } catch (err) {}
    setLoading(false);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: 50 }}>Loading tickets...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', marginTop: 50, color: 'red' }}>{error}</div>;
  }

  return (
    <Container className="mt-4">
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {mode === 'created' && selected.length > 0 && (
          <div className="mb-3 flex items-center gap-3">
            <Button variant="danger" className="flex items-center gap-2 shadow hover:scale-105 transition" onClick={handleDeleteSelected}>
              <BsTrash /> Delete Selected
            </Button>
            <span className="text-gray-500 text-sm">{selected.length} selected</span>
          </div>
        )}
        
        <h2 className="mb-4 text-primary">
          <i className="bi bi-list-ul me-2"></i>
          {mode === 'created' ? 'Tickets Created' : mode === 'received' ? 'Tickets Received' : 'Tickets Reassigned to Me'}
        </h2>

        <style>
          {`
            .bg-danger-subtle {
              background-color: #fff5f5;
            }
            .bg-warning-subtle {
              background-color: #fffbeb;
            }
            .bg-success-subtle {
              background-color: #f0fdf4;
            }
            .bg-secondary-subtle {
              background-color: #f3f4f6;
            }
            .rounded-pill {
              border-radius: 9999px;
            }
            .table td {
              color: #374151;
              font-size: 0.875rem;
            }
          `}
        </style>

        <Table striped bordered hover responsive className="shadow-sm rounded" style={{ width: '100%' }}>
          <thead style={{ background: "#f5f6fa" }}>
            <tr>
              {mode === 'created' && (
                <th>
                  <Form.Check
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                  />
                </th>
              )}
              <th>Subject</th>
              <th>Type</th>
              <th>Assigned Unit</th>
              {mode === 'created' ? (
                <th>Assigned To</th>
              ) : (
                <th>Requester</th>
              )}
              <th>Assigned To</th>
              <th>Priority</th>
              <th style={{ minWidth: 130, width: 150 }}><i className="bi bi-info-circle me-1"></i>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={mode === 'created' ? 9 : 8} style={{ textAlign: 'center', padding: 20, color: '#888' }}>
                  No tickets found.
                </td>
              </tr>
            ) : (
              filteredTickets.map(ticket => (
                <tr
                  key={ticket._id}
                  style={{
                    cursor: "pointer",
                  }}
                  onClick={() => navigate(`/tickets/${ticket._id}`)}
                  onMouseOver={(e) => (e.currentTarget.style.background = "#f0f4ff")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "")}
                >
                  {mode === 'created' && (
                    <td onClick={(e) => e.stopPropagation()}>
                      <Form.Check
                        type="checkbox"
                        checked={selected.includes(ticket._id)}
                        onChange={() => toggleSelect(ticket._id)}
                      />
                    </td>
                  )}
                  <td>{ticket.subject}</td>
                  <td>{ticket.type}</td>
                  <td>{ticket.assignedUnit || "—"}</td>
                  <td>
                    {mode === 'created'
                      ? (ticket.assignedTo?.name || "—")
                      : (ticket.user?.name || "N/A")}
                  </td>
                  <td>{ticket.assignedTo?.name || "—"}</td>
                  <td style={{ verticalAlign: 'middle' }}>
                    <Badge pill className={priorityColors[ticket.priority]?.className || 'bg-secondary text-white'}>
                      {ticket.priority || 'Normal'}
                    </Badge>
                  </td>
                  <td style={{ verticalAlign: 'middle' }}>
                    <span className={`px-3 py-1 rounded-pill ${statusColors[ticket.status.toLowerCase()]?.className}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td>
                    {ticket.createdAt
                      ? new Date(ticket.createdAt).toLocaleString()
                      : "N/A"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </Container>
  );
}
export default TicketList;
