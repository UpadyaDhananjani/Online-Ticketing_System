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

      const url = `http://localhost:4000/uploads/${res.data.filename}`; //res.data.url;
      const editor = quillRef.current.getQuill();
      const range = editor.getSelection();
      editor.insertEmbed(range.index, "image", url);
    };
  };

  // Quill modules with custom image handler
  const modules = {
    toolbar: {
      container: [
        [
          "bold", "italic", "underline", "strike",
          "image", "link",
          { list: "ordered" }, { list: "bullet" }
        ]
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

