// src/components/Home2.jsx
import React, { useEffect, useState, useContext } from "react";
import { Container, Row, Col, Spinner, Alert, Card, Badge, Button } from "react-bootstrap";
import { Link } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import axios from 'axios'; // Import axios for consistent API calls
import {
    BsCardText, BsTag, BsDiagram3, BsInfoCircle, BsCalendar,
    BsPeopleFill, BsCpuFill, BsBarChartFill, BsClipboardCheck,
    BsGearFill, BsHeadset, BsCheck2Circle // Added BsCheck2Circle for the resolved icon
} from "react-icons/bs";
import UnitUsersModal from "../admin/UnitUsersModal.jsx";
// Removed: import DarkModeToggle from "./DarkModeToggle.jsx";


const Home2 = () => {
    // Access global state from AppContext
    const { userData, backendUrl } = useContext(AppContent);

    // State for dashboard data
    const [ticketCounts, setTicketCounts] = useState({
        open: 0,
        inProgress: 0,
        resolved: 0,
    });
    const [recentIssues, setRecentIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // State for UnitUsersModal
    const [showUnitModal, setShowUnitModal] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState("");

    // Object to map ticket statuses to Tailwind/custom CSS classes/variables for text color
    const statusColors = {
        open: "status-open-text",        // Assumed to be a CSS variable color or a Tailwind class
        closed: "text-red-600",
        resolved: "status-resolved-text",  // Assumed to be a CSS variable color
        reopened: "text-yellow-600",
        "in progress": "status-inprogress-text", // Assumed to be a CSS variable color
    };

    /**
     * Fetches dashboard summary data and recent issues from the backend.
     * Uses axios for API calls for consistency and better error handling.
     */
    useEffect(() => {
        const fetchDashboardData = async () => {
            // If no user data, reset counts and stop loading
            if (!userData) {
                setLoading(false);
                setTicketCounts({ open: 0, inProgress: 0, resolved: 0 });
                setRecentIssues([]);
                return;
            }

            setLoading(true);
            setError(""); // Clear previous errors
            try {
                // Fetch ticket summary
                const summaryRes = await axios.get(`${backendUrl}/api/tickets/summary`, { withCredentials: true });
                setTicketCounts({
                    open: summaryRes.data.open || 0,
                    inProgress: summaryRes.data.inProgress || 0,
                    resolved: summaryRes.data.resolved || 0,
                });

                // Fetch recent issues
                const recentIssuesRes = await axios.get(`${backendUrl}/api/tickets?limit=5&sortBy=createdAt&sortOrder=desc`, { withCredentials: true });
                setRecentIssues(recentIssuesRes.data);

            } catch (err) {
                console.error("Dashboard data fetch error:", err);
                // More robust error message extraction for axios errors
                setError(err.response?.data?.message || err.message || "An unexpected error occurred while fetching dashboard data.");
            } finally {
                setLoading(false); // End loading regardless of success or failure
            }
        };

        // Fetch data on component mount/userData change
        fetchDashboardData();

        // Set up polling for data updates if user is logged in
        const intervalId = userData ? setInterval(fetchDashboardData, 30000) : null; // Poll every 30 seconds

        // Cleanup function for the interval
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [userData, backendUrl]); // Re-run effect if userData or backendUrl changes

    // --- Conditional Rendering for Loading, Error, and Not Logged In States ---

    if (loading && userData) {
        return (
            <div className="bg-background-color min-h-screen p-6 flex flex-col items-center justify-center">
                {/* Removed: <DarkModeToggle /> */}
                <Spinner animation="border" variant="primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-3 text-text-muted-color">Loading dashboard data...</p>
            </div>
        );
    }

    if (error && userData) {
        return (
            <Container className="py-5">
                <Alert variant="danger" className="text-center">
                    <p className="font-bold">Error:</p>
                    <p>{error}</p>
                    <Button variant="outline-danger" onClick={() => window.location.reload()}>
                        Retry
                    </Button>
                </Alert>
            </Container>
        );
    }

    if (!userData) {
        return (
            <Container className="py-5">
                <Alert variant="info" className="text-center">
                    Please log in to view the dashboard.
                    <div className="mt-3">
                        <Link to="/login" className="btn btn-primary">Go to Login</Link>
                    </div>
                </Alert>
            </Container>
        );
    }

    // --- Main Component Render (after loading and error checks) ---
    return (
        <>
            {/* Removed: <DarkModeToggle /> */}
            {/* Hero Section - Fixed Blue Gradient */}
            <div className="w-full bg-gradient-to-r from-blue-700 to-blue-400 py-5 px-2 mb-5 min-h-[340px] relative">
                <Container fluid className="px-0">
                    <Row className="align-items-center justify-content-between mb-4">
                        <Col xs="auto" className="d-flex align-items-center gap-3">
                            <div className="d-flex align-items-center">
                                {/* Icon circle - fixed white background, fixed primary blue icon */}
                                <span className="bg-white rounded-full flex items-center justify-center mr-3 w-11 h-11">
                                    <i className="bi bi-bank2 text-blue-700 text-2xl"></i> {/* Assuming Bootstrap Icons are globally available or imported */}
                                </span>
                                <div>
                                    <h3 className="mb-0 font-bold text-white tracking-wide">ICT Helpdesk</h3>
                                    <div className="text-white text-opacity-75 text-sm">Sri Lanka Customs Headquarters</div>
                                </div>
                            </div>
                        </Col>
                        <Col xs="auto" className="d-flex align-items-center gap-4">
                            {/* Using Link for internal navigation for consistency */}
                            {/* Note: If these are section anchors, they should probably be <a> tags with href="#id" */}
                            <Link to="#services" className="text-white font-medium hover:underline mr-3 text-lg">Services</Link>
                            <Link to="#contact" className="text-white font-medium hover:underline mr-3 text-lg">Contact</Link>
                            <Link to="/login" className="btn bg-white text-blue-700 font-bold px-4 py-2 text-lg rounded-lg hover:bg-gray-200 hover:text-blue-800 transition-colors duration-200"> Login</Link>
                        </Col>
                    </Row>
                    <Row className="justify-content-center text-center mt-4">
                        <Col md={10} lg={8}>
                            <h1 className="text-4xl font-bold text-white mb-3 tracking-wide">Welcome to ICT Support Services</h1>
                            <p className="text-lg text-white text-opacity-75 mb-4">
                                Get technical assistance for all your IT needs. Submit tickets, track progress, and access resources 24/7.
                            </p>
                            <div className="d-flex flex-wrap justify-content-center gap-3 mt-2">
                                <Link to="/create-ticket" className="btn bg-white text-blue-700 font-bold px-4 py-2 text-lg rounded-lg hover:bg-gray-200 hover:text-blue-800 transition-colors duration-200">Submit New Ticket</Link>
                                <Link to="/tickets" className="btn border-white text-white font-bold px-4 py-2 text-lg rounded-lg hover:bg-white hover:text-blue-700 transition-colors duration-200">Track Ticket Status</Link>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Main Dashboard Content - These sections still use theme variables */}
            <Container className="py-4">
                <div className="text-center mb-4">
                    <h2 className="font-bold mb-1 text-heading-color text-3xl">Current Ticket Status</h2>
                    <div className="text-text-muted-color text-lg">Real-time overview of helpdesk tickets</div>
                </div>
                <Row className="justify-content-center g-4 mb-5">
                    {/* Open Issues Card - Apply themed styles */}
                    <Col xs={12} md={4}>
                        <div className="h-full p-4 flex flex-row items-center justify-between rounded-xl shadow-sm transition-colors duration-300"
                             style={{ background: 'var(--status-open-bg)', borderLeft: '6px solid var(--status-open-border)', minHeight: 140 }}>
                            <div>
                                <div className="font-bold text-4xl leading-none" style={{color: 'var(--status-open-text)'}}>{ticketCounts.open}</div>
                                <div className="font-bold text-xl text-text-color">Open Issues</div>
                                <div className="text-text-muted-color text-base">Awaiting assignment</div>
                            </div>
                            <span className="inline-block ml-3 w-10 h-10 rounded-full" style={{ background: 'radial-gradient(circle at 30% 30%, var(--status-open-border) 60%, var(--status-open-text) 100%)', boxShadow: '0 2px 8px rgba(249, 113, 113, 0.15)' }}></span>
                        </div>
                    </Col>
                    {/* In Progress Issues Card - Apply themed styles */}
                    <Col xs={12} md={4}>
                        <div className="h-full p-4 flex flex-row items-center justify-between rounded-xl shadow-sm transition-colors duration-300"
                             style={{ background: 'var(--status-inprogress-bg)', borderLeft: '6px solid var(--status-inprogress-border)', minHeight: 140 }}>
                            <div>
                                <div className="font-bold text-4xl leading-none" style={{color: 'var(--status-inprogress-text)'}}>{ticketCounts.inProgress}</div>
                                <div className="font-bold text-xl text-text-color">In Progress Issues</div>
                                <div className="text-text-muted-color text-base">Being worked on</div>
                            </div>
                            <span className="inline-block ml-3 w-10 h-10 rounded-full" style={{ background: 'radial-gradient(circle at 30% 30%, var(--status-inprogress-border) 60%, var(--status-inprogress-text) 100%)', boxShadow: '0 2px 8px rgba(251, 191, 36, 0.13)' }}></span>
                        </div>
                    </Col>
                    {/* Resolved Issues Card - Apply themed styles */}
                    <Col xs={12} md={4}>
                        <div className="h-full p-4 flex flex-row items-center justify-between rounded-xl shadow-sm transition-colors duration-300"
                             style={{ background: 'var(--status-resolved-bg)', borderLeft: '6px solid var(--status-resolved-border)', minHeight: 140 }}>
                            <div>
                                <div className="font-bold text-4xl leading-none" style={{color: 'var(--status-resolved-text)'}}>{ticketCounts.resolved}</div>
                                <div className="font-bold text-xl text-text-color">Resolved Issues</div>
                                <div className="text-text-muted-color text-base">This month</div>
                            </div>
                            {/* Changed to BsCheck2Circle as it's a specific icon */}
                            <span className="inline-flex items-center justify-center ml-3 w-10 h-10 rounded-full" style={{ background: 'linear-gradient(135deg, var(--status-resolved-border) 60%, var(--status-resolved-text) 100%)', boxShadow: '0 2px 8px rgba(34, 197, 94, 0.13)' }}>
                                <BsCheck2Circle size={28} color="var(--status-resolved-text)" />
                            </span>
                        </div>
                    </Col>
                </Row>

                {/* ICT Directorate Units Section */}
                <div className="text-center mb-4 mt-5">
                    <h2 className="font-bold mb-1 text-heading-color text-3xl">ICT Directorate Units</h2>
                    <div className="text-text-muted-color text-base">Key units supporting ICT operations</div>
                </div>
                <Row className="g-4 justify-content-center mb-5">
                    <Col xs={12} sm={6} md={4} lg={4}>
                        <Card className="h-full shadow-sm border-0 rounded-xl transition-all duration-200 hover:scale-[1.03] hover:shadow-lg bg-card-background text-text-color" style={{ cursor: 'pointer' }} onClick={() => { setSelectedUnit("Asyhub Unit"); setShowUnitModal(true); }}>
                            <Card.Body className="flex flex-col items-center justify-center p-4">
                                <BsPeopleFill size={38} className="mb-3 text-primary-color" />
                                <Card.Title className="font-bold mb-2 text-text-color text-xl">Asyhub Unit</Card.Title>
                                <Card.Text className="text-text-muted-color text-center">Handles Asyhub platform operations and integration.</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={12} sm={6} md={4} lg={4}>
                        <Card className="h-full shadow-sm border-0 rounded-xl transition-all duration-200 hover:scale-[1.03] hover:shadow-lg bg-card-background text-text-color" style={{ cursor: 'pointer' }} onClick={() => { setSelectedUnit("System & Network Administration Unit"); setShowUnitModal(true); }}>
                            <Card.Body className="flex flex-col items-center justify-center p-4">
                                <BsCpuFill size={38} className="mb-3 text-info" />
                                <Card.Title className="font-bold mb-2 text-text-color text-xl">System & Network Administration Unit</Card.Title>
                                <Card.Text className="text-text-muted-color text-center">Manages servers, networks, and IT infrastructure.</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={12} sm={6} md={4} lg={4}>
                        <Card className="h-full shadow-sm border-0 rounded-xl transition-all duration-200 hover:scale-[1.03] hover:shadow-lg bg-card-background text-text-color" style={{ cursor: 'pointer' }} onClick={() => { setSelectedUnit("Statistics Unit"); setShowUnitModal(true); }}>
                            <Card.Body className="flex flex-col items-center justify-center p-4">
                                <BsBarChartFill size={38} className="mb-3 text-success" />
                                <Card.Title className="font-bold mb-2 text-text-color text-xl">Statistics Unit</Card.Title>
                                <Card.Text className="text-text-muted-color text-center">Oversees data analysis and reporting for ICT.</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={12} sm={6} md={4} lg={4}>
                        <Card className="h-full shadow-sm border-0 rounded-xl transition-all duration-200 hover:scale-[1.03] hover:shadow-lg bg-card-background text-text-color" style={{ cursor: 'pointer' }} onClick={() => { setSelectedUnit("Audit Unit"); setShowUnitModal(true); }}>
                            <Card.Body className="flex flex-col items-center justify-center p-4">
                                <BsClipboardCheck size={38} className="mb-3 text-warning" />
                                <Card.Title className="font-bold mb-2 text-text-color text-xl">Audit Unit</Card.Title>
                                <Card.Text className="text-text-muted-color text-center">Ensures compliance and conducts ICT audits.</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={12} sm={6} md={4} lg={4}>
                        <Card className="h-full shadow-sm border-0 rounded-xl transition-all duration-200 hover:scale-[1.03] hover:shadow-lg bg-card-background text-text-color" style={{ cursor: 'pointer' }} onClick={() => { setSelectedUnit("Functional Unit"); setShowUnitModal(true); }}>
                            <Card.Body className="flex flex-col items-center justify-center p-4">
                                <BsGearFill size={38} className="mb-3 text-secondary" />
                                <Card.Title className="font-bold mb-2 text-text-color text-xl">Functional Unit</Card.Title>
                                <Card.Text className="text-text-muted-color text-center">Supports business applications and user needs.</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={12} sm={6} md={4} lg={4}>
                        <Card className="h-full shadow-sm border-0 rounded-xl transition-all duration-200 hover:scale-[1.03] hover:shadow-lg bg-card-background text-text-color" style={{ cursor: 'pointer' }} onClick={() => { setSelectedUnit("Helpdesk Unit"); setShowUnitModal(true); }}>
                            <Card.Body className="flex flex-col items-center justify-center p-4">
                                <BsHeadset size={38} className="mb-3 text-danger" />
                                <Card.Title className="font-bold mb-2 text-text-color text-xl">Helpdesk Unit</Card.Title>
                                <Card.Text className="text-text-muted-color text-center">Provides frontline IT support and assistance.</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                {/* UnitUsersModal is placed here to be rendered when needed */}
                <UnitUsersModal show={showUnitModal} unit={selectedUnit} onHide={() => setShowUnitModal(false)} token={userData?.token} userData={userData} />

                {/* Recent Issues section */}
                <Row className="mt-5">
                    <Col>
                        <div className="font-bold mb-3 text-heading-color text-xl">Recent Issues</div>
                        <Card className="shadow-sm border-0 bg-card-background text-text-color">
                            <Card.Body>
                                {recentIssues.length > 0 ? (
                                    <div className="table-responsive"> {/* Added table-responsive for better mobile display */}
                                        <table className="table table-striped align-middle min-w-full"> {/* min-w-full for responsive table */}
                                            <thead>
                                                <tr>
                                                    <th className="align-middle text-text-color">
                                                        <span className="flex items-center gap-2">
                                                            <BsCardText /> Title
                                                        </span>
                                                    </th>
                                                    <th className="align-middle text-text-color">
                                                        <span className="flex items-center gap-2">
                                                            <BsTag /> Type
                                                        </span>
                                                    </th>
                                                    <th className="align-middle text-text-color">
                                                        <span className="flex items-center gap-2">
                                                            <BsDiagram3 /> Assigned Unit
                                                        </span>
                                                    </th>
                                                    <th className="align-middle text-text-color">
                                                        <span className="flex items-center gap-2">
                                                            <BsInfoCircle /> Status
                                                        </span>
                                                    </th>
                                                    <th className="align-middle text-text-color">
                                                        <span className="flex items-center gap-2">
                                                            <BsCalendar /> Created
                                                        </span>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {recentIssues.map((ticket) => (
                                                    <tr key={ticket._id}>
                                                        <td className="text-text-color">
                                                            <span className="flex items-center gap-2">
                                                                <BsCardText className="text-primary-color" />
                                                                <Link to={`/tickets/${ticket._id}`} className="text-link-color hover:text-link-hover-color hover:underline">{ticket.subject}</Link>
                                                            </span>
                                                        </td>
                                                        <td className="text-text-color">
                                                            <Badge bg="info" className="text-capitalize inline-flex items-center gap-2" style={{color: 'var(--text-color)'}}>
                                                                <BsTag />
                                                                {ticket.type ? ticket.type.charAt(0).toUpperCase() + ticket.type.slice(1) : '—'}
                                                            </Badge>
                                                        </td>
                                                        <td className="text-text-color">
                                                            <Badge bg="secondary" className="text-capitalize inline-flex items-center gap-2" style={{color: 'var(--text-color)'}}>
                                                                <BsDiagram3 />
                                                                {ticket.assignedUnit || '—'}
                                                            </Badge>
                                                        </td>
                                                        <td className="text-text-color">
                                                            {/* Apply dynamic status color from statusColors object */}
                                                            <Badge className={`text-capitalize inline-flex items-center gap-2 ${statusColors[ticket.status]}`} style={{backgroundColor: ticket.status === 'open' ? 'var(--status-open-border)' : ticket.status === 'in progress' ? 'var(--status-inprogress-border)' : ticket.status === 'resolved' ? 'var(--status-resolved-border)' : 'var(--border-color)'}}>
                                                                <BsInfoCircle />
                                                                {ticket.status}
                                                            </Badge>
                                                        </td>
                                                        <td className="text-text-color">
                                                            <span className="flex items-center gap-2">
                                                                <BsCalendar className="text-text-muted-color" />
                                                                {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : '-'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-center text-text-muted-color">No recent issues found.</p>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
            {/* Footer Section - Apply themed styles */}
            <footer className="w-full mt-5 bg-footer-bg text-footer-text py-4 text-base transition-colors duration-300">
                <Container>
                    <div className="flex flex-col md:flex-row justify-content-between items-center">
                        <div className="mb-2 md:mb-0 text-base">
                            <span className="mr-2"><i className="bi bi-c-circle"></i></span> {/* Assuming Bootstrap Icons */}
                            2025 ICT Directorate, Sri Lanka Customs. All rights reserved.
                        </div>
                        <div className="flex gap-4">
                            <Link to="#" className="text-footer-text no-underline hover:underline">Privacy Policy</Link>
                            <Link to="#" className="text-footer-text no-underline hover:underline">Terms of Service</Link>
                            <Link to="#" className="text-footer-text no-underline hover:underline">Help</Link>
                        </div>
                    </div>
                </Container>
            </footer>
        </>
    );
};

export default Home2;