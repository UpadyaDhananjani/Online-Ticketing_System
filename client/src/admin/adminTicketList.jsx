// src/admin/TicketList.jsx
import React, { useEffect, useState } from "react";
import { Table, Container, Spinner, Alert, Badge } from "react-bootstrap";
import { getAllTickets } from "../api/ticketApi";

const statusColors = {
  open: "success",
  closed: "danger",
  resolved: "primary",
  reopened: "warning"
};

function TicketList({ token, onSelect }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <Container className="mt-4">
      <h2 className="mb-4 text-primary">
        <i className="bi bi-list-ul me-2"></i>All Tickets
      </h2>
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
            {tickets.map(ticket => (
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

