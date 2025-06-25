// src/admin/TicketList.jsx
import React, { useEffect, useState } from "react";
import { Table, Button, Container, Spinner, Alert } from "react-bootstrap";
import { getAllTickets } from "../api/ticketApi";

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
        <h2 className="mb-4">All Tickets</h2>
        {loading && <Spinner animation="border" />}
        {error && <Alert variant="danger">{error}</Alert>}
        {!loading && !error && (
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th>Requester</th>
                        <th>Status</th>
                        <th>Last Update</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {tickets.map(ticket => (
                        <tr
                            key={ticket._id}
                            style={
                                ticket.status === "open"
                                    ? { backgroundColor: "#e6ffe6" } // Light green hue
                                    : {}
                            }
                        >
                            <td>{ticket.subject}</td>
                            <td>{ticket.userEmail || ticket.user?.email || "N/A"}</td>
                            <td>
                                <span
                                    className={
                                        ticket.status === "open"
                                            ? "text-success"
                                            : ticket.status === "closed"
                                            ? "text-danger"
                                            : "text-secondary"
                                    }
                                >
                                    {ticket.status}
                                </span>
                            </td>
                            <td>
                                {ticket.updatedAt
                                    ? new Date(ticket.updatedAt).toLocaleString()
                                    : "N/A"}
                            </td>
                            <td>
                                <Button style={{
                                        backgroundColor:" #4682B4",
                                         borderColor: "#B0E0E6",
                                        marginLeft: "8px"
                                    }}
                                    variant="primary"
                                    size="sm"
                                    onClick={() => onSelect(ticket)}
                                >
                                    View
                                </Button>
                                <Button
                                    style={{
                                        backgroundColor: "#483D8B",
                                        borderColor: "#B0E0E6",
                                        marginLeft: "8px"
                                    }}
                                    size="sm"
                                    onClick={() => onSelect(ticket)}
                                >
                                    Reply
                                </Button>
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

