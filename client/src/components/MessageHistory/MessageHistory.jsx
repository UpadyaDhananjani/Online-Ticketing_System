import React from "react";
import PropTypes from "prop-types";
import { Card, Row, Col, Badge, Button } from "react-bootstrap";

const MessageHistory = ({ msg, description, image, onDeleteMessage }) => (
  <Card className="shadow-sm mb-4 border-0" style={{ background: "#f8fafd" }}>
    <Card.Body>
      {description && (
        <Card className="mb-4 border-0 bg-white">
          <Card.Body>
            <Card.Title as="h6" className="text-primary mb-2">
              <i className="bi bi-info-circle me-2"></i>Ticket Description
            </Card.Title>
            <Card.Text className="fs-6">{description}</Card.Text>
          </Card.Body>
        </Card>
      )}

      {image && (
        <Card className="mb-4 border-0 bg-white">
          <Card.Body>
            <Card.Title as="h6" className="text-primary mb-2">
              <i className="bi bi-paperclip me-2"></i>Attachment
            </Card.Title>
            <div className="d-flex justify-content-center">
              <img
                src={`http://localhost:4000/uploads/${image}`}
                alt="Ticket Attachment"
                style={{
                  maxWidth: "100%",
                  maxHeight: "220px",
                  borderRadius: 10,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  border: "1px solid #e3e3e3",
                }}
              />
            </div>
          </Card.Body>
        </Card>
      )}

      <h6 className="text-primary mb-3">
        <i className="bi bi-chat-dots me-2"></i>Message History
      </h6>
      {msg && msg.length > 0 ? (
        <div>
          {msg.map((m, i) => (
            <Row key={i} className="mb-3">
              <Col
                xs={12}
                md={{ span: 10, offset: m.sender === "Admin" ? 2 : 0 }}
                className={`d-flex ${
                  m.sender === "Admin"
                    ? "justify-content-end"
                    : "justify-content-start"
                }`}
              >
                <div
                  className="p-3 border rounded-4 shadow-sm"
                  style={{
                    background: m.sender === "Admin" ? "#e6f0ff" : "#fff",
                    minWidth: 180,
                    maxWidth: 420,
                    borderTopLeftRadius: m.sender === "Admin" ? 16 : 4,
                    borderTopRightRadius: m.sender === "Admin" ? 4 : 16,
                    borderBottomLeftRadius: 16,
                    borderBottomRightRadius: 16,
                  }}
                >
                  <div className="mb-1 d-flex align-items-center">
                    <Badge
                      bg={m.sender === "Admin" ? "primary" : "secondary"}
                      className="me-2"
                      style={{ fontSize: 13, padding: "0.35em 0.7em" }}
                    >
                      {m.sender}
                    </Badge>
                    <span className="text-muted small">
                      {new Date(m.date).toLocaleString()}
                    </span>
                  </div>
                  <div
                    style={{ whiteSpace: "pre-wrap", fontSize: 15 }}
                    dangerouslySetInnerHTML={{ __html: m.message }}
                  />
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="ms-2"
                    onClick={() => onDeleteMessage && onDeleteMessage(m._id)}
                  >
                    Delete
                  </Button>
                </div>
              </Col>
            </Row>
          ))}
        </div>
      ) : (
        <div className="text-muted text-center py-4">No messages yet.</div>
      )}
    </Card.Body>
  </Card>
);

MessageHistory.propTypes = {
  msg: PropTypes.array.isRequired,
  description: PropTypes.string,
  image: PropTypes.string,
  onDeleteMessage: PropTypes.func,
};

export default MessageHistory;