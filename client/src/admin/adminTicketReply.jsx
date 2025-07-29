// client/src/admin/adminTicketReply.jsx
import React, { useRef, useState, useEffect, useCallback } from "react";
import { Editor } from 'primereact/editor';
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import { useParams } from "react-router-dom";

// Import Bootstrap CSS and Icons
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

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
import { toast } from 'react-toastify';
import { BsArrowRepeat } from "react-icons/bs";

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
            if (quillRef.current && quillRef.current.getEditor()) {
                quillRef.current.getEditor().setText('');
            }

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
                const data = res.data ?? [];
                console.log("Units fetched:", data);
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
        <Container
            className="py-8 flex justify-center items-start animate-fade-in"
            style={{ maxWidth: "1200px", width: '100%' }}
        >
            <Row className="justify-content-center w-full">
                <Col md={12} lg={12} className="w-full">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <Button
                            variant="link"
                            onClick={onBack}
                            className="px-0 text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center gap-2"
                            style={{ fontWeight: 600, fontSize: 18 }}
                        >
                            <i className="bi bi-arrow-left-circle-fill mr-2 text-xl align-middle"></i>
                            Back to Tickets
                        </Button>

                        <Dropdown show={showReassignDropdown} onToggle={handleReassignClick} className="position-relative">
                            <Dropdown.Toggle variant="primary" id="dropdown-reassign" className="d-flex align-items-center gap-2" disabled={loadingUnits}>
                                <i className="bi bi-arrow-right-square-fill"></i> {loadingUnits ? "Loading Units..." : "Reassign this ticket"}
                            </Dropdown.Toggle>

                            <Dropdown.Menu className="shadow-lg p-2 rounded-lg" style={{ minWidth: '200px' }}>
                                <Dropdown className="mb-2">
                                    <Dropdown.Toggle variant="outline-secondary" id="dropdown-units" className="w-100" disabled={loadingUnits}>
                                        {loadingUnits ? "Loading Units..." : (selectedUnit ? selectedUnit.name : "Select Unit")}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        {loadingUnits ? (
                                            <Dropdown.Item disabled>Loading units...</Dropdown.Item>
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
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>

                    <Modal show={showUserModal} onHide={handleUserModalClose} centered>
                        <Modal.Header closeButton>
                            <Modal.Title>Select User in {selectedUnit?.name || 'Unit'}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {loadingUsers ? (
                                <div className="text-center text-primary py-3">
                                    <div className="spinner-border spinner-border-sm me-2" role="status">
                                        <span className="visually-hidden">Loading users...</span>
                                    </div>
                                    Loading users...
                                </div>
                            ) : usersInUnit.length > 0 ? (
                                <Form.Group>
                                    <Form.Label>Choose a user to assign this ticket:</Form.Label>
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
                                </Form.Group>
                            ) : (
                                <div className="text-muted mt-2">No users found in this unit or unit has no assignable users.</div>
                            )}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleUserModalClose} disabled={loadingUsers}>Cancel</Button>
                        </Modal.Footer>
                    </Modal>

                    <Card
                        className="shadow-lg border-0 rounded-3xl transition-transform duration-200 hover:scale-[1.01] hover:shadow-2xl"
                        style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)', borderRadius: '1.5rem' }}
                    >
                        <Card.Header className="bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-t-3xl flex flex-col md:flex-row md:items-center md:justify-between gap-2 p-4">
                            <h4 className="mb-0 flex items-center gap-2">
                                <i className="bi bi-chat-left-text-fill mr-2 text-2xl"></i>
                                Reply to:
                                <Badge bg="light" text="dark" className="ml-2 px-3 py-2 text-base rounded-xl shadow-sm">
                                    {ticketDetails.subject}
                                    {ticketDetails.reassigned && (
                                        <span title="Reassigned" style={{ marginLeft: 6 }}>
                                            <BsArrowRepeat style={{ color: '#0d6efd', verticalAlign: 'middle' }} />
                                        </span>
                                    )}
                                </Badge>
                            </h4>
                            <div className="mt-2 md:mt-0 flex flex-wrap items-center gap-2">
                                <Badge bg="secondary" className="text-capitalize px-3 py-2 rounded-xl flex items-center gap-1">
                                    <i className="bi bi-diagram-3 me-1"></i>
                                    Assigned Unit: {ticketDetails.assignedUnit || '—'}
                                </Badge>
                                <Badge bg="info" className="text-capitalize px-3 py-2 rounded-xl flex items-center gap-1">
                                    <i className="bi bi-person me-1"></i>
                                    Assigned To: {ticketDetails.assignedTo && typeof ticketDetails.assignedTo === 'object' && ticketDetails.assignedTo.name
                                        ? ticketDetails.assignedTo.name
                                        : 'N/A'}
                                </Badge>
                                {ticketDetails.reassigned && (
                                    <>
                                        <Badge bg="secondary" className="text-capitalize px-3 py-2 rounded-xl flex items-center gap-1">
                                            <BsArrowRepeat className="me-1" />
                                            Reassigned Unit: {ticketDetails.previousAssignedUnit || '—'}
                                        </Badge>
                                        <Badge bg="info" className="text-capitalize px-3 py-2 rounded-xl flex items-center gap-1">
                                            <BsArrowRepeat className="me-1" />
                                            Reassigned To: {ticketDetails.previousAssignedTo && typeof ticketDetails.previousAssignedTo === 'object' && ticketDetails.previousAssignedTo.name
                                                ? ticketDetails.previousAssignedTo.name
                                                : '—'}
                                        </Badge>
                                    </>
                                )}
                                <Badge bg={getStatusBadgeVariant(localStatus)} className="ml-2 px-3 py-2 rounded-xl animate-pulse">
                                    <i className={`bi ${localStatus === 'resolved' ? 'bi-check-circle-fill' : 'bi-hourglass-split'} mr-1`}></i>
                                    {localStatus.charAt(0).toUpperCase() + localStatus.slice(1)}
                                </Badge>
                            </div>
                        </Card.Header>
                        <Card.Body className="bg-white rounded-b-3xl p-6 md:p-8">
                            <div className="mb-8">
                                <MessageHistory
                                    msg={messagesForHistory}
                                    description={ticketDetails.description}
                                    image={ticketDetails.image}
                                    onDeleteMessage={handleDeleteMessage}
                                    currentUserRole="admin"
                                />
                            </div>

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
