import React, { useRef, useState, useEffect } from "react";
import { Editor } from 'primereact/editor';
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import {
  sendTicketReply,
  resolveTicket,
  deleteAdminMessage,
  getAdminTicketById
} from "../api/ticketApi";
import { Container, Card, Button, Form, Row, Col, Badge } from "react-bootstrap";
import MessageHistory from "../components/MessageHistory/MessageHistory";
import { toast } from 'react-toastify';

function TicketReply({ token, ticket, onBack, onStatusChange, onTicketUpdate }) {
  const [reply, setReply] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [localStatus, setLocalStatus] = useState(ticket.status);
  const [messages, setMessages] = useState(ticket.messages || []);
  const quillRef = useRef();

  useEffect(() => {
    setMessages(ticket.messages || []);
    setLocalStatus(ticket.status);
  }, [ticket]);

  const modules = {
    toolbar: {
      container: [
        [
          "bold", "italic", "underline", "strike",
          "link",
          { list: "ordered" }, { list: "bullet" }
        ]
      ]
    }
  };

  const handleImageChange = (e) => {
    setImageFiles(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("content", reply);
    if (imageFiles && imageFiles.length > 0) {
      for (let i = 0; i < imageFiles.length; i++) {
        formData.append("attachments", imageFiles[i]);
      }
    }

    setUploading(true);

    // Optimistically add message
    const tempId = Date.now().toString();
    const optimisticMessage = {
      _id: tempId,
      authorRole: "admin",
      content: reply,
      date: new Date().toISOString(),
      attachments: [],
      pending: true
    };
    setMessages([...messages, optimisticMessage]);

    try {
      await sendTicketReply(ticket._id, formData, token);
      setReply("");
      setImageFiles([]);
      setLocalStatus("in progress");
      if (onStatusChange) onStatusChange("in progress");
      await fetchTicket();
      toast.success("Reply sent successfully!");
    } catch (err) {
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(m => m._id !== tempId));
      console.error("Failed to send reply:", err);
      toast.error(err.response?.data?.message || "Failed to send reply.");
    }
    setUploading(false);
  };

  const handleResolve = async () => {
    setLocalStatus("resolved"); // Optimistic UI update
    try {
      await resolveTicket(ticket._id, token);
      if (onStatusChange) onStatusChange("resolved");
      await fetchTicket();
      onBack();
      toast.success("Ticket resolved successfully!");
    } catch (err) {
      setLocalStatus(ticket.status); // Revert if error
      toast.error(err.response?.data?.message || "Failed to resolve ticket.");
    }
  };

  const handleDeleteMessage = async (messageId) => {
    const previousMessages = messages;
    setMessages(prev => prev.filter(m => m._id !== messageId));

    try {
      const res = await deleteAdminMessage(ticket._id, messageId, token);
      if (res.data.success) {
        toast.success(res.data.message || "Message deleted successfully.");
        await fetchTicket();
      } else {
        setMessages(previousMessages);
        toast.error(res.data.message || "Failed to delete message.");
      }
    } catch (err) {
      setMessages(previousMessages);
      toast.error(err.response?.data?.message || "Error deleting message.");
    }
  };

  const fetchTicket = async () => {
    try {
      const res = await getAdminTicketById(ticket._id, token);
      if (res.data) {
        setLocalStatus(res.data.status);
        setMessages(res.data.messages || []);
        if (typeof onTicketUpdate === "function") {
          onTicketUpdate(res.data);
        }
      }
    } catch (err) {
      console.error("Error fetching updated ticket:", err);
    }
  };

  const messagesForHistory = messages.map(msg => ({
    _id: msg._id,
    sender: msg.authorRole === "admin" ? "Admin" : "User",
    message: msg.content,
    date: msg.date,
    attachments: msg.attachments,
    pending: msg.pending
  }));

  return (
    <Container className="py-5" style={{ maxWidth: "900px" }}>
      <Row className="justify-content-center">
        <Col md={12} lg={10}>
          <Button variant="link" onClick={onBack} className="mb-3 px-0">
            &larr; Back to Tickets
          </Button>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">
                Reply to: <Badge bg="light" text="dark">{ticket.subject}</Badge>
              </h4>
              <div className="mt-2">
                <Badge bg="secondary" className="text-capitalize">
                  <i className="bi bi-diagram-3 me-1"></i>
                  {ticket.assignedUnit || '—'}
                </Badge>
              </div>
            </Card.Header>
            <Card.Body>
              {/* Message History */}
              <MessageHistory
                msg={messagesForHistory}
                description={ticket.description}
                image={ticket.image}
                onDeleteMessage={handleDeleteMessage}
                currentUserRole="admin"
              />

              {/* Reply Form */}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3 mt-4">
                  <Form.Label>Reply</Form.Label>
                  <Editor
                    ref={quillRef}
                    value={reply}
                    onTextChange={(e) => setReply(e.htmlValue)}
                    style={{ height: '320px', width: '100%' }}
                    modules={modules}
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
                      {imageFiles.length} file(s) selected
                    </div>
                  )}
                </Form.Group>
                <div className="d-flex justify-content-between">
                  <Button
                    type="button"
                    variant="warning"
                    onClick={handleResolve}
                    disabled={localStatus === "resolved"}
                  >
                    Mark as Resolved
                  </Button>
                  <Button
                    type="submit"
                    variant="success"
                    disabled={!reply || !reply.trim() || uploading}
                  >
                    {uploading ? "Uploading..." : "Send Reply"}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default TicketReply;
