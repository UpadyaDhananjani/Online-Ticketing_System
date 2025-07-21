// client/src/components/admin/adminTicketReply.jsx
import React, { useRef, useState, useEffect } from "react";
import { Editor } from 'primereact/editor';
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import axios from "axios"; // axios is not directly used here but might be in other parts of your project.

import {
    sendTicketReply,
    resolveTicket,
    deleteAdminMessage,
    getAdminTicketById,
    getPublicUnits,
    getAdminUsersByUnit,
    reassignTicket
} from "../api/ticketApi"; // Corrected path based on your file structure

import { Container, Card, Button, Form, Row, Col, Badge, Dropdown } from "react-bootstrap";
import MessageHistory from "../components/MessageHistory/MessageHistory"; // Corrected path
import { toast } from 'react-toastify';

function TicketReply({ token, ticket, onBack, onStatusChange, onTicketUpdate }) {
    // IMPORTANT: Add a guard clause here if ticket might be null/undefined initially
    if (!ticket) {
        console.warn("TicketReply component received null or undefined ticket prop. Displaying loading state.");
        return <Container className="text-center py-5">Loading ticket details...</Container>;
    }

    const [reply, setReply] = useState("");
    const [imageFiles, setImageFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [localStatus, setLocalStatus] = useState(ticket.status);
    const [messages, setMessages] = useState(ticket.messages || []); // Ensures messages is always an array
    const quillRef = useRef();

    // --- STATE FOR REASSIGN FEATURE ---
    const [showReassignDropdown, setShowReassignDropdown] = useState(false);
    const [units, setUnits] = useState([]);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [usersInUnit, setUsersInUnit] = useState([]);
    // ------------------------------------

    useEffect(() => {
        // This effect ensures messages and status are updated if the parent's ticket prop changes
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
            setMessages(prev => prev.filter(m => m._id !== tempId));
            console.error("Failed to send reply:", err);
            toast.error(err.response?.data?.message || "Failed to send reply.");
        }
        setUploading(false);
    };

    const handleResolve = async () => {
        setLocalStatus("resolved");
        try {
            await resolveTicket(ticket._id, token);
            if (onStatusChange) onStatusChange("resolved");
            await fetchTicket();
            onBack();
            toast.success("Ticket resolved successfully!");
        } catch (err) {
            setLocalStatus(ticket.status);
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

    // --- HANDLERS FOR REASSIGN FEATURE ---
    const handleReassignClick = async (nextShow, meta) => {
        console.log("handleReassignClick triggered. nextShow:", nextShow, "meta:", meta);
        if (nextShow && !showReassignDropdown) { // Only fetch units if the dropdown is about to open and wasn't already open
            console.log("Fetching units...");
            try {
                const data = await getPublicUnits(); // getPublicUnits returns data directly (array of { _id, name })
                console.log("Units fetched:", data);
                setUnits(data); // Set the units state
                setUsersInUnit([]); // Clear previous users
                setSelectedUnit(null); // Clear selected unit
            } catch (error) {
                console.error("Error fetching units:", error);
                toast.error("Failed to load units for reassign.");
            }
        }
        setShowReassignDropdown(nextShow);
    };

    const handleUnitSelect = async (unit) => {
        setSelectedUnit(unit);
        console.log("[Frontend] handleUnitSelect: Unit selected for lookup:", unit);
        console.log("[Frontend] handleUnitSelect: Sending unit.name to API:", unit.name);
        try {
            // Use getAdminUsersByUnit for admin
            const { users } = await getAdminUsersByUnit(unit.name); // Destructure 'users' from the response
            console.log("[Frontend] handleUnitSelect: API response for users in unit:", users);
            setUsersInUnit(users || []); // Ensure it's always an array
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
            // user._id here is the MongoDB ObjectId of the user, which is correct for assignedTo
            const res = await reassignTicket(ticket._id, user._id, token);
            toast.success(res.message);
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
            const res = await reassignTicket(ticket._id, null, token); // Pass null to unassign
            toast.success(res.message);
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
                        {/* Ensure onToggle receives the new 'show' state */}
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

                    {/* Users Dropdown: OUTSIDE the Dropdown.Menu */}
                    {selectedUnit && (
                        <Form.Group className="mb-3 mt-2">
                            <Form.Label>Select User</Form.Label>
                            <Form.Select
                                value={""}
                                onChange={e => {
                                    const user = usersInUnit.find(u => u._id === e.target.value);
                                    if (user) handleUserReassign(user);
                                }}
                            >
                                <option value="">Select a user</option>
                                {usersInUnit.map(user => (
                                    <option key={user._id} value={user._id}>
                                        {user.name} ({user.email})
                                    </option>
                                ))}
                            </Form.Select>
                            {usersInUnit.length === 0 && (
                                <div className="text-muted mt-2">No users in this unit</div>
                            )}
                        </Form.Group>
                    )}

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
                                        : 'N/A'}
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