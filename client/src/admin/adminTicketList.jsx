import React, { useEffect, useState } from "react";
import { Table, Container, Spinner, Alert, Badge, Form, Row, Col, Button } from "react-bootstrap";
import { getAllTickets, deleteAdminTicket } from "../api/ticketApi";
import { toast } from 'react-toastify';

const statusColors = {
  open: "success",
  closed: "danger",
  resolved: "primary",
  reopened: "warning",
  "in progress": "info"
};

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

function TicketList({ onSelect, token, refresh }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unitFilter, setUnitFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedTickets, setSelectedTickets] = useState(new Set());

  useEffect(() => {
    setLoading(true);
    setError("");
    // FIX: Pass the token to getAllTickets
    getAllTickets(token) // <--- CRUCIAL FIX HERE
      .then(res => {
        setTickets(res.data);
        setLoading(false);
        console.log("Admin Dashboard: Fetched tickets:", res.data);
        if (res.data.length > 0) {
          console.log("Admin Dashboard: First ticket's user data:", res.data[0].user);
          console.log("Admin Dashboard: First ticket's user name:", res.data[0].user?.name);
        }
      })
      .catch(err => {
        console.error("Admin Dashboard: Error fetching tickets:", err);
        setError("Failed to fetch tickets.");
        toast.error(err.response?.data?.error || err.message || "Failed to fetch tickets for admin dashboard.");
        setLoading(false);
      });
  }, [refresh, token]); // FIX: Add token to dependency array

  const handleDelete = async (ticketId) => {
    if (!window.confirm("Are you sure you want to delete this ticket? This action cannot be undone.")) return;
    try {
      await deleteAdminTicket(ticketId, token);
      setTickets(tickets => tickets.filter(t => t._id !== ticketId));
      setSelectedTickets(prev => {
        const newSet = new Set(prev);
        newSet.delete(ticketId);
        return newSet;
      });
      toast.success("Ticket deleted successfully!"); // Added success toast
    } catch (err) {
      toast.error("Failed to delete ticket: " + (err.response?.data?.message || err.message)); // Used toast
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedTickets(new Set(filteredTickets.map(ticket => ticket._id)));
    } else {
      setSelectedTickets(new Set());
    }
  };

  const handleSelectTicket = (ticketId, checked) => {
    setSelectedTickets(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(ticketId);
      } else {
        newSet.delete(ticketId);
      }
      return newSet;
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedTickets.size === 0) {
      toast.warning("Please select tickets to delete.");
      return;
    }

    const confirmMessage = `Are you sure you want to delete ${selectedTickets.size} selected ticket(s)? This action cannot be undone.`;
    if (!window.confirm(confirmMessage)) return;

    try {
      const deletePromises = Array.from(selectedTickets).map(ticketId =>
        deleteAdminTicket(ticketId, token)
      );

      await Promise.all(deletePromises);

      setTickets(tickets => tickets.filter(t => !selectedTickets.has(t._id)));
      setSelectedTickets(new Set());

      toast.success(`Successfully deleted ${selectedTickets.size} ticket(s).`);
    } catch (err) {
      toast.error("Failed to delete some tickets: " + (err.response?.data?.message || err.message));
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const unitMatch = unitFilter === "All" || ticket.assignedUnit === unitFilter;
    const statusMatch = statusFilter === "All" || ticket.status === statusFilter;
    const typeMatch = typeFilter === "All" || ticket.type === typeFilter;
    return unitMatch && statusMatch && typeMatch;
  });

  const isAllSelected = filteredTickets.length > 0 && selectedTickets.size === filteredTickets.length;
  const isIndeterminate = selectedTickets.size > 0 && selectedTickets.size < filteredTickets.length;

  return (
    <Container className="mt-4">
      <h2 className="mb-4 text-primary">
        <i className="bi bi-list-ul me-2"></i>All Tickets
      </h2>

      {/* Bulk Actions */}
      {selectedTickets.size > 0 && (
        <Row className="mb-3">
          <Col>
            <Alert variant="info" className="d-flex align-items-center justify-content-between">
              <span>
                <i className="bi bi-check-circle me-2"></i>
                {selectedTickets.size} ticket(s) selected
              </span>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteSelected}
              >
                <i className="bi bi-trash me-1"></i>
                Delete Selected ({selectedTickets.size})
              </Button>
            </Alert>
          </Col>
        </Row>
      )}

      <Row className="mb-3">
        <Col xs={12} md={4} lg={3}>
          <Form.Select
            value={unitFilter}
            onChange={e => setUnitFilter(e.target.value)}
            aria-label="Filter by Assigned Unit"
            className="mb-2"
          >
            <option value="All">All Units</option>
            {UNIT_OPTIONS.map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </Form.Select>
        </Col>
        <Col xs={12} md={4} lg={3}>
          <Form.Select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            aria-label="Filter by Status"
            className="mb-2"
          >
            {STATUS_OPTIONS.map(status => (
              <option key={status} value={status}>
                {status === "All"
                  ? "All Statuses"
                  : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col xs={12} md={4} lg={3}>
          <Form.Select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            aria-label="Filter by Type"
            className="mb-2"
          >
            {TYPE_OPTIONS.map(type => (
              <option key={type} value={type}>
                {type === "All"
                  ? "All Types"
                  : type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>
      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}
      {!loading && !error && (
        <Table striped bordered hover responsive className="shadow-sm rounded" style={{ background: "#fff" }}>
          <thead className="align-middle" style={{ background: "#f5f6fa" }}>
            <tr>
              <th>
                <Form.Check
                  type="checkbox"
                  checked={isAllSelected}
                  ref={input => {
                    if (input) input.indeterminate = isIndeterminate;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  aria-label="Select all tickets"
                />
              </th>
              <th><i className="bi bi-card-text me-1"></i>Subject</th>
              <th><i className="bi bi-tag me-1"></i>Type</th>
              <th><i className="bi bi-diagram-3 me-1"></i>Assigned Unit</th>
              <th><i className="bi bi-person me-1"></i>Requester</th>
              <th><i className="bi bi-person-badge me-1"></i>Assigned To</th>
              <th><i className="bi bi-info-circle me-1"></i>Status</th>
              <th><i className="bi bi-clock-history me-1"></i>Last Update</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map(ticket => (
              <tr
                key={ticket._id}
                style={{
                  background: ticket.status === "open" ? "#e6ffe6" : undefined,
                  verticalAlign: "middle",
                  cursor: "pointer"
                }}
                onClick={() => onSelect(ticket)}
                onMouseOver={e => e.currentTarget.style.background = "#f0f4ff"}
                onMouseOut={e => e.currentTarget.style.background = ticket.status === "open" ? "#e6ffe6" : ""}
              >
                <td onClick={(e) => e.stopPropagation()}>
                  <Form.Check
                    type="checkbox"
                    checked={selectedTickets.has(ticket._id)}
                    onChange={(e) => handleSelectTicket(ticket._id, e.target.checked)}
                    aria-label={`Select ticket ${ticket.subject}`}
                  />
                </td>
                <td>
                  <i className="bi bi-card-text me-2 text-primary"></i>
                  {ticket.subject}
                </td>
                <td>
                  <Badge bg="info" text="dark" className="text-capitalize">
                    <i className="bi bi-tag me-1"></i>
                    {ticket.type ? ticket.type.charAt(0).toUpperCase() + ticket.type.slice(1) : '—'}
                  </Badge>
                </td>
                <td>
                  <Badge bg="secondary" className="text-capitalize">
                    <i className="bi bi-diagram-3 me-1"></i>
                    {ticket.assignedUnit || '—'}
                  </Badge>
                </td>
                <td>
                  <i className="bi bi-person-circle me-2 text-secondary"></i>
                  {ticket.user ? ticket.user.name : "N/A"}
                </td>
                <td>
                  <Badge bg="info" className="text-capitalize">
                    <i className="bi bi-person-badge me-1"></i>
                    {ticket.assignedTo && typeof ticket.assignedTo === 'object' && ticket.assignedTo.name
                      ? ticket.assignedTo.name
                      : '—'}
                  </Badge>
                </td>
                <td>
                  <Badge
                    bg={statusColors[ticket.status] || "secondary"}
                    className="px-3 py-2 text-capitalize"
                  >
                    <i className="bi bi-info-circle me-1"></i>
                    {ticket.status}
                  </Badge>
                </td>
                <td>
                  <i className="bi bi-clock-history me-2 text-secondary"></i>
                  {ticket.updatedAt
                    ? new Date(ticket.updatedAt).toLocaleString()
                    : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default TicketList;