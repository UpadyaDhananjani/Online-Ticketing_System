// src/admin/TicketList.jsx
import React, { useEffect, useState } from "react";
import { Table, Container, Spinner, Alert, Badge, Form, Row, Col } from "react-bootstrap";
import { getAllTickets } from "../api/ticketApi";

const statusColors = {
  open: "success",
  closed: "danger",
  resolved: "primary",
  reopened: "warning",
  "in progress": "warning"
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

function TicketList({ token, onSelect }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unitFilter, setUnitFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  useEffect(() => {
    setLoading(true);
    getAllTickets(token)
      .then(res => {
        setTickets(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to fetch tickets.");
        setLoading(false);
      });
  }, [token]);

  const filteredTickets = tickets.filter(ticket => {
    const unitMatch = unitFilter === "All" || ticket.assignedUnit === unitFilter;
    const statusMatch = statusFilter === "All" || ticket.status === statusFilter;
    const typeMatch = typeFilter === "All" || ticket.type === typeFilter;
    return unitMatch && statusMatch && typeMatch;
  });

  return (
    <Container className="mt-4">
      <h2 className="mb-4 text-primary">
        <i className="bi bi-list-ul me-2"></i>All Tickets
      </h2>
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
              <th><i className="bi bi-card-text me-1"></i>Subject</th>
              <th><i className="bi bi-tag me-1"></i>Type</th>
              <th><i className="bi bi-diagram-3 me-1"></i>Assigned Unit</th>
              <th><i className="bi bi-person me-1"></i>Requester</th>
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
                  {ticket.userEmail || ticket.user?.email || "N/A"}
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

