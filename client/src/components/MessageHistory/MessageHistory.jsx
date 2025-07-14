import React from "react";
import PropTypes from "prop-types";
import { Card, Row, Col, Badge, Button, Dropdown } from "react-bootstrap";
import { useState } from "react";

const MessageHistory = ({ msg, description, image, onDeleteMessage, onAttachmentClick }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  return (
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
                    className="p-3 border rounded-4 shadow-sm position-relative"
                    style={{
                      background: m.sender === "Admin" ? "#e6f0ff" : "#fff",
                      minWidth: 180,
                      maxWidth: 420,
                      borderTopLeftRadius: m.sender === "Admin" ? 16 : 4,
                      borderTopRightRadius: m.sender === "Admin" ? 4 : 16,
                      borderBottomLeftRadius: 16,
                      borderBottomRightRadius: 16,
                    }}
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
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
                      {/* Dropdown only on hover */}
                      {hoveredIdx === i && (
                        <Dropdown align="end" className="ms-auto">
                          <Dropdown.Toggle
                            variant="link"
                            size="sm"
                            style={{ boxShadow: "none", color: "#888" }}
                            id={`dropdown-message-${i}`}
                          >
                            <i className="bi bi-three-dots-vertical"></i>
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item
                              onClick={() => onDeleteMessage && onDeleteMessage(m._id)}
                              className="text-danger"
                            >
                              <i className="bi bi-trash me-2"></i>Delete
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      )}
                    </div>
                    <div
                      style={{ whiteSpace: "pre-wrap", fontSize: 15 }}
                      dangerouslySetInnerHTML={{ __html: m.message }}
                    />
                    {m.attachments && m.attachments.length > 0 && (
                      <div className="mt-2">
                        {m.attachments.map((url, idx) => {
                          const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url);
                          if (isImage && onAttachmentClick) {
                            return (
                              <img
                                key={idx}
                                src={url.startsWith('http') ? url : `http://localhost:4000${url}`}
                                alt={`attachment-${idx}`}
                                style={{
                                  maxWidth: 120,
                                  maxHeight: 120,
                                  borderRadius: 6,
                                  border: "1px solid #e3e3e3",
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                  marginRight: 8,
                                  cursor: 'zoom-in',
                                }}
                                onClick={() => onAttachmentClick(url.startsWith('http') ? url : `http://localhost:4000${url}`)}
                              />
                            );
                          } else {
                            return (
                              <a
                                key={idx}
                                href={url.startsWith('http') ? url : `http://localhost:4000${url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="d-inline-block me-2"
                              >
                                <img
                                  src={url.startsWith('http') ? url : `http://localhost:4000${url}`}
                                  alt={`attachment-${idx}`}
                                  style={{
                                    maxWidth: 120,
                                    maxHeight: 120,
                                    borderRadius: 6,
                                    border: "1px solid #e3e3e3",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                    marginRight: 8
                                  }}
                                />
                              </a>
                            );
                          }
                        })}
                      </div>
                    )}
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
};

MessageHistory.propTypes = {
  msg: PropTypes.array.isRequired,
  description: PropTypes.string,
  image: PropTypes.string,
  onDeleteMessage: PropTypes.func,
};

export default MessageHistory;