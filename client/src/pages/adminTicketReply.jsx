// client/src/admin/adminTicketReply.jsx
import React, { useRef, useState, useEffect, useCallback } from "react";
import { Editor } from 'primereact/editor';
import { useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import { BsArrowRepeat, BsExclamationTriangle, BsPrinter, BsGeoAlt, BsCheckCircle } from "react-icons/bs";

import {
    sendTicketReply,
    resolveTicket,
    deleteAdminMessage,
    getAdminTicketById,
    getPublicUnits,
    getAdminUsersByUnit,
    reassignTicket
} from "../api/ticketApi";

import { Container, Card, Button, Form, Row, Col, Badge, Dropdown, Modal, Spinner } from "react-bootstrap";
import MessageHistory from "../components/MessageHistory/MessageHistory";

function TicketReply({ ticketId, onBack, onStatusChange, onTicketUpdate }) {
    const [ticketDetails, setTicketDetails] = useState(null);
    const [reply, setReply] = useState("");
    const [imageFiles, setImageFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [localStatus, setLocalStatus] = useState("");
    const [messages, setMessages] = useState([]);
    const editorRef = useRef(null);
    const fileInputRef = useRef(null);

    const [showReassignDropdown, setShowReassignDropdown] = useState(false);
    const [units, setUnits] = useState([]);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [usersInUnit, setUsersInUnit] = useState([]);
    const [showUserModal, setShowUserModal] = useState(false);
    const [loadingUnits, setLoadingUnits] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);

    const { id: urlTicketId } = useParams();
    const currentTicketId = ticketId || urlTicketId;

    useEffect(() => {
        if (!currentTicketId) {
            console.warn("TicketReply: No ticket ID provided.");
            return;
        }

        const fetchTicketDetails = async () => {
            console.log(`TicketReply: Fetching details for ticket ID: ${currentTicketId}`);
            try {
                const res = await getAdminTicketById(currentTicketId);
                console.log("TicketReply: Raw API Response for getAdminTicketById (full 'res' object):", res);
                console.log("TicketReply: Content of res.data (should be undefined based on logs):", res.data);

                // --- CRITICAL FIX START ---
                // Based on your logs, 'res' itself IS the ticket object, not res.data
                const fetchedTicket = res; // Directly use 'res' as the ticket object
                
                if (fetchedTicket && typeof fetchedTicket === 'object' && fetchedTicket._id) {
                    setTicketDetails(fetchedTicket);
                    setLocalStatus(fetchedTicket.status);
                    setMessages(fetchedTicket.messages || []);
                    console.log("TicketReply: Successfully processed and set ticket details:", fetchedTicket);
                } else {
                    console.error("TicketReply: API response data structure unexpected or actual ticket object missing for ID:", currentTicketId, "Received data:", res);
                    toast.error("Failed to load ticket details: Invalid data structure.");
                    setTicketDetails(null);
                }
                // --- CRITICAL FIX END ---
            } catch (err) {
                console.error("Error fetching ticket details:", err);
                toast.error(
                    err.response?.data?.message ||
                    err.message ||
                    "Failed to fetch ticket details."
                );
                setTicketDetails(null);
            }
        };

        fetchTicketDetails();
    }, [currentTicketId]);

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
            // Clear the editor content properly for PrimeReact Editor
            // PrimeReact Editor doesn't have getEditor() method, just set the state to empty

            setLocalStatus("in progress");
            if (onStatusChange) onStatusChange("in progress");
            const res = await getAdminTicketById(ticketDetails._id);
            if (res) { // Just check if res exists
                const updatedTicket = res; // Directly use 'res' as the updated ticket object
                if (updatedTicket && typeof updatedTicket === 'object' && updatedTicket._id) {
                    setTicketDetails(updatedTicket);
                    setMessages(updatedTicket.messages || []);
                    setLocalStatus(updatedTicket.status);
                    if (typeof onTicketUpdate === "function") {
                        onTicketUpdate(updatedTicket);
                    }
                } else {
                    console.warn("TicketReply: Update fetch returned unexpected data structure after reply.", res);
                }
            }
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
            const res = await getAdminTicketById(ticketDetails._id);
            if (res) { // Just check if res exists
                const updatedTicket = res; // Directly use 'res'
                if (updatedTicket && typeof updatedTicket === 'object' && updatedTicket._id) {
                    setTicketDetails(updatedTicket);
                    setLocalStatus(updatedTicket.status);
                    if (typeof onTicketUpdate === "function") {
                        onTicketUpdate(updatedTicket);
                    }
                } else {
                    console.warn("TicketReply: Update fetch returned unexpected data structure after resolve.", res);
                }
            }
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
                const updatedRes = await getAdminTicketById(ticketDetails._id);
                if (updatedRes) { // Just check if updatedRes exists
                    const updatedTicket = updatedRes; // Directly use updatedRes
                    if (updatedTicket && typeof updatedTicket === 'object' && updatedTicket._id) {
                        setTicketDetails(updatedTicket);
                        setMessages(updatedTicket.messages || []);
                        if (typeof onTicketUpdate === "function") {
                            onTicketUpdate(updatedTicket);
                        }
                    } else {
                        console.warn("TicketReply: Update fetch returned unexpected data structure after message delete.", updatedRes);
                    }
                }
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
            console.log("Fetching units...");
            setLoadingUnits(true);
            try {
                const res = await getPublicUnits();
                console.log("Units API response:", res);
                // Handle simple array response from API
                const data = res.data || res || [];
                console.log("Units extracted:", data);
                setUnits(Array.isArray(data) ? data : []);
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
        console.log("Unit selected:", unit);
        setSelectedUnit(unit);
        setShowReassignDropdown(false);
        setShowUserModal(true);

        setLoadingUsers(true);
        try {
            console.log("Fetching users for unit:", unit);
            const res = await getAdminUsersByUnit(unit);
            console.log("Users API response:", res);
            // Backend returns { success: true, users: [...] }
            const usersArray = res.data?.users ?? [];
            console.log("Users extracted:", usersArray);
            setUsersInUnit(usersArray || []);
        } catch (error) {
            console.error("Error loading users for unit:", error);
            toast.error(`Failed to load users for ${unit}.`);
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
                const updatedRes = await getAdminTicketById(ticketDetails._id);
                if (updatedRes) { // Just check if updatedRes exists
                    const updatedTicket = updatedRes; // Directly use updatedRes
                    if (updatedTicket && typeof updatedTicket === 'object' && updatedTicket._id) {
                        setTicketDetails(updatedTicket);
                        setLocalStatus(updatedTicket.status);
                        if (typeof onTicketUpdate === "function") {
                            onTicketUpdate(updatedTicket);
                        }
                    } else {
                        console.warn("TicketReply: Update fetch returned unexpected data structure after reassign.", updatedRes);
                    }
                }
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

    const messagesForHistory = messages.map(msg => ({
        _id: msg._id,
        sender: msg.authorRole === "admin" ? "Admin" : "User",
        content: msg.content,
        date: msg.date,
        attachments: msg.attachments,
        pending: msg.pending
    }));

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'open': return 'danger';
            case 'in progress': return 'info';
            case 'resolved': return 'success';
            case 'closed': return 'secondary';
            default: return 'primary';
        }
    };

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
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {ticketDetails?.status || 'Open'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Message History and Reply Section */}
          <div className="col-span-2 space-y-6">
            {/* Message History */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center justify-between">
                Message History
                <span className="text-sm text-gray-500">{ticketDetails?.messages?.length || 0} messages</span>
              </h2>
              <div className="space-y-4">
                {ticketDetails?.messages?.map((message, index) => (
                  <div key={index} className={`p-4 rounded-lg ${
                    message.authorRole === 'admin' ? 'bg-green-50' : 'bg-blue-50'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.authorRole === 'admin' ? 'bg-green-500' : 'bg-blue-500'
                        } text-white font-medium`}>
                          {message.authorRole === 'admin' ? 'A' : (message.author?.name?.charAt(0) || 'U')}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium">{message.author?.name}</p>
                          <p className="text-sm text-gray-500">{new Date(message.date).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: message.content }} />
                    {message.attachments?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.attachments.map((attachment, i) => (
                          <a key={i} href={attachment} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200">
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
              <Editor 
                value={reply}
                onTextChange={(e) => setReply(e.htmlValue)}
                className="mb-4"
                ref={editorRef}
                style={{ height: '200px' }}
              />
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
                <input
                  type="file"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  ref={fileInputRef}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
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
                    onClick={handleSubmit}
                    disabled={!reply || !reply.trim() || uploading}
                    className="transition-transform duration-200 hover:scale-105 hover:shadow-lg flex items-center gap-2"
                  >
                    <i className="bi bi-send-fill mr-1"></i>
                    {uploading ? "Uploading..." : "Send Reply"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Button 
                  onClick={handleResolve}
                  disabled={localStatus === "resolved"}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center disabled:opacity-50"
                >
                  <BsCheckCircle className="mr-2" /> Mark as Resolved
                </Button>
                <Button 
                  onClick={() => handleReassignClick(true)}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center justify-center"
                >
                  <BsArrowRepeat className="mr-2" /> Reassign Ticket
                </Button>
                <Button className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center">
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
                    <button 
                      onClick={() => handleReassignClick(true)}
                      className="text-blue-600 text-sm hover:text-blue-700"
                    >
                      Change
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Assigned To</p>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-medium">
                        {ticketDetails?.assignedTo?.name?.charAt(0) || 'A'}
                      </div>
                      <p className="ml-2 font-medium">{ticketDetails?.assignedTo?.name}</p>
                    </div>
                    <button 
                      onClick={() => handleReassignClick(true)}
                      className="text-blue-600 text-sm hover:text-blue-700"
                    >
                      Change
                    </button>
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
                  <p className="font-medium">{ticketDetails?.id}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">Category:</p>
                  <p className="font-medium">{ticketDetails?.category}</p>
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
                  <p className="text-green-600 font-medium">15 minutes</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reassign Dropdown Modal */}
        {showReassignDropdown && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Select Unit for Reassignment</h3>
              {loadingUnits ? (
                <div className="text-center py-4">Loading units...</div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {units.map((unit, index) => (
                    <button
                      key={index}
                      onClick={() => handleUnitSelect(unit)}
                      className="w-full text-left p-3 hover:bg-gray-100 border rounded-md transition-colors"
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  onClick={() => setShowReassignDropdown(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Selection Modal */}
        {showUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">
                Select User from {selectedUnit}
              </h3>
              {loadingUsers ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading users...</span>
                  </div>
                  <p className="mt-2">Loading users...</p>
                </div>
              ) : usersInUnit.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">No users found in this unit.</p>
                  <p className="text-sm text-gray-400 mt-1">Try selecting a different unit.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {usersInUnit.map((user) => (
                    <button
                      key={user._id}
                      onClick={() => handleUserReassign(user)}
                      className="w-full text-left p-3 hover:bg-gray-100 border rounded-md transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-medium mr-3">
                          {user.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  onClick={handleUserModalClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    );
}

export default TicketReply;
