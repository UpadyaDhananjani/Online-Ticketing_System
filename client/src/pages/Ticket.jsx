import React, { useEffect, useState, useRef, useContext } from "react";
import { Container, Row, Col, Spinner, Alert, Card, Badge, Button, Form } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import MessageHistory from "../components/MessageHistory/MessageHistory";
import { Editor } from 'primereact/editor';
import { toast } from 'react-toastify';
import { AppContent } from '../context/AppContext'; // Import AppContent to get user data and token
import { deleteUserMessage } from '../api/ticketApi'; // Import the new API function

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
  const [reply, setReply] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { userData } = useContext(AppContent); // Get userData from context
  const token = userData?.token;
  const currentUserId = userData?.user?._id; // Get the ID of the currently logged-in user

  useEffect(() => {
    setLoading(true);
    // Use axios with withCredentials for user routes if you're relying on cookies
    fetch(`/api/tickets/${id}`, { withCredentials: true }) 
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch ticket");
        return res.json();
      })
      .then((data) => {
        setTicket(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching ticket:", err);
        setError(err.message || "Failed to fetch ticket.");
        toast.error(err.message || "Failed to fetch ticket details.");
        setLoading(false);
      });
  }, [id]);

  const handleCloseTicket = async () => {
    setClosing(true);
    try {
      // Assuming closeTicket API function handles auth via token
      const res = await fetch(`/api/tickets/${id}/close`, { 
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` } // Pass token for authentication
      });
      if (!res.ok) throw new Error("Failed to close ticket");
      const updated = await res.json();
      setTicket(updated);
      toast.success("Ticket closed successfully!");
    } catch (err) {
      console.error("Error closing ticket:", err);
      setError(err.message || "Failed to close ticket.");
      toast.error(err.message || "Failed to close ticket.");
    }
    setClosing(false);
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleUserReply = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("content", reply);
    if (imageFile) {
      formData.append("image", imageFile);
    }
    setUploading(true);
    try {
      // Assuming user reply API handles auth via token
      const res = await fetch(`/api/tickets/${id}/reply`, {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${token}` } // Pass token for authentication
      });
      if (!res.ok) throw new Error("Failed to send reply");
      const updated = await res.json();
      setTicket(updated);
      setReply("");
      setImageFile(null);
      toast.success("Reply sent successfully!");
    } catch (err) {
      console.error("Error sending reply:", err);
      setError(err.message || "Failed to send reply.");
      toast.error(err.message || "Failed to send reply.");
    }
    setUploading(false);
  };

  // --- NEW: Function to handle message deletion by the user ---
  const handleDeleteMessage = async (messageId) => {
    try {
      console.log(`Attempting to delete message: ${messageId} from ticket: ${id} by user.`);
      // Call the new deleteUserMessage API function
      const res = await deleteUserMessage(id, messageId, token); 
      
      if (res.success) { // Assuming the backend returns { success: true, message: "..." }
        toast.success(res.message || "Message deleted successfully.");
        // Optimistically update the UI by filtering out the deleted message
        setTicket(prevTicket => ({
          ...prevTicket,
          messages: prevTicket.messages.filter(msg => msg._id !== messageId)
        }));
      } else {
        toast.error(res.message || "Failed to delete message.");
      }
    } catch (err) {
      console.error("Error deleting message:", err);
      toast.error(err.response?.data?.message || "Failed to delete message due to network or server error.");
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

  // Prepare messages for MessageHistory
  const messages = (ticket.messages || []).map((msg) => ({
    _id: msg._id, // <-- include this!
    sender: msg.authorRole === "admin" ? "Admin" : "User",
    message: msg.content,
    date: msg.date,
    authorId: msg.author // Assuming msg.author holds the user ID who sent the message
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
            // Pass the delete handler to MessageHistory for user messages
            onDeleteMessage={(messageId) => {
              // Only allow deletion if the message was sent by the current user
              const messageToDelete = messages.find(m => m._id === messageId);
              if (messageToDelete && messageToDelete.authorId === currentUserId) {
                handleDeleteMessage(messageId);
              } else {
                toast.error("You can only delete your own messages.");
              }
            }}
          />
        </Col>
      </Row>
      {/* User Reply Form */}
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
                    onChange={handleImageChange}
                    disabled={uploading}
                  />
                  {imageFile && (
                    <div className="mt-2 text-success">
                      <i className="bi bi-image me-1"></i>
                      {imageFile.name}
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
    </Container>
  );
};

export default Ticket;
