import React, { useEffect, useState, useContext } from "react";
import { Container, Row, Col, Spinner, Alert, Card, Badge, Button, Form, Modal } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import MessageHistory from "../components/MessageHistory/MessageHistory";
import { Editor } from 'primereact/editor';
import { toast } from 'react-toastify';
import { AppContent } from '../context/AppContext';
import { deleteUserMessage } from '../api/ticketApi';
import { BsTicketDetailed, BsDiagram3, BsPersonBadge, BsInfoCircle, BsTag, BsCalendar, BsXCircle, BsImage, BsSend, BsArrowLeft, BsCardText } from 'react-icons/bs';

const statusColors = {
  open: "success",
  closed: "danger",
  resolved: "primary",
  reopened: "warning"
};

const statusBg = {
  open: "bg-green-100 text-green-700 border-green-300",
  closed: "bg-red-100 text-red-700 border-red-300",
  resolved: "bg-blue-100 text-blue-700 border-blue-300",
  reopened: "bg-yellow-100 text-yellow-700 border-yellow-300",
  'in progress': "bg-cyan-100 text-cyan-700 border-cyan-300"
};

const Ticket = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userData } = useContext(AppContent);
  const token = userData?.token;
  const currentUserId = userData?.id;

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
      if (res.data.success) {
        toast.success(res.data.message || "Message deleted successfully.");
        setTicket(prevTicket => ({
          ...prevTicket,
          messages: prevTicket.messages.filter(msg => msg._id !== messageId)
        }));
      } else {
        toast.error(res.data.message || "Failed to delete message.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete message.");
    }
  };

  // Helper to get absolute URL for attachments
  const getAttachmentUrl = (url) =>
    url.startsWith('http') ? url : `${window.location.origin.replace(/:[0-9]+$/, ':4000')}${url}`;

  if (loading) return (
    <Container className="d-flex justify-content-center align-items-center min-h-screen animate-fade-in" style={{ minHeight: "60vh" }}>
      <Spinner animation="border" variant="primary" />
    </Container>
  );

  if (error) return (
    <Container className="py-5 animate-fade-in">
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
    authorId: msg.author?.toString ? msg.author.toString() : String(msg.author)
  }));

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen animate-fade-in" style={{ minHeight: '100vh' }}>
      {/* Floating Back Button */}
      <Button
        variant="light"
        className="absolute top-4 left-4 z-10 flex items-center gap-2 shadow-md rounded-full px-3 py-2 hover:bg-blue-100 transition"
        onClick={() => navigate(-1)}
        style={{ position: 'fixed', top: 24, left: 24 }}
      >
        <BsArrowLeft className="text-blue-500" size={20} /> Back
      </Button>
      <Container className="py-4" style={{ maxWidth: 1200, width: '100%' }}>
        <Row className="justify-content-center">
          <Col xs={12}>
            <Card className="shadow-lg border-0 mb-4 animate-pop" style={{ borderRadius: 18 }}>
              <Card.Body className="p-5">
                <Row>
                  <Col xs={12} md={8}>
                    <h3 className="mb-4 text-blue-700 flex items-center gap-2">
                      <BsTicketDetailed className="text-blue-500" size={28} />
                      Ticket Details
                    </h3>
                    <div className="mb-3 flex items-center gap-2">
                      <span className="font-semibold text-gray-600 flex items-center gap-2"><BsCardText /> Subject:</span>
                      <span className="text-lg font-bold">{ticket.subject}</span>
                    </div>
                    <div className="mb-3 flex items-center gap-2">
                      <span className="font-semibold text-gray-600 flex items-center gap-2"><BsCalendar /> Opened:</span>
                      <span>{ticket.createdAt && new Date(ticket.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="mb-3 flex items-center gap-2">
                      <span className="font-semibold text-gray-600 flex items-center gap-2"><BsDiagram3 /> Assigned Unit:</span>
                      <Badge bg="secondary" className="text-capitalize px-3 py-2 rounded-xl flex items-center gap-1">
                        <BsDiagram3 className="me-1" />
                        {ticket.assignedUnit || '—'}
                      </Badge>
                    </div>
                    <div className="mb-3 flex items-center gap-2">
                      <span className="font-semibold text-gray-600 flex items-center gap-2"><BsPersonBadge /> Assigned To:</span>
                      <Badge bg="info" className="text-capitalize px-3 py-2 rounded-xl flex items-center gap-1">
                        <BsPersonBadge className="me-1" />
                        {ticket.assignedTo && typeof ticket.assignedTo === 'object' && ticket.assignedTo.name
                          ? ticket.assignedTo.name
                          : '—'}
                      </Badge>
                    </div>
                    <div className="mb-3 flex items-center gap-2">
                      <span className="font-semibold text-gray-600 flex items-center gap-2"><BsInfoCircle /> Status:</span>
                      <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border font-semibold text-base transition ${statusBg[ticket.status] || 'bg-gray-100 text-gray-700 border-gray-300'}`}> <BsInfoCircle /> {ticket.status}</span>
                    </div>
                    <div className="mb-3 flex items-center gap-2">
                      <span className="font-semibold text-gray-600 flex items-center gap-2"><BsTag /> Type:</span>
                      <Badge bg="info" text="dark" className="text-capitalize px-3 py-2 rounded-xl flex items-center gap-1"><BsTag />{ticket.type}</Badge>
                    </div>
                  </Col>
                  <Col xs={12} md={4} className="d-flex align-items-center justify-content-md-end justify-content-start mt-3 mt-md-0">
                    {ticket.status === "open" && (
                      <Button
                        variant="danger"
                        onClick={handleCloseTicket}
                        disabled={closing}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg shadow hover:scale-105 hover:shadow-lg transition-all duration-200 animate-pop"
                      >
                        <BsXCircle className="me-2" size={22} />
                        {closing ? "Closing..." : "Close Ticket"}
                      </Button>
                    )}
                  </Col>
                </Row>
                <hr className="my-5 border-blue-200 animate-fade-in" />
                <Row>
                  <Col>
                    {ticket.attachments && ticket.attachments.length > 0 && (
                      <div className="mb-4">
                        <h5 className="font-semibold mb-2 flex items-center gap-2">
                          <BsImage className="text-blue-400" /> Attachments
                        </h5>
                        <div className="flex flex-wrap gap-3">
                          {ticket.attachments.map((url, idx) => (
                            <a
                              key={idx}
                              href={getAttachmentUrl(url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block"
                            >
                              {url.match(/\.(jpg|jpeg|png)$/i) ? (
                                <img
                                  src={getAttachmentUrl(url)}
                                  alt={`attachment-${idx}`}
                                  style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                                  className="hover:scale-105 transition"
                                />
                              ) : (
                                <span className="px-3 py-2 bg-gray-100 rounded shadow text-blue-700 font-semibold hover:bg-blue-50 transition">
                                  {url.split('/').pop()}
                                </span>
                              )}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    <MessageHistory
                      msg={messages}
                      description={ticket.description}
                      image={ticket.image}
                      currentUserRole="user"
                      currentUserId={currentUserId}
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
                <hr className="my-5 border-blue-200 animate-fade-in" />
                <Row>
                  <Col>
                    <Card className="shadow-sm mt-4 animate-pop" style={{ borderRadius: 14 }}>
                      <Card.Body>
                        <Form onSubmit={handleUserReply} className="space-y-4">
                          <Form.Group className="mb-4">
                            <Form.Label className="font-semibold flex items-center gap-2"><BsSend className="text-blue-400" /> Reply</Form.Label>
                            <Editor
                              value={reply}
                              onTextChange={(e) => setReply(e.htmlValue)}
                              style={{ height: '180px', width: '100%' }}
                            />
                          </Form.Group>
                          <Form.Group className="mb-4">
                            <Form.Label className="font-semibold flex items-center gap-2"><BsImage className="text-blue-400" /> Attach Image</Form.Label>
                            <Form.Control
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleImageChange}
                              disabled={uploading}
                            />
                            {imageFiles.length > 0 && (
                              <div className="mt-2 text-green-600 flex items-center gap-2 animate-fade-in">
                                <BsImage /> {imageFiles.length} files selected
                              </div>
                            )}
                          </Form.Group>
                          <div className="d-grid">
                            <Button
                              type="submit"
                              variant="primary"
                              disabled={!reply || !reply.trim() || uploading}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg shadow hover:scale-105 hover:shadow-lg transition-all duration-200 animate-pop"
                            >
                              {uploading ? <span className="flex items-center gap-2"><BsSend className="animate-spin" /> Sending...</span> : <span className="flex items-center gap-2"><BsSend /> Send Reply</span>}
                            </Button>
                          </div>
                        </Form>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      {/* Image Zoom Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Body className="d-flex flex-column align-items-center justify-content-center p-0" style={{ background: '#222', borderRadius: 16 }}>
          {modalImage && (
            <img
              src={modalImage}
              alt="attachment zoom"
              style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.25)' }}
              className="animate-fade-in"
            />
          )}
        </Modal.Body>
      </Modal>
      <style>{`
        @keyframes popIn { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .animate-pop { animation: popIn 0.5s cubic-bezier(.68,-0.55,.27,1.55); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.5s; }
      `}</style>
    </div>
  );
};

export default Ticket;
