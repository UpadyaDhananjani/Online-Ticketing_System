import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { MessageHistory } from "../components/MessageHistory/MessageHistory";

const Ticket = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!ticket) return null;

  return (
    <Container>
      <Row>
        <Col>
          <h3 className="my-4">Ticket Details</h3>
        </Col>
      </Row>
      <Row>
        <Col className="fw-bold text-secondary">
          <div className="subject">Subject: {ticket.subject}</div>
          <div className="date">
            Ticket Opened:{" "}
            {ticket.createdAt && new Date(ticket.createdAt).toLocaleString()}
          </div>
          <div className="status">Status: {ticket.status}</div>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          
        
          {/* {ticket.conversations && ( */}
            <MessageHistory 
            msg={ticket.conversations}
             description={ticket.description}
              image={ticket.image}
            />

          
        </Col>
      </Row>
    </Container>
  );
};

export default Ticket;
