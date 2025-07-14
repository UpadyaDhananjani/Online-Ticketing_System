import React, { useEffect, useState, useContext } from "react";
import {
  Container, Row, Col, Spinner, Alert,
  Card, Badge, Button, Form, Modal
} from "react-bootstrap";
import { useParams } from "react-router-dom";
import MessageHistory from "../components/MessageHistory/MessageHistory";
import { Editor } from 'primereact/editor';
import { toast } from 'react-toastify';
import { AppContent } from '../context/AppContext';
import { deleteUserMessage } from '../api/ticketApi';

const statusColors = {
  open: "success",
  closed: "danger",
  resolved: "primary",
  reopened: "warning"
};

const Ticket = () => {
  const { id } = useParams();
  const { userData } = useContext(AppContent);
  const token = userData?.token;
  const currentUserId = userData?.user?._id;

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [closing, setClosing] = useState(false);
  const [reply, setReply] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/tickets/${id}`, { withCredentials: true })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch ticket");
        return res.json();
      })
      .then(data => {
        setTicket(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching ticket:", err);
        setError(err.message || "Failed to fetch ticket.");
        toast.error(err.message || "Failed to fetch ticket.");
        setLoading(false);
      });
  }, [id]);

  const handleCloseTicket = async () => {
    setClosing(true);
    try {
      const res = await fetch(`/api/tickets/${id}/close`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to close ticket");
      const updated = await res.json();
      setTicket(updated);
      toast.success("Ticket closed successfully!");
    } catch (err) {
      setError(err.message || "Failed to close ticket.");
      toast.error(err.message || "Failed to close ticket.");
    }
    setClosing(false);
  };

  const handleImageChange = (e) => {
    setImageFiles([...e.target.files]);
  };

  const handleUserReply = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("content", reply);
    if (imageFiles && imageFiles.length > 0) {
      for (let i = 0; i < imageFiles.length; i++) {
        formData.append("attachments", imageFiles[i]);
      }
    }

    setUploading(true);
    try {
      const res = await fetch(`/api/tickets/${id}/reply`, {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to send reply");
      const updated = await res.json();
      setTicket(updated);
      setReply("");
      setImageFiles([]);
      toast.success("Reply sent successfully!");
    } catch (err) {
      setError(err.message || "Failed to send reply.");
      toast.error(err.message || "Failed to send reply.");
    }
    setUploading(false);
  };

  const handleAttachmentClick = (url) => {
    setModalImage(url);
    setShowModal(true);
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const res = await deleteUserMessage(id, messageId, token);
      if (res.success) {
        toast.success(res.message || "Message deleted successfully.");
        setTicket(prevTicket => ({
          ...prevTicket,
          messages: prevTicket.messages.filter(msg => msg._id !== messageId)
        }));
      } else {
        toast.error(res.message || "Failed to delete message.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete message.");
    }
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

  const messages = (ticket.messages || []).map((msg) => ({
    _id: msg._id,
    sender: msg.authorRole === "admin" ? "Admin" : "User",
    message: msg.content,
    date: msg.date,
    attachments: msg.attachments,
    authorId: msg.author
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
                    <span className="fw-semibold text-secondary">Assigned Unit:</span>{" "}
                    <Badge bg="secondary" className="text-capitalize">
                      <i className="bi bi-diagram-3 me-1"></i>
                      {ticket.assignedUnit || '—'}
                    </Badge>
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
                    <Button variant="danger" onClick={handleCloseTicket} disabled={closing}>
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
            currentUserRole="user"
            onAttachmentClick={handleAttachmentClick}
            onDeleteMessage={(messageId) => {
              const message = messages.find(m => m._id === messageId);
              if (message && message.authorId === currentUserId) {
                handleDeleteMessage(messageId);
              } else {
                toast.error("You can only delete your own messages.");
              }
            }}
          />
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className="shadow-sm mt-4">
            <Card.Body>
              <Form onSubmit={handleUserReply}>
                <Form.Group className="mb-3">
                  <Form.Label>Reply</Form.Label>
                  <Editor
                    value={reply}
                    onTextChange={(e) => setReply(e.htmlValue)}
                    style={{ height: '180px', width: '100%' }}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Attach Image</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    disabled={uploading}
                  />
                  {imageFiles.length > 0 && (
                    <div className="mt-2 text-success">
                      <i className="bi bi-image me-1"></i>
                      {imageFiles.length} files selected
                    </div>
                  )}
                </Form.Group>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!reply || !reply.trim() || uploading}
                >
                  {uploading ? "Sending..." : "Send Reply"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Image Zoom Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Body className="d-flex flex-column align-items-center justify-content-center p-0" style={{ background: '#222' }}>
          {modalImage && (
            <img
              src={modalImage}
              alt="attachment zoom"
              style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
            />
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Ticket;
