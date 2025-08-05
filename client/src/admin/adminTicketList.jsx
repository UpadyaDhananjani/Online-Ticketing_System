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
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

// Helper object for priority styling
const priorityStyles = {
  Critical: { className: "bg-danger", color: "white" }, // Red
  High: { className: "bg-warning", color: "black" },   // Yellow
  Medium: { className: "bg-info", color: "black" },     // Blue
  Low: { className: "bg-success", color: "white" },    // Green
};

// Helper object for status styling
const statusStyles = {
  open: { className: "bg-danger", color: "white" },
  'in progress': { className: "bg-warning", color: "black" },
  resolved: { className: "bg-success", color: "white" },
  closed: { className: "bg-secondary", color: "white" },
  reopened: { className: "bg-info", color: "black" },
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
  "All",
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

function TicketList({ refresh }) { // Removed 'onSelect' and 'token' as props
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unitFilter, setUnitFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedTickets, setSelectedTickets] = useState(new Set());

  const navigate = useNavigate(); // Initialize useNavigate hook

  useEffect(() => {
    setLoading(true);
    setError("");
    getAdminTickets()
      .then((res) => {
        const fetchedTickets = res.data ?? [];
        setTickets(fetchedTickets);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching tickets:", err);
        setError("Failed to fetch tickets.");
        toast.error(
          err.response?.data?.message ||
            err.message ||
            "Failed to fetch tickets for admin dashboard."
        );
        setLoading(false);
      });
  }, [refresh]);

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

  const filteredTickets = tickets.filter((ticket) => {
    const unitMatch =
      unitFilter === "All" || ticket.assignedUnit === unitFilter;
    const statusMatch =
      statusFilter === "All" || ticket.status === statusFilter;
    const typeMatch = typeFilter === "All" || ticket.type === typeFilter;
    return unitMatch && statusMatch && typeMatch;
  });

  const isAllSelected =
    filteredTickets.length > 0 &&
    selectedTickets.size === filteredTickets.length;
  const isIndeterminate =
    selectedTickets.size > 0 &&
    selectedTickets.size < filteredTickets.length;

  return (
    <Container className="mt-4">
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <h2 className="mb-4 text-primary">
          <i className="bi bi-list-ul me-2"></i>All Tickets
        </h2>

        {selectedTickets.size > 0 && (
          <Row className="mb-3">
            <Col>
              <Alert
                variant="info"
                className="d-flex align-items-center justify-content-between"
              >
                <span>
                  <i className="bi bi-check-circle me-2"></i>
                  {selectedTickets.size} ticket(s) selected
                </span>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleDeleteSelected}
                >
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
          <>
            <Table
              hover
              className="bg-white rounded shadow-sm table"
              style={{ borderCollapse: "separate", borderSpacing: 0 }}
            >
              <thead>
                <tr>
                  <th className="px-4 py-3">TICKET ID</th>
                  <th className="px-4 py-3">SUBJECT</th>
                  <th className="px-4 py-3">USER</th>
                  <th className="px-4 py-3">CATEGORY</th>
                  <th className="px-4 py-3">PRIORITY</th>
                  <th className="px-4 py-3">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr
                    key={ticket._id}
                    onClick={() => navigate(`/admin/tickets/${ticket._id}`)}
                    style={{ cursor: "pointer" }}
                    className="border-bottom"
                  >
                    <td className="px-4 py-3 text-secondary">
                      {`ICT-${String(ticket._id).slice(-4).padStart(3, "0")}`}
                    </td>
                    <td className="px-4 py-3">{ticket.subject}</td>
                    <td className="px-4 py-3">{ticket.user?.name || "N/A"}</td>
                    <td className="px-4 py-3">{ticket.type}</td>
                    <td className="px-4 py-3">
                      <Badge
                        bg={priorityStyles[ticket.priority]?.className}
                        style={{ color: priorityStyles[ticket.priority]?.color }}
                      >
                        {ticket.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        bg={statusStyles[ticket.status]?.className}
                        style={{ color: statusStyles[ticket.status]?.color }}
                      >
                        {ticket.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}
      </div>
    </Container>
  );
}

export default TicketList;