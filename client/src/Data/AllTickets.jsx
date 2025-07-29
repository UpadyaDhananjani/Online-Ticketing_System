// client/src/Data/AllTickets.jsx
// (All Tickets)
import React, { useEffect, useState } from "react";
import {
    Table,
    Container,
    Spinner,
    Alert,
    Badge,
    Form,
    Row,
    Col,
    Button,
} from "react-bootstrap";
import { getAdminTickets, deleteAdminTicket } from "../api/ticketApi";
import { toast } from "react-toastify";
import { BsArrowRepeat } from "react-icons/bs";
import { useNavigate } from "react-router-dom";

const statusColors = {
    open: "success",
    closed: "danger",
    resolved: "primary",
    reopened: "warning",
    "in progress": "info",
};

const UNIT_OPTIONS = [
    "System and Network Administration",
    "Asyhub Unit",
    "Statistics Unit",
    "Audit Unit",
    "Helpdesk Unit",
    "Functional Unit",
];

const STATUS_OPTIONS = [
    "All", // For display in dropdown
    "open",
    "in progress",
    "closed",
    "resolved",
    "reopened",
];

const TYPE_OPTIONS = [
    "All",
    "incident",
    "bug",
    "maintenance",
    "request",
    "service",
];

// Added displayStatusFilter prop for the dropdown and header text
function AllTickets({ onSelect, refresh, initialStatusFilter = "all", displayStatusFilter = "All" }) {
    // Debugging: Log prop on component render/update
    useEffect(() => {
        console.log("AllTickets: Component rendered. initialStatusFilter prop received (for logic):", initialStatusFilter);
        console.log("AllTickets: displayStatusFilter prop received (for UI):", displayStatusFilter);
        console.log("AllTickets: Type of onSelect prop:", typeof onSelect);
        if (typeof onSelect !== 'function') {
            console.error("AllTickets: onSelect prop is NOT a function! Current value:", onSelect);
        }
    }, [initialStatusFilter, displayStatusFilter, onSelect]); // Depend on all relevant props

    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [unitFilter, setUnitFilter] = useState("All");

    // statusFilter state for the dropdown, initialized with the display prop
    const [statusFilter, setStatusFilter] = useState(displayStatusFilter);

    const [typeFilter, setTypeFilter] = useState("All");
    const [selectedTickets, setSelectedTickets] = useState(new Set());
    const navigate = useNavigate();

    // Debugging: Log state changes
    useEffect(() => {
        console.log("AllTickets: statusFilter UI state updated to:", statusFilter);
    }, [statusFilter]);


    // Effect to synchronize internal state with prop and fetch data
    useEffect(() => {
        // When initialStatusFilter (from URL) changes, update the UI's statusFilter state
        if (displayStatusFilter && statusFilter !== displayStatusFilter) {
            console.log(`AllTickets: Syncing UI statusFilter state from prop: '${displayStatusFilter}'`);
            setStatusFilter(displayStatusFilter);
        }

        console.log("AllTickets: Fetching tickets due to refresh or initialStatusFilter change.");
        setSelectedTickets(new Set()); // Clear selections when fetching new data

        setLoading(true);
        setError("");
        getAdminTickets()
            .then((response) => {
                const fetchedTickets = response.data ?? [];
                console.log("AllTickets: Raw fetched tickets from API:", fetchedTickets);
                setTickets(fetchedTickets);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching tickets:", err);
                setError("Failed to fetch tickets.");
                toast.error(
                    err.response?.data?.error ||
                    err.message ||
                    "Failed to fetch tickets for admin dashboard."
                );
                setLoading(false);
            });
    }, [refresh, initialStatusFilter, displayStatusFilter]); // Depend on refresh and both status props


    // The filtering logic itself
    // This will re-run whenever `tickets`, `unitFilter`, `statusFilter`, or `typeFilter` changes
    const filteredTickets = tickets.filter((ticket) => {
        // Normalize the filter value received from initialStatusFilter prop (which is always lowercase 'all' or actual status)
        const currentFilterValueForLogic = initialStatusFilter.toLowerCase().replace('-', ' ');
        const ticketStatusLower = ticket.status.toLowerCase();

        console.log(`--- Filtering Ticket ID: ${ticket._id}, Subject: ${ticket.subject} ---`);
        console.log(`  Ticket Status (normalized): '${ticketStatusLower}'`);
        console.log(`  Current Filter Value (for logic): '${currentFilterValueForLogic}'`);

        const unitMatch =
            unitFilter === "All" || ticket.assignedUnit === unitFilter;
        
        let statusMatch;
        // CRITICAL FIX: Explicitly check if the filter value for logic is "all"
        if (currentFilterValueForLogic === "all") {
            statusMatch = true; // If the filter is "all", match all statuses
            console.log("  Status filter is 'all' (logic), matching ALL tickets.");
        } else {
            statusMatch = ticketStatusLower === currentFilterValueForLogic;
            console.log(`  Status filter is '${currentFilterValueForLogic}', comparing to ticket status '${ticketStatusLower}'. Match: ${statusMatch}`);
        }
        
        const typeMatch = typeFilter === "All" || ticket.type === typeFilter;

        console.log(`  Final Matches for Ticket ID ${ticket._id}: unit=${unitMatch}, status=${statusMatch}, type=${typeMatch}`);
        return unitMatch && statusMatch && typeMatch;
    });

    // Debugging: Log filtered tickets after filtering
    useEffect(() => {
        console.log("AllTickets: Filtered tickets array updated. Count:", filteredTickets.length);
        console.log("AllTickets: Current filtered tickets:", filteredTickets);
    }, [filteredTickets]);


    const handleDelete = async (ticketId) => {
        if (
            !window.confirm(
                "Are you sure you want to delete this ticket? This action cannot be undone."
            )
        )
            return;
        try {
            await deleteAdminTicket(ticketId);
            setTickets((tickets) => tickets.filter((t) => t._id !== ticketId));
            setSelectedTickets((prev) => {
                const newSet = new Set(prev);
                newSet.delete(ticketId);
                return newSet;
            });
            toast.success("Ticket deleted successfully!");
        } catch (err) {
            toast.error(
                "Failed to delete ticket: " +
                (err.response?.data?.message || err.message)
            );
        }
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedTickets(new Set(filteredTickets.map((ticket) => ticket._id)));
        } else {
            setSelectedTickets(new Set());
        }
    };

    const handleSelectTicket = (ticketId, checked) => {
        setSelectedTickets((prev) => {
            const newSet = new Set(prev);
            if (checked) {
                newSet.add(ticketId);
            } else {
                newSet.delete(ticketId);
            }
            return newSet;
        });
    };

    const handleDeleteSelected = async () => {
        if (selectedTickets.size === 0) {
            toast.warning("Please select tickets to delete.");
            return;
        }

        const confirmMessage = `Are you sure you want to delete ${selectedTickets.size} selected ticket(s)? This action cannot be undone.`;
        if (!window.confirm(confirmMessage)) return;

        try {
            const deletePromises = Array.from(selectedTickets).map((ticketId) =>
                deleteAdminTicket(ticketId)
            );
            await Promise.all(deletePromises);
            setTickets((tickets) =>
                tickets.filter((t) => !selectedTickets.has(t._id))
            );
            setSelectedTickets(new Set());
            toast.success(`Successfully deleted ${selectedTickets.size} ticket(s).`);
        } catch (err) {
            toast.error(
                "Failed to delete some tickets: " +
                (err.response?.data?.message || err.message)
            );
        }
    };

    const isAllSelected =
        filteredTickets.length > 0 &&
        selectedTickets.size === filteredTickets.length;
    const isIndeterminate =
        selectedTickets.size > 0 &&
        selectedTickets.size < filteredTickets.length;

    return (
        <Container className="mt-4">
            <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                <h2 className="mb-4 text-primary">
                    <i className="bi bi-list-ul me-2"></i>
                    {/* Use displayStatusFilter for the header text */}
                    {displayStatusFilter === "All"
                        ? "All Tickets"
                        : `${displayStatusFilter.charAt(0).toUpperCase() + displayStatusFilter.slice(1)} Tickets`}
                </h2>

                {selectedTickets.size > 0 && (
                    <Row className="mb-3">
                        <Col>
                            <Alert variant="info" className="d-flex align-items-center justify-content-between">
                                <span>
                                    <i className="bi bi-check-circle me-2"></i>
                                    {selectedTickets.size} ticket(s) selected
                                </span>
                                <Button variant="danger" size="sm" onClick={handleDeleteSelected}>
                                    <i className="bi bi-trash me-1"></i>
                                    Delete Selected ({selectedTickets.size})
                                </Button>
                            </Alert>
                        </Col>
                    </Row>
                )}

                <Row className="mb-3">
                    <Col xs={12} md={4} lg={3}>
                        <Form.Select
                            value={unitFilter}
                            onChange={(e) => setUnitFilter(e.target.value)}
                            className="mb-2"
                        >
                            <option value="All">All Units</option>
                            {UNIT_OPTIONS.map((unit) => (
                                <option key={unit} value={unit}>
                                    {unit}
                                </option>
                            ))}
                        </Form.Select>
                    </Col>
                    <Col xs={12} md={4} lg={3}>
                        <Form.Select
                            value={displayStatusFilter} // Use displayStatusFilter for the dropdown value
                            onChange={(e) => setStatusFilter(e.target.value)} // Update internal state for filtering
                            className="mb-2"
                        >
                            {STATUS_OPTIONS.map((status) => (
                                <option key={status} value={status}>
                                    {status === "All"
                                        ? "All Statuses"
                                        : status.charAt(0).toUpperCase() + status.slice(1)}
                                </option>
                            ))}
                        </Form.Select>
                    </Col>
                    <Col xs={12} md={4} lg={3}>
                        <Form.Select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="mb-2"
                        >
                            {TYPE_OPTIONS.map((type) => (
                                <option key={type} value={type}>
                                    {type === "All"
                                        ? "All Types"
                                        : type.charAt(0).toUpperCase() + type.slice(1)}
                                </option>
                            ))}
                        </Form.Select>
                    </Col>
                </Row>

                {loading && <Spinner animation="border" />}
                {error && <Alert variant="danger">{error}</Alert>}

                {!loading && !error && (
                    <Table striped bordered hover responsive className="shadow-sm rounded" style={{ width: '100%' }}>
                        <thead style={{ background: "#f5f6fa" }}>
                            <tr>
                                <th>
                                    <Form.Check
                                        type="checkbox"
                                        checked={isAllSelected}
                                        ref={(input) => {
                                            if (input) input.indeterminate = isIndeterminate;
                                        }}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                    />
                                </th>
                                <th>Subject</th>
                                <th>Type</th>
                                <th>Assigned Unit</th>
                                <th>Requester</th>
                                <th>Assigned To</th>
                                <th>Reassigned Unit</th>
                                <th>Reassigned To</th>
                                <th style={{ minWidth: 130, width: 150 }}><i className="bi bi-info-circle me-1"></i>Status</th>
                                <th>Last Update</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTickets.map((ticket) => (
                                <tr
                                    key={ticket._id}
                                    style={{
                                        background: ticket.status === "open" ? "#e6ffe6" : undefined,
                                        cursor: "pointer",
                                    }}
                                    onClick={() => navigate(`/admin/tickets/${ticket._id}/reply`)}
                                    onMouseOver={(e) => (e.currentTarget.style.background = "#f0f4ff")}
                                    onMouseOut={(e) =>
                                        (e.currentTarget.style.background =
                                            ticket.status === "open" ? "#e6ffe6" : "")
                                    }
                                >
                                    <td onClick={(e) => e.stopPropagation()}>
                                        <Form.Check
                                            type="checkbox"
                                            checked={selectedTickets.has(ticket._id)}
                                            onChange={(e) =>
                                                handleSelectTicket(ticket._id, e.target.checked)
                                            }
                                        />
                                    </td>
                                    <td>{ticket.subject}</td>
                                    <td>
                                        <Badge bg="info" text="dark" className="text-capitalize">
                                            {ticket.type}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Badge bg="secondary" className="text-capitalize">
                                            {ticket.assignedUnit || "—"}
                                        </Badge>
                                    </td>
                                    <td>{ticket.user?.name || "N/A"}</td>
                                    <td>
                                        <Badge bg="info" className="text-capitalize">
                                            {ticket.assignedTo?.name || "—"}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Badge bg="secondary" className="text-capitalize">
                                            {ticket.reassigned ? (ticket.previousAssignedUnit || "—") : "—"}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Badge bg="info" className="text-capitalize">
                                            {ticket.reassigned ? (ticket.previousAssignedTo?.name || "—") : "—"}
                                        </Badge>
                                    </td>
                                    <td style={{ verticalAlign: 'middle' }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                            <Badge
                                                bg={statusColors[ticket.status] || "secondary"}
                                                className="px-3 py-2 text-capitalize"
                                            >
                                                {ticket.status}
                                            </Badge>
                                        </span>
                                    </td>
                                    <td>
                                        {ticket.updatedAt
                                            ? new Date(ticket.updatedAt).toLocaleString()
                                            : "N/A"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </div>
        </Container>
    );
}

export default AllTickets;
