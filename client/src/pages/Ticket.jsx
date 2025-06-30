import React, { useEffect, useState } from "react";
import { Container, Row, Col, Spinner, Alert, Card, Badge, Button } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import MessageHistory from "../components/MessageHistory/MessageHistory";

const statusColors = {
  open: "success",
  closed: "danger",
  resolved: "primary",
  reopened: "warning"
};

const Ticket = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/tickets/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch ticket");
        return res.json();
      })
      .then((data) => {
        setTicket(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleCloseTicket = async () => {
    setClosing(true);
    try {
      const res = await fetch(`/api/tickets/${id}/close`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to close ticket");
      const updated = await res.json();
      setTicket(updated);
    } catch (err) {
      setError(err.message);
    }
    setClosing(false);
  };

  if (loading) return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
      <Spinner animation="border" variant="primary" />
    </Container>
  );
  if (error) return (
    <Container className="py-5">
      <Alert variant="danger" className="text-center">{error}</Alert>
    </Container>
  );
  if (!ticket) return null;

  // Prepare messages for MessageHistory
  const messages = (ticket.messages || []).map((msg) => ({
    sender: msg.authorRole === "admin" ? "Admin" : "You",
    message: msg.content,
    date: msg.date,
  }));

  return (
    <Container className="py-4" style={{ maxWidth: 900 }}>
      <Row className="justify-content-center">
        <Col xs={12}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
              <Row>
                <Col xs={12} md={8}>
                  <h3 className="mb-2 text-primary">
                    <i className="bi bi-ticket-detailed me-2"></i>
                    Ticket Details
                  </h3>
                  <div className="mb-2">
                    <span className="fw-semibold text-secondary">Subject:</span>{" "}
                    <span className="fs-5">{ticket.subject}</span>
                  </div>
                  <div className="mb-2">
                    <span className="fw-semibold text-secondary">Opened:</span>{" "}
                    {ticket.createdAt && new Date(ticket.createdAt).toLocaleString()}
                  </div>
                  <div className="mb-2">
                    <span className="fw-semibold text-secondary">Status:</span>{" "}
                    <Badge bg={statusColors[ticket.status] || "secondary"} className="px-3 py-2 text-capitalize">
                      {ticket.status}
                    </Badge>
                  </div>
                  <div className="mb-2">
                    <span className="fw-semibold text-secondary">Type:</span>{" "}
                    <Badge bg="info" text="dark" className="text-capitalize">{ticket.type}</Badge>
                  </div>
                </Col>
                <Col xs={12} md={4} className="d-flex align-items-center justify-content-md-end justify-content-start mt-3 mt-md-0">
                  {ticket.status === "open" && (
                    <Button
                      variant="danger"
                      className="d-flex align-items-center"
                      onClick={handleCloseTicket}
                      disabled={closing}
                    >
                      <i className="bi bi-x-circle me-2"></i>
                      {closing ? "Closing..." : "Close Ticket"}
                    </Button>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col>
          <MessageHistory
            msg={messages}
            description={ticket.description}
            image={ticket.image}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default Ticket;
