import React, { useRef, useState, useEffect, useCallback } from "react";
import { Editor } from 'primereact/editor';
import { useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import { BsArrowRepeat, BsExclamationTriangle, BsPrinter, BsGeoAlt, BsCheckCircle } from "react-icons/bs";
import { FaUserTag } from "react-icons/fa";

import {
  sendTicketReply,
  resolveTicket,
  deleteAdminMessage,
  getAdminTicketById,
  getPublicUnits,
  getAdminUsersByUnit,
  reassignTicket,
  updateTicketPriority // You'll need this function in ticketApi.js
} from "../api/ticketApi";

import { Container, Card, Button, Form, Row, Col, Badge, Dropdown, Modal, Spinner } from "react-bootstrap";
import MessageHistory from "../components/MessageHistory/MessageHistory"; // Import MessageHistory component
import EscalatePriorityModal from '../components/EscalatePriorityModal'; // Import the EscalatePriorityModal
import ImageDropdown from '../components/ImageDropdown';

function TicketReply({ ticketId, onBack, onStatusChange, onTicketUpdate }) {
  const [ticketDetails, setTicketDetails] = useState(null);
  const [reply, setReply] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [localStatus, setLocalStatus] = useState("");
  const [messages, setMessages] = useState([]);
  const quillRef = useRef(null);

  const [showReassignDropdown, setShowReassignDropdown] = useState(false);
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [usersInUnit, setUsersInUnit] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // State for Escalate Priority Modal
  const [showEscalateModal, setShowEscalateModal] = useState(false);

  const { id: urlTicketId } = useParams();
  const currentTicketId = ticketId || urlTicketId;

  // Function to fetch all ticket data
  const fetchTicketDetails = useCallback(async () => {
    if (!currentTicketId) {
      console.warn("TicketReply: No ticket ID provided.");
      return;
    }
    console.log(`TicketReply: Fetching details for ticket ID: ${currentTicketId}`);
    try {
      const res = await getAdminTicketById(currentTicketId);
      const fetchedTicket = res;
      if (fetchedTicket && typeof fetchedTicket === 'object' && fetchedTicket._id) {
        setTicketDetails(fetchedTicket);
        setLocalStatus(fetchedTicket.status);
        setMessages(fetchedTicket.messages || []);
        console.log("TicketReply: Successfully processed and set ticket details:", fetchedTicket);
        if (typeof onTicketUpdate === "function") {
          onTicketUpdate(fetchedTicket);
        }
      } else {
        console.error("TicketReply: API response data structure unexpected or actual ticket object missing for ID:", currentTicketId, "Received data:", res);
        toast.error("Failed to load ticket details: Invalid data structure.");
        setTicketDetails(null);
      }
    } catch (err) {
      console.error("Error fetching ticket details:", err);
      toast.error(
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch ticket details."
      );
      setTicketDetails(null);
    }
  }, [currentTicketId, onTicketUpdate]); // Add dependencies

  useEffect(() => {
    fetchTicketDetails();
  }, [fetchTicketDetails]); // Use useCallback with useEffect

  if (!ticketDetails) {
    return (
      <Container className="text-center py-5">
        <p>Loading ticket details, please wait...</p>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

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
    setImageFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reply || !reply.trim()) {
      toast.warn("Reply content cannot be empty.");
      return;
    }

    const formData = new FormData();
    formData.append("content", reply);
    if (imageFiles && imageFiles.length > 0) {
      for (let i = 0; i < imageFiles.length; i++) {
        formData.append("attachments", imageFiles[i]);
      }
    }
    setUploading(true);

    const tempId = Date.now().toString();
    const optimisticMessage = {
      _id: tempId,
      authorRole: "admin",
      content: reply,
      date: new Date().toISOString(),
      attachments: imageFiles.map(file => ({ fileName: file.name, url: URL.createObjectURL(file), pending: true })),
      pending: true
    };
    setMessages(prevMessages => [...prevMessages, optimisticMessage]);

    try {
      await sendTicketReply(ticketDetails._id, formData);
      setReply("");
      setImageFiles([]);
      if (quillRef.current && quillRef.current.getEditor()) {
        quillRef.current.getEditor().setText('');
      }
      setLocalStatus("in progress");
      if (onStatusChange) onStatusChange("in progress");
      await fetchTicketDetails(); // Re-fetch to get the final, server-side data
      toast.success("Reply sent successfully!");
    } catch (err) {
      setMessages(prevMessages => prevMessages.filter(m => m._id !== tempId));
      console.error("Failed to send reply:", err);
      toast.error(err.response?.data?.message || "Failed to send reply.");
    } finally {
      setUploading(false);
    }
  };

  const handleResolve = async () => {
    if (localStatus === "resolved") {
      toast.info("Ticket is already resolved.");
      return;
    }
    const confirmResolve = window.confirm("Are you sure you want to mark this ticket as resolved?");
    if (!confirmResolve) return;

    const previousStatus = localStatus;
    setLocalStatus("resolved");
    try {
      await resolveTicket(ticketDetails._id);
      if (onStatusChange) onStatusChange("resolved");
      await fetchTicketDetails();
      toast.success("Ticket resolved successfully!");
    } catch (err) {
      setLocalStatus(previousStatus);
      console.error("Error resolving ticket:", err);
      toast.error(err.response?.data?.message || "Failed to resolve ticket.");
    }
  };

  const handleDeleteMessage = async (messageId) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this message? This action cannot be undone.");
    if (!isConfirmed) return;

    const previousMessages = messages;
    setMessages(prev => prev.filter(m => m._id !== messageId));

    try {
      console.log(`Attempting to delete message: ${messageId} from ticket: ${ticketDetails._id}`);
      const res = await deleteAdminMessage(ticketDetails._id, messageId);
      if (res && res.data && res.data.success) {
        toast.success(res.data.message || "Message deleted successfully.");
        await fetchTicketDetails();
      } else {
        setMessages(previousMessages);
        toast.error(res?.data?.message || "Failed to delete message.");
      }
    } catch (err) {
      setMessages(previousMessages);
      console.error("Error deleting message:", err);
      toast.error(err.response?.data?.message || "Error deleting message.");
    }
  };

  const handleReassignClick = async (nextShow) => {
    if (nextShow && !showReassignDropdown) {
      setLoadingUnits(true);
      try {
        const res = await getPublicUnits();
        const data = res.data ?? [];
        setUnits(data || []);
        setUsersInUnit([]);
        setSelectedUnit(null);
      } catch (error) {
        console.error("Error fetching units:", error);
        toast.error("Failed to load units for reassign.");
        setUnits([]);
      } finally {
        setLoadingUnits(false);
      }
    }
    setShowReassignDropdown(nextShow);
  };

  const handleUnitSelect = async (unit) => {
    setSelectedUnit(unit);
    setShowReassignDropdown(false);
    setShowUserModal(true);
    setLoadingUsers(true);
    try {
      const res = await getAdminUsersByUnit(unit.name);
      const usersArray = res.data ?? [];
      setUsersInUnit(usersArray || []);
    } catch (error) {
      console.error("Error loading users for unit:", error);
      toast.error(`Failed to load users for ${unit.name}.`);
      setUsersInUnit([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleUserReassign = async (user) => {
    const isConfirmed = window.confirm(`Are you sure you want to reassign this ticket to ${user.name} (${user.email})?`);
    if (!isConfirmed) return;

    setShowUserModal(false);
    setShowReassignDropdown(false);
    setSelectedUnit(null);
    setUsersInUnit([]);

    try {
      const res = await reassignTicket(ticketDetails._id, user._id);
      if (res && res.data) {
        toast.success(res.data.message || "Ticket reassigned successfully!");
        await fetchTicketDetails();
      }
    } catch (error) {
      console.error("Error reassigning ticket:", error);
      toast.error(error.response?.data?.message || "Failed to reassign ticket.");
    }
  };

  const handleUserModalClose = () => {
    setShowUserModal(false);
    setSelectedUnit(null);
    setUsersInUnit([]);
  };

  // Handlers for Escalate Priority Modal
  const handleOpenEscalateModal = () => setShowEscalateModal(true);
  const handleCloseEscalateModal = () => setShowEscalateModal(false);
  const handlePriorityUpdated = () => {
    toast.success("Ticket priority updated successfully!");
    fetchTicketDetails(); // Re-fetch data to reflect the change
  };


  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'open': return 'danger';
      case 'in progress': return 'info';
      case 'resolved': return 'success';
      case 'closed': return 'secondary';
      default: return 'primary';
    }
  };

  // Replaces the inline message rendering with the dedicated component
  const messagesForHistory = messages.map(msg => ({
    _id: msg._id,
    sender: msg.authorRole === "admin" ? "Admin" : "User",
    content: msg.content,
    date: msg.date,
    attachments: msg.attachments,
    pending: msg.pending,
    canDelete: msg.authorRole === "admin",
    onDelete: handleDeleteMessage,
  }));
  

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Ticket Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{ticketDetails?.subject}</h1>
              <div className="mt-2 flex items-center space-x-4">
                <div className="flex items-center text-sm text-gray-500">
                  <BsGeoAlt className="mr-2" />
                  Location: {ticketDetails?.location || 'Not specified'}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <BsPrinter className="mr-2" />
                  Device: {ticketDetails?.device || 'Not specified'}
                </div>
                {ticketDetails?.error && (
                  <div className="flex items-center text-sm text-red-500">
                    <BsExclamationTriangle className="mr-2" />
                    Error: {ticketDetails.error}
                  </div>
                )}
              </div>
            </div>
            <div className="flex space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium 
                ${ticketDetails?.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'}`}>
                {ticketDetails?.priority || 'Normal'} Priority
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                ticketDetails?.status === 'open' ? 'bg-red-100 text-red-800' :
                ticketDetails?.status === 'in progress' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {ticketDetails?.status || 'Open'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Message/Reply */}
          <div className="col-span-2 space-y-6">
            {/* Message History */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center justify-between">
                Message History
                <span className="text-sm text-gray-500">{messages.length || 0} messages</span>
              </h2>
              {/* Use the dedicated MessageHistory component */}
              <MessageHistory messages={messagesForHistory} />
            </div>

            {/* Reply Editor */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Send Message</h2>
              <Editor
                value={reply}
                onTextChange={(e) => setReply(e.htmlValue)}
                className="mb-4"
                modules={modules}
                ref={quillRef}
              />
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
                <input
                  type="file"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <button
                  onClick={() => document.getElementById('image-upload').click()}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Click to upload
                </button>
                <p className="text-sm text-gray-500 mt-1">or drag and drop files here</p>
                <p className="text-xs text-gray-400">PNG, JPG, PDF up to 10MB</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  💡 Tip: Use @mention to notify specific team members
                </p>
                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    variant="success"
                    onClick={handleSubmit}

                    disabled={!reply || !reply.trim() || uploading}
                    className="transition-transform duration-200 hover:scale-105 hover:shadow-lg flex items-center gap-2"
                  >
                    {uploading ? "Uploading..." : "Send Reply"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Button
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center"
                  onClick={handleResolve}
                  disabled={localStatus === "resolved"}
                >
                  <BsCheckCircle className="mr-2" /> Mark as Resolved
                </Button>
                <Dropdown show={showReassignDropdown} onToggle={handleReassignClick} className="w-full">
                  <Dropdown.Toggle as={Button} variant="primary" className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center justify-center">
                    <BsArrowRepeat className="mr-2" />
                    Reassign Ticket
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="w-100">
                    {loadingUnits ? (
                      <Dropdown.Item disabled>
                        <Spinner animation="border" size="sm" /> Loading Units...
                      </Dropdown.Item>
                    ) : units.length > 0 ? (
                      units.map(unit => (
                        <Dropdown.Item key={unit._id} onClick={() => handleUnitSelect(unit)}>
                          {unit.name}
                        </Dropdown.Item>
                      ))
                    ) : (
                      <Dropdown.Item disabled>No units available</Dropdown.Item>
                    )}
                  </Dropdown.Menu>
                </Dropdown>
                <Button
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center"
                  onClick={handleOpenEscalateModal}
                >
                  ⚡ Escalate Priority
                </Button>
                <Button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center">
                  📚 Add to Knowledge Base
                </Button>
              </div>
            </div>

            {/* Assignment Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Assignment Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Assigned Unit</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="font-medium">{ticketDetails?.assignedUnit}</p>
                    <Dropdown show={showReassignDropdown} onToggle={handleReassignClick} className="d-inline">
                        <Dropdown.Toggle as={Button} variant="link" className="text-blue-600 text-sm p-0">Change</Dropdown.Toggle>
                        <Dropdown.Menu>
                            {loadingUnits ? (
                                <Dropdown.Item disabled><Spinner animation="border" size="sm" /> Loading Units...</Dropdown.Item>
                            ) : units.length > 0 ? (
                                units.map(unit => (
                                    <Dropdown.Item key={unit._id} onClick={() => handleUnitSelect(unit)}>{unit.name}</Dropdown.Item>
                                ))
                            ) : (
                                <Dropdown.Item disabled>No units available</Dropdown.Item>
                            )}
                        </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Assigned To</p>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-medium">
                        {ticketDetails?.assignedTo?.name?.charAt(0) || 'A'}
                      </div>
                      <p className="ml-2 font-medium">{ticketDetails?.assignedTo?.name || 'Unassigned'}</p>
                    </div>
                    {/* The "Change" button here is redundant if the dropdown above is used. Let's make it work the same way. */}
                    <Dropdown show={showReassignDropdown} onToggle={handleReassignClick} className="d-inline">
                        <Dropdown.Toggle as={Button} variant="link" className="text-blue-600 text-sm p-0">Change</Dropdown.Toggle>
                        <Dropdown.Menu>
                            {loadingUnits ? (
                                <Dropdown.Item disabled><Spinner animation="border" size="sm" /> Loading Units...</Dropdown.Item>
                            ) : units.length > 0 ? (
                                units.map(unit => (
                                    <Dropdown.Item key={unit._id} onClick={() => handleUnitSelect(unit)}>{unit.name}</Dropdown.Item>
                                ))
                            ) : (
                                <Dropdown.Item disabled>No units available</Dropdown.Item>
                            )}
                        </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Ticket Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">Ticket ID:</p>
                  <p className="font-medium">{ticketDetails?._id}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">Category:</p>
                  <p className="font-medium">{ticketDetails?.type}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">Created:</p>
                  <p className="font-medium">{new Date(ticketDetails?.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">Last Updated:</p>
                  <p className="font-medium">{new Date(ticketDetails?.updatedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">Response Time:</p>
                  {/* Dynamic calculation for response time, if data is available */}
                  <p className="text-green-600 font-medium">
                    {ticketDetails?.firstResponseTime ? `${Math.round(ticketDetails.firstResponseTime / 60000)} minutes` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for selecting user for reassign */}
      <Modal show={showUserModal} onHide={handleUserModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Reassign to a User in {selectedUnit?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingUsers ? (
            <div className="text-center"><Spinner animation="border" /> Loading users...</div>
          ) : usersInUnit.length > 0 ? (
            <ul className="list-group">
              {usersInUnit.map(user => (
                <li key={user._id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <FaUserTag className="me-2" />
                    {user.name} ({user.email})
                  </div>
                  <Button variant="outline-primary" size="sm" onClick={() => handleUserReassign(user)}>Reassign</Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center">No users found in this unit.</p>
          )}
        </Modal.Body>
      </Modal>

      {/* Modal for Escalate Priority */}
      <EscalatePriorityModal
        show={showEscalateModal}
        handleClose={handleCloseEscalateModal}
        ticketId={ticketDetails?._id}
        onPriorityUpdated={handlePriorityUpdated}
        currentPriority={ticketDetails?.priority}
      />
    </div>
  );
}

export default TicketReply;