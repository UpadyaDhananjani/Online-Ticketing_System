// src/admin/TicketReply.jsx
import React, { useRef, useState } from "react";
import { Editor } from 'primereact/editor';
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import axios from "axios";
import { sendTicketReply, resolveTicket } from "../api/ticketApi";
import { Container, Card, Button, Form, Row, Col, Badge } from "react-bootstrap";
import MessageHistory from "../components/MessageHistory/MessageHistory";


function TicketReply({ token, ticket, onBack, onStatusChange }) {
  const [reply, setReply] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const quillRef = useRef();

  // Quill modules WITHOUT image upload icon
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
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("content", reply);
    if (imageFile) {
      setUploading(true);
      // Upload image first
      try {
        const uploadRes = await axios.post("/api/upload/image", 
          (() => {
            const fd = new FormData();
            fd.append("image", imageFile);
            return fd;
          })(),
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Append image filename to formData for the reply
        formData.append("image", uploadRes.data.filename);
      } catch (err) {
        alert("Image upload failed.");
        setUploading(false);
        return;
      }
      setUploading(false);
    }
    await sendTicketReply(ticket._id, formData, token);
    setReply("");
    setImageFile(null);
    onBack();
  };

  const handleResolve = async () => {
    await resolveTicket(ticket._id, token);
    if (onStatusChange) onStatusChange("resolved");
    onBack();
  };

  // Prepare messages for MessageHistory
  const messages = (ticket.messages || []).map(msg => ({
    sender: msg.authorRole === "admin" ? "Admin" : "User",
    message: msg.content,
    date: msg.date
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
              {/* Message History Section */}
              <MessageHistory
                msg={messages}
                description={ticket.description}
                image={ticket.image}
              />

              {/* Admin Reply Section */}
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
                <div className="d-flex justify-content-between">
                  <Button
                    type="button"
                    variant="warning"
                    onClick={handleResolve}
                    disabled={ticket.status === "resolved"}
                  >
                    Mark as Resolved
                  </Button>
                  <Button type="submit" variant="success" disabled={!reply.trim() || uploading}>
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

