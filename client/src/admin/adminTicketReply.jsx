// src/admin/TicketReply.jsx
import React, { useRef, useState } from "react";
import { Editor } from 'primereact/editor';
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import axios from "axios";
import { sendTicketReply, resolveTicket } from "../api/ticketApi";
import { Container, Card, Button, Form, Row, Col, ListGroup, Badge } from "react-bootstrap";

function TicketReply({ token, ticket, onBack, onStatusChange }) {
  const [reply, setReply] = useState("");
  const quillRef = useRef();

  // Custom image upload handler
  const imageHandler = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      const formData = new FormData();
      formData.append("image", file);

      // Upload to your backend
      const res = await axios.post("/api/upload/image", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const url = res.data.url; // Your backend should return { url: "http://..." }
      const editor = quillRef.current.getQuill();
      const range = editor.getSelection();
      editor.insertEmbed(range.index, "image", url);
    };
  };

  // Quill modules with custom image handler
  const modules = {
    toolbar: {
      container: [
        ["bold", "italic", "underline", "strike"],
        ["image", "link"],
        [{ list: "ordered" }, { list: "bullet" }]
      ],
      handlers: {
        image: imageHandler
      }
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("content", reply);
    await sendTicketReply(ticket._id, formData, token);
    setReply("");
    onBack();
  };

  const handleResolve = async () => {
    await resolveTicket(ticket._id, token);
    if (onStatusChange) onStatusChange("resolved");
    onBack(); // Optionally go back to the list after resolving
  };

  return (
    <Container fluid className="py-5" >
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Button variant="link" onClick={onBack} className="mb-3 px-0">
            &larr; Back to Tickets
          </Button>
          <Card className="shadow-sm w-100" style={{ background: "#f8f9fa" }}>
            <Card.Header className="bg-primary text-white" style={{ background: "#D3D3D3"}}>
              <h4 className="mb-0">Reply to: <Badge bg="light" text="dark">{ticket.subject}</Badge></h4>
            </Card.Header>
            <Card.Body>
              <h6 className="mb-3">Previous Messages</h6>
              <ListGroup variant="flush" className="mb-4" style={{ maxHeight: 220, overflowY: 'auto', background: "#f8f9fa" }}>
                {ticket && Array.isArray(ticket.messages) && ticket.messages.length > 0 ? (
                  ticket.messages.map((msg, idx) => (
                    <ListGroup.Item key={idx} className="mb-2 rounded" style={{ background: "#f4f8fb" }}>
                      <div dangerouslySetInnerHTML={{ __html: msg.content }} />
                      <div className="d-flex justify-content-between mt-2">
                        <small className="text-muted">{msg.author}</small>
                        <small className="text-muted">{new Date(msg.date).toLocaleString()}</small>
                      </div>
                    </ListGroup.Item>
                  ))
                ) : (
                  <ListGroup.Item>No messages yet.</ListGroup.Item>
                )}
              </ListGroup>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Reply</Form.Label>
                  <Editor
                    ref={quillRef}
                    value={reply}
                    onTextChange={(e) => setReply(e.htmlValue)}
                    style={{ height: '200px' }}
                    modules={modules}
                  />
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
                  <Button type="submit" variant="success" disabled={!reply.trim()}>
                    Send Reply
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
