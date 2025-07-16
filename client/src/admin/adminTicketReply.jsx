import React, { useRef, useState, useEffect } from "react";
import { Editor } from 'primereact/editor';
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import axios from "axios";
import { sendTicketReply, resolveTicket, deleteAdminMessage, getAdminTicketById } from "../api/ticketApi"; 


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
      console.log(`Attempting to delete message: ${messageId} from ticket: ${ticket._id}`);
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

  // Helper to get absolute URL for attachments
  const getAttachmentUrl = (url) =>
    url.startsWith('http') ? url : `${window.location.origin.replace(/:[0-9]+$/, ':4000')}${url}`;

  return (
    <Container
      className="py-8 flex justify-center items-start animate-fade-in"
      style={{ maxWidth: "1200px", width: '100%' }}
    >
      <Row className="justify-content-center w-full">
        <Col md={12} lg={12} className="w-full">
          <Button
            variant="link"
            onClick={onBack}
            className="mb-4 px-0 text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center gap-2"
            style={{ fontWeight: 600, fontSize: 18 }}
          >
            <i className="bi bi-arrow-left-circle-fill mr-2 text-xl align-middle"></i>
            Back to Tickets
          </Button>
          <Card
            className="shadow-lg border-0 rounded-3xl transition-transform duration-200 hover:scale-[1.01] hover:shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)', borderRadius: '1.5rem' }}
          >
            <Card.Header className="bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-t-3xl flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <h4 className="mb-0 flex items-center gap-2">
                <i className="bi bi-chat-left-text-fill mr-2 text-2xl"></i>
                Reply to:
                <Badge bg="light" text="dark" className="ml-2 px-3 py-2 text-base rounded-xl shadow-sm">
                  {ticket.subject}
                </Badge>
              </h4>
              <div className="mt-2 md:mt-0 flex items-center gap-2">
                <Badge bg="secondary" className="text-capitalize px-3 py-2 rounded-xl flex items-center gap-1">
                  <i className="bi bi-diagram-3 me-1"></i>
                  {ticket.assignedUnit || '—'}
                </Badge>
                <Badge bg="info" className="text-capitalize px-3 py-2 rounded-xl flex items-center gap-1">
                  <i className="bi bi-person me-1"></i>
                  {ticket.assignedTo && typeof ticket.assignedTo === 'object' && ticket.assignedTo.name
                    ? ticket.assignedTo.name
                    : '—'}
                </Badge>
                <Badge bg={localStatus === 'resolved' ? 'success' : 'info'} className="ml-2 px-3 py-2 rounded-xl animate-pulse">
                  <i className={`bi ${localStatus === 'resolved' ? 'bi-check-circle-fill' : 'bi-hourglass-split'} mr-1`}></i>
                  {localStatus.charAt(0).toUpperCase() + localStatus.slice(1)}
                </Badge>
              </div>
            </Card.Header>
            <Card.Body className="bg-white rounded-b-3xl p-6 md:p-8">
              {/* Message History */}
              {ticket.attachments && ticket.attachments.length > 0 && (
                <div className="mb-4">
                  <h5 className="font-semibold mb-2 flex items-center gap-2">
                    <i className="bi bi-image text-blue-400"></i> Attachments
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
              <div className="mb-8">
                <MessageHistory
                  msg={messagesForHistory}
                  description={ticket.description}
                  image={ticket.image}
                  onDeleteMessage={handleDeleteMessage}
                  currentUserRole="admin"
                />
              </div>

              {/* Reply Form */}
              <Form onSubmit={handleSubmit} className="space-y-6">
                <Form.Group className="mb-4 mt-4">
                  <Form.Label className="font-semibold text-lg">Reply</Form.Label>
                  <div className="rounded-xl border border-blue-200 shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-blue-400 transition-all duration-200">
                    <Editor
                      ref={quillRef}
                      value={reply}
                      onTextChange={(e) => setReply(e.htmlValue)}
                      style={{ height: '320px', width: '100%', background: 'white' }}
                      modules={modules}
                    />
                  </div>
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="font-semibold text-lg">Attach Image</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    disabled={uploading}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all duration-200"
                  />
                  {imageFiles.length > 0 && (
                    <div className="mt-2 text-green-600 flex items-center gap-2 animate-fade-in">
                      <i className="bi bi-image me-1"></i>
                      {imageFiles.length} file(s) selected
                    </div>
                  )}
                </Form.Group>
                <div className="flex flex-col md:flex-row justify-between gap-4 mt-6">
                  <Button
                    type="button"
                    variant="warning"
                    onClick={handleResolve}
                    disabled={localStatus === "resolved"}
                    className="transition-transform duration-200 hover:scale-105 hover:shadow-lg flex items-center gap-2"
                  >
                    <i className="bi bi-check2-circle mr-1"></i>
                    Mark as Resolved
                  </Button>
                  <Button
                    type="submit"
                    variant="success"
                    disabled={!reply || !reply.trim() || uploading}
                    className="transition-transform duration-200 hover:scale-105 hover:shadow-lg flex items-center gap-2"
                  >
                    <i className="bi bi-send-fill mr-1"></i>
                    {uploading ? "Uploading..." : "Send Reply"}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(0.4,0,0.2,1) both; }
      `}</style>
    </Container>
  );
}

export default TicketReply;