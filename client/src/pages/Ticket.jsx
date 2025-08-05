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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="outline-primary"
          className="mb-4 flex items-center gap-2 shadow-sm"
          onClick={() => navigate(-1)}
        >
          <BsArrowLeft size={20} /> Back to Tickets
        </Button>

        {/* Ticket Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{ticket.subject}</h1>
              <div className="mt-2 flex items-center space-x-4">
                <div className="flex items-center text-sm text-gray-500">
                  <BsCalendar className="mr-2" />
                  Created: {ticket.createdAt && new Date(ticket.createdAt).toLocaleString()}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <BsDiagram3 className="mr-2" />
                  Unit: {ticket.assignedUnit || 'Not assigned'}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <BsPersonBadge className="mr-2" />
                  Assigned: {ticket.assignedTo?.name || 'Not assigned'}
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium 
                ${ticket.type === 'incident' ? 'bg-red-100 text-red-800' : 
                  ticket.type === 'request' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'}`}>
                <BsTag className="mr-1" />
                {ticket.type}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium 
                ${ticket.status === 'open' ? 'bg-red-100 text-red-800' :
                  ticket.status === 'in progress' ? 'bg-yellow-100 text-yellow-800' :
                  ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  ticket.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                  'bg-blue-100 text-blue-800'}`}>
                <BsInfoCircle className="mr-1" />
                {ticket.status}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Message History and Reply Section */}
          <div className="col-span-2 space-y-6">
            {/* Ticket Description */}
            {ticket.description && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Initial Request</h2>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700">{ticket.description}</p>
                </div>
                {ticket.attachments && ticket.attachments.length > 0 && (
                  <div className="mt-4">
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
                              className="w-20 h-20 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                              onClick={() => handleAttachmentClick(getAttachmentUrl(url))}
                            />
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                              📎 {url.split('/').pop()}
                            </span>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Message History */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center justify-between">
                Message History
                <span className="text-sm text-gray-500">{messages.length} messages</span>
              </h2>
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className={`p-4 rounded-lg ${
                    message.sender === 'Admin' ? 'bg-green-50' : 'bg-blue-50'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.sender === 'Admin' ? 'bg-green-500' : 'bg-blue-500'
                        } text-white font-medium`}>
                          {message.sender === 'Admin' ? 'A' : 'U'}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium">{message.sender}</p>
                          <p className="text-sm text-gray-500">{new Date(message.date).toLocaleString()}</p>
                        </div>
                      </div>
                      {message.sender === 'User' && message.authorId === currentUserId && (
                        <button
                          onClick={() => handleDeleteMessage(message._id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          <BsXCircle />
                        </button>
                      )}
                    </div>
                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: message.message }} />
                    {message.attachments?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.attachments.map((attachment, i) => (
                          <a 
                            key={i} 
                            href={getAttachmentUrl(attachment)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                          >
                            📎 Download
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Reply Editor */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Send Message</h2>
              <Form onSubmit={handleUserReply}>
                <Form.Group className="mb-4">
                  <Editor
                    value={reply}
                    onTextChange={(e) => setReply(e.htmlValue)}
                    style={{ height: '200px' }}
                  />
                </Form.Group>
                <Form.Group className="mb-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Form.Control
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      disabled={uploading}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="text-blue-600 hover:text-blue-700">
                        <BsImage className="mx-auto mb-2" size={24} />
                        Click to upload images
                      </div>
                      <p className="text-sm text-gray-500 mt-1">or drag and drop files here</p>
                      <p className="text-xs text-gray-400">PNG, JPG up to 10MB</p>
                    </label>
                    {imageFiles.length > 0 && (
                      <div className="mt-2 text-green-600 flex items-center justify-center gap-2">
                        <BsImage /> {imageFiles.length} files selected
                      </div>
                    )}
                  </div>
                </Form.Group>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="success"
                    disabled={!reply || !reply.trim() || uploading}
                    className="flex items-center gap-2 px-4 py-2"
                  >
                    <BsSend />
                    {uploading ? "Sending..." : "Send Reply"}
                  </Button>
                </div>
              </Form>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                {ticket.status === "open" && (
                  <Button
                    variant="danger"
                    onClick={handleCloseTicket}
                    disabled={closing}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <BsXCircle />
                    {closing ? "Closing..." : "Close Ticket"}
                  </Button>
                )}
              </div>
            </div>

            {/* Ticket Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Ticket Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">Ticket ID:</p>
                  <p className="font-medium">{ticket._id}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">Type:</p>
                  <p className="font-medium capitalize">{ticket.type}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">Status:</p>
                  <p className="font-medium capitalize">{ticket.status}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">Created:</p>
                  <p className="font-medium">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">Last Updated:</p>
                  <p className="font-medium">{new Date(ticket.updatedAt || ticket.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">Assigned Unit:</p>
                  <p className="font-medium">{ticket.assignedUnit || 'Not assigned'}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">Assigned To:</p>
                  <p className="font-medium">{ticket.assignedTo?.name || 'Not assigned'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Image Zoom Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
          <Modal.Body className="d-flex flex-column align-items-center justify-content-center p-0" style={{ background: '#222', borderRadius: 16 }}>
            {modalImage && (
              <img
                src={modalImage}
                alt="attachment zoom"
                style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.25)' }}
              />
            )}
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default Ticket;
