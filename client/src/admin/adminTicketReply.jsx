// client/src/admin/adminTicketReply.jsx
import React, { useRef, useState, useEffect } from "react";
import { Editor } from 'primereact/editor';
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
// No direct axios import needed here if all calls go through ticketApi.js
// import axios from "axios";

import {
    sendTicketReply,
    resolveTicket,
    deleteAdminMessage,
    getAdminTicketById,
    getPublicUnits,
    getUsersByUnit,
    reassignTicket
} from "../api/ticketApi"; // CORRECTED PATH: From src/admin to src/api is one level up then into api

import { Container, Card, Button, Form, Row, Col, Badge, Dropdown } from "react-bootstrap";
// CORRECTED PATH FOR MESSAGEHISTORY
import MessageHistory from "../components/MessageHistory/MessageHistory"; // <--- THIS LINE IS CHANGED
import { toast } from 'react-toastify';

// Removed 'token' prop from TicketReply component as it's not directly used
// and `withCredentials: true` in axiosInstance should handle auth.
function TicketReply({ ticket, onBack, onStatusChange, onTicketUpdate }) {
    const [reply, setReply] = useState("");
    const [imageFiles, setImageFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [localStatus, setLocalStatus] = useState(ticket.status);
    const [messages, setMessages] = useState(ticket.messages || []);
    const quillRef = useRef();

    // --- NEW STATE FOR REASSIGN FEATURE ---
    const [showReassignDropdown, setShowReassignDropdown] = useState(false);
    const [units, setUnits] = useState([]);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [usersInUnit, setUsersInUnit] = useState([]);
    // ------------------------------------

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
            // No 'token' parameter needed if using axiosInstance with withCredentials
            await sendTicketReply(ticket._id, formData);
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
            // No 'token' parameter needed
            await resolveTicket(ticket._id);
            if (onStatusChange) onStatusChange("resolved");
            await fetchTicket();
            onBack(); // Go back after resolving
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
            // No 'token' parameter needed
            const res = await deleteAdminMessage(ticket._id, messageId);
            if (res.success) { // Assuming res.data.success is now res.success directly from ticketApi
                toast.success(res.message || "Message deleted successfully."); // Assuming res.data.message is now res.message
                await fetchTicket();
            } else {
                setMessages(previousMessages); // Revert if backend indicates failure
                toast.error(res.message || "Failed to delete message.");
            }
        } catch (err) {
            setMessages(previousMessages); // Revert on network/server error
            toast.error(err.response?.data?.message || "Error deleting message.");
        }
    };

    const fetchTicket = async () => {
        try {
            // No 'token' parameter needed
            const res = await getAdminTicketById(ticket._id); // res is now res.data directly
            if (res) { // res is the data object, not { data: res }
                setLocalStatus(res.status);
                setMessages(res.messages || []);
                if (typeof onTicketUpdate === "function") {
                    onTicketUpdate(res); // Update parent component's ticket state with the direct data
                }
            }
        } catch (err) {
            console.error("Error fetching updated ticket:", err);
        }
    };

    // --- NEW HANDLERS FOR REASSIGN FEATURE ---
    const handleReassignClick = async () => {
        if (!showReassignDropdown) { // If opening dropdown
            try {
                console.log("[Frontend] handleReassignClick: Attempting to fetch public units..."); // Added for debugging
                // getPublicUnits now returns the array of units directly (response.data)
                const unitsData = await getPublicUnits();
                console.log("[Frontend] handleReassignClick: Fetched units:", unitsData); // Added for debugging
                setUnits(unitsData || []); // Ensure it's always an array
                setUsersInUnit([]); // Clear previous users
                setSelectedUnit(null); // Clear selected unit
            } catch (error) {
                console.error("[Frontend] handleReassignClick: Error fetching units:", error);
                toast.error("Failed to load units for reassign.");
            }
        }
        setShowReassignDropdown(prev => !prev); // Toggle visibility
    };

    const handleUnitSelect = async (unit) => {
        setSelectedUnit(unit);
        // --- ADDED LOGS HERE ---
        console.log("[Frontend] handleUnitSelect: Unit selected for lookup:", unit);
        console.log("[Frontend] handleUnitSelect: Sending unit.name to API:", unit.name);
        // --- END ADDED LOGS ---
        try {
            // getUsersByUnit now returns the data object from the backend (e.g., { success: true, users: [...] })
            const userDataResponse = await getUsersByUnit(unit.name);
            // --- ADDED LOG HERE ---
            console.log("[Frontend] handleUnitSelect: API response for users in unit:", userDataResponse);
            // --- END ADDED LOGS ---
            // Access the 'users' array from the response data
            setUsersInUnit(userDataResponse.users || []); // Ensure it's always an array
        } catch (error) {
            console.error("[Frontend] handleUnitSelect: Error fetching users by unit:", error);
            toast.error(`Failed to load users for ${unit.name}.`);
            setUsersInUnit([]);
        }
    };

    const handleUserReassign = async (user) => {
        setShowReassignDropdown(false); // Close dropdowns
        setSelectedUnit(null);
        setUsersInUnit([]);

        try {
            // reassignTicket now returns the data directly (e.g., { success: true, message: '...' })
            const responseData = await reassignTicket(ticket._id, user._id);
            toast.success(responseData.message);
            await fetchTicket(); // Refresh ticket data to show new assigned person
        } catch (error) {
            console.error("Error reassigning ticket:", error);
            toast.error(error.response?.data?.message || "Failed to reassign ticket.");
        }
    };

    const handleUnassign = async () => {
        setShowReassignDropdown(false);
        setSelectedUnit(null);
        setUsersInUnit([]);

        try {
            // reassignTicket now returns the data directly
            const responseData = await reassignTicket(ticket._id, null); // Pass null to unassign
            toast.success(responseData.message);
            await fetchTicket();
        } catch (error) {
            console.error("Error unassigning ticket:", error);
            toast.error(error.response?.data?.message || "Failed to unassign ticket.");
        }
    };
    // ------------------------------------------

    const messagesForHistory = messages.map(msg => ({
        _id: msg._id,
        sender: msg.authorRole === "admin" ? "Admin" : "User",
        message: msg.content,
        date: msg.date,
        attachments: msg.attachments,
        pending: msg.pending
    }));

    return (
        <Container
            className="py-8 flex justify-center items-start animate-fade-in"
            style={{ maxWidth: "1200px", width: '100%' }}
        >
            <Row className="justify-content-center w-full">
                <Col md={12} lg={12} className="w-full">
                    {/* --- NEW WRAPPER FOR TOP BUTTONS --- */}
                    <div className="d-flex justify-content-between align-items-center mb-4"> {/* Added mb-4 for spacing */}
                        <Button
                            variant="link"
                            onClick={onBack}
                            className="px-0 text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center gap-2"
                            style={{ fontWeight: 600, fontSize: 18 }}
                        >
                            <i className="bi bi-arrow-left-circle-fill mr-2 text-xl align-middle"></i>
                            Back to Tickets
                        </Button>

                        {/* --- REASSIGN BUTTON MOVED HERE --- */}
                        <Dropdown show={showReassignDropdown} onToggle={handleReassignClick} className="position-relative">
                            <Dropdown.Toggle variant="primary" id="dropdown-reassign" className="d-flex align-items-center gap-2">
                                <i className="bi bi-arrow-right-square-fill"></i> Reassign this ticket
                            </Dropdown.Toggle>

                            <Dropdown.Menu className="shadow-lg p-2 rounded-lg" style={{ minWidth: '200px' }}>
                                {/* Units Dropdown */}
                                <Dropdown className="mb-2">
                                    <Dropdown.Toggle variant="outline-secondary" id="dropdown-units" className="w-100">
                                        {selectedUnit ? selectedUnit.name : "Select Unit"}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        {units.length > 0 ? (
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

                                {/* Users Dropdown (conditional) */}
                                {selectedUnit && (
                                    <Dropdown>
                                        <Dropdown.Toggle variant="outline-secondary" id="dropdown-users" className="w-100">
                                            Select User
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            {usersInUnit.length > 0 ? (
                                                usersInUnit.map(user => (
                                                    <Dropdown.Item key={user._id} onClick={() => handleUserReassign(user)}>
                                                        {user.name} ({user.email})
                                                    </Dropdown.Item>
                                                ))
                                            ) : (
                                                <Dropdown.Item disabled>No users in this unit</Dropdown.Item>
                                            )}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                )}

                                {/* Option to Unassign */}
                                {ticket.assignedTo && (
                                    <>
                                        <Dropdown.Divider />
                                        <Dropdown.Item onClick={handleUnassign} className="text-danger">
                                            <i className="bi bi-person-x-fill me-2"></i> Unassign
                                        </Dropdown.Item>
                                    </>
                                )}

                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                    {/* --- END NEW WRAPPER --- */}

                    <Card
                        className="shadow-lg border-0 rounded-3xl transition-transform duration-200 hover:scale-[1.01] hover:shadow-2xl"
                        style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)', borderRadius: '1.5rem' }}
                    >
                        <Card.Header className="bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-t-3xl flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <h4 className="mb-0 flex items-center gap-2">
                                <i className="bi bi-chat-left-text-fill mr-2 text-2xl"></i>
                                Reply to:
                                {/* Subject Badge remains here */}
                                <Badge bg="light" text="dark" className="ml-2 px-3 py-2 text-base rounded-xl shadow-sm">
                                    {ticket.subject}
                                </Badge>
                            </h4>
                            <div className="mt-2 md:mt-0 flex items-center gap-2">
                                {/* Assigned Unit Badge */}
                                <Badge bg="secondary" className="text-capitalize px-3 py-2 rounded-xl flex items-center gap-1">
                                    <i className="bi bi-diagram-3 me-1"></i>
                                    {ticket.assignedUnit || '—'}
                                </Badge>
                                {/* Assigned To badge - Positioned in original group, includes "Assigned To:" text */}
                                <Badge bg="info" className="text-capitalize px-3 py-2 rounded-xl flex items-center gap-1">
                                    <i className="bi bi-person me-1"></i>
                                    Assigned To: {ticket.assignedTo && typeof ticket.assignedTo === 'object' && ticket.assignedTo.name
                                        ? ticket.assignedTo.name
                                        : 'Nisu'}
                                </Badge>
                                {/* Status Badge */}
                                <Badge bg={localStatus === 'resolved' ? 'success' : 'info'} className="ml-2 px-3 py-2 rounded-xl animate-pulse">
                                    <i className={`bi ${localStatus === 'resolved' ? 'bi-check-circle-fill' : 'bi-hourglass-split'} mr-1`}></i>
                                    {localStatus.charAt(0).toUpperCase() + localStatus.slice(1)}
                                </Badge>
                            </div>
                        </Card.Header>
                        <Card.Body className="bg-white rounded-b-3xl p-6 md:p-8">
                            {/* Message History */}
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