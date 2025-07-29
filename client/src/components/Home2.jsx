
import React, { useEffect, useState, useContext } from "react";
import { Container, Row, Col, Spinner, Alert, Card, Badge, Button } from "react-bootstrap";
import { Link } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import {
  BsCardText,
  BsTag,
  BsDiagram3,
  BsInfoCircle,
  BsCalendar,
  BsPlusCircle,
  BsCheck2Circle,
  BsPeopleFill,
  BsCpuFill,
  BsBarChartFill,
  BsClipboardCheck,
  BsGearFill,
  BsHeadset
} from "react-icons/bs";
import UnitUsersModal from "../admin/UnitUsersModal.jsx";
import DarkModeToggle from "./DarkModeToggle.jsx";


const Home2 = () => {
  const { userData } = useContext(AppContent);

  const [ticketCounts, setTicketCounts] = useState({
    open: 0,
    inProgress: 0,
    resolved: 0,
  });

  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState("");

  const statusColors = {
    open: "success",
    closed: "danger",
    resolved: "primary",
    reopened: "warning",
    "in progress": "info",
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userData) {
        setLoading(false);
        setTicketCounts({ open: 0, inProgress: 0, resolved: 0 });
        setRecentIssues([]);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const summaryRes = await fetch("/api/tickets/summary");
        if (!summaryRes.ok) {
          const errorText = await summaryRes.text();
          throw new Error(`Failed to fetch ticket summary: ${summaryRes.status} - ${errorText}`);
        }
        const summaryData = await summaryRes.json();
        setTicketCounts({
          open: summaryData.open || 0,
          inProgress: summaryData.inProgress || 0,
          resolved: summaryData.resolved || 0,
        });

        const recentIssuesRes = await fetch("/api/tickets?limit=5&sortBy=createdAt&sortOrder=desc");
        if (!recentIssuesRes.ok) {
          const errorText = await recentIssuesRes.text();
          throw new Error(`Failed to fetch recent issues: ${recentIssuesRes.status} - ${errorText}`);
        }
        const recentIssuesData = await recentIssuesRes.json();
        setRecentIssues(recentIssuesData);

      } catch (err) {
        console.error("Dashboard data fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    const intervalId = userData ? setInterval(fetchDashboardData, 30000) : null;
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [userData]);

  if (loading && userData)
    return (
    <div className="bg-gray-50 min-h-screen p-6">
      <DarkModeToggle />

      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </Container>
    </div>
    );

  if (error && userData)
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      </Container>
    );

  if (!userData) {
    return (
      <Container className="py-5">
        <Alert variant="info" className="text-center">
          Please log in to view the dashboard.
        </Alert>
      </Container>
    );
  }

  const boxStyle = {
    backgroundColor: "#343a40",
    color: "white",
    padding: "20px",
    borderRadius: "8px",
    textAlign: "center",
    marginBottom: "20px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    height: "150px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    transition: "transform 0.2s ease-in-out",
  };

  const countStyle = {
    fontSize: "3rem",
    fontWeight: "bold",
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem"
  };

  const titleStyle = {
    fontSize: "1.2rem",
    marginTop: "10px",
    color: "#adb5bd",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem"
  };

  return (
    <>
      <DarkModeToggle />
      {/* Hero Section */}
      <div className="w-full bg-gradient-to-r from-blue-700 to-blue-400 py-5 px-2 mb-5" style={{ minHeight: '340px', position: 'relative' }}>
        <Container fluid className="px-0">
          <Row className="align-items-center justify-content-between mb-4">
            <Col xs="auto" className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center">
                <span className="bg-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: 44, height: 44 }}>
                  <i className="bi bi-bank2 text-primary" style={{ fontSize: 28 }}></i>
                </span>
                <div>
                  <h3 className="mb-0 fw-bold text-white" style={{ letterSpacing: 0.5 }}>ICT Helpdesk</h3>
                  <div className="text-white-50 small" style={{ fontSize: 15 }}>Sri Lanka Customs Headquarters</div>
                </div>
              </div>
            </Col>
            <Col xs="auto" className="d-flex align-items-center gap-4">
              <a href="#services" className="text-white fw-medium hover:underline me-3" style={{ fontSize: 17 }}>Services</a>
              <a href="#contact" className="text-white fw-medium hover:underline me-3" style={{ fontSize: 17 }}>Contact</a>
              <a href="/login" className="btn btn-light fw-bold px-4 py-2" style={{ fontSize: 17, borderRadius: 8 }}> Login</a>
            </Col>
          </Row>
          <Row className="justify-content-center text-center mt-4">
            <Col md={10} lg={8}>
              <h1 className="display-4 fw-bold text-white mb-3" style={{ letterSpacing: 0.5 }}>Welcome to ICT Support Services</h1>
              <p className="lead text-white-50 mb-4" style={{ fontSize: 20 }}>
                Get technical assistance for all your IT needs. Submit tickets, track progress, and access resources 24/7.
              </p>
              <div className="d-flex flex-wrap justify-content-center gap-3 mt-2">
                <a href="/create-ticket" className="btn btn-light fw-bold px-4 py-2" style={{ fontSize: 18, borderRadius: 8 }}>Submit New Ticket</a>
                <a href="/tickets" className="btn btn-outline-light fw-bold px-4 py-2" style={{ fontSize: 18, borderRadius: 8 }}>Track Ticket Status</a>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Main Dashboard Content */}
      <Container className="py-4">
        <div className="text-center mb-4">
          <h2 className="fw-bold mb-1" style={{ color: '#1a2233', fontSize: 32 }}>Current Ticket Status</h2>
          <div className="text-muted" style={{ fontSize: 18 }}>Real-time overview of helpdesk tickets</div>
        </div>
        <Row className="justify-content-center g-4 mb-5">
          {/* Open Issues Card */}
          <Col xs={12} md={4}>
            <div className="h-100 p-4 d-flex flex-row align-items-center justify-content-between rounded-3 shadow-sm" style={{ background: '#fff5f5', borderLeft: '6px solid #f87171', minHeight: 140 }}>
              <div>
                <div className="fw-bold" style={{ fontSize: 36, color: '#e11d48' }}>{ticketCounts.open}</div>
                <div className="fw-bold" style={{ fontSize: 20, color: '#1a2233' }}>Open Issues</div>
                <div className="text-muted" style={{ fontSize: 15 }}>Awaiting assignment</div>
              </div>
              <span className="d-inline-block ms-3" style={{ width: 38, height: 38, borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, #f87171 60%, #e11d48 100%)', boxShadow: '0 2px 8px rgba(249, 113, 113, 0.15)' }}></span>
            </div>
          </Col>
          {/* In Progress Issues Card */}
          <Col xs={12} md={4}>
            <div className="h-100 p-4 d-flex flex-row align-items-center justify-content-between rounded-3 shadow-sm" style={{ background: '#fffae6', borderLeft: '6px solid #fbbf24', minHeight: 140 }}>
              <div>
                <div className="fw-bold" style={{ fontSize: 36, color: '#f59e1b' }}>{ticketCounts.inProgress}</div>
                <div className="fw-bold" style={{ fontSize: 20, color: '#1a2233' }}>In Progress Issues</div>
                <div className="text-muted" style={{ fontSize: 15 }}>Being worked on</div>
              </div>
              <span className="d-inline-block ms-3" style={{ width: 38, height: 38, borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, #fde68a 60%, #fbbf24 100%)', boxShadow: '0 2px 8px rgba(251, 191, 36, 0.13)' }}></span>
            </div>
          </Col>
          {/* Resolved Issues Card */}
          <Col xs={12} md={4}>
            <div className="h-100 p-4 d-flex flex-row align-items-center justify-content-between rounded-3 shadow-sm" style={{ background: '#f0fdf4', borderLeft: '6px solid #22c55e', minHeight: 140 }}>
              <div>
                <div className="fw-bold" style={{ fontSize: 36, color: '#16a34a' }}>{ticketCounts.resolved}</div>
                <div className="fw-bold" style={{ fontSize: 20, color: '#1a2233' }}>Resolved Issues</div>
                <div className="text-muted" style={{ fontSize: 15 }}>This month</div>
              </div>
              <span className="d-inline-flex align-items-center justify-content-center ms-3" style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #bbf7d0 60%, #22c55e 100%)', boxShadow: '0 2px 8px rgba(34, 197, 94, 0.13)' }}>
                <BsCheck2Circle size={28} color="#16a34a" />
              </span>
            </div>
          </Col>
        </Row>

        {/* ICT Directorate Units Section */}
        <div className="text-center mb-4 mt-5">
          <h2 className="fw-bold mb-1" style={{ color: '#1a2233', fontSize: 28 }}>ICT Directorate Units</h2>
          <div className="text-muted" style={{ fontSize: 16 }}>Key units supporting ICT operations</div>
        </div>
        <Row className="g-4 justify-content-center mb-5">
          <Col xs={12} sm={6} md={4} lg={4}>
            <Card className="h-100 shadow-sm border-0 rounded-3 transition-all duration-200 hover:scale-[1.03] hover:shadow-lg bg-white" style={{ cursor: 'pointer' }} onClick={() => { setSelectedUnit("Asyhub Unit"); setShowUnitModal(true); }}>
              <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                <BsPeopleFill size={38} className="mb-3 text-primary" />
                <Card.Title className="fw-bold mb-2" style={{ fontSize: 20 }}>Asyhub Unit</Card.Title>
                <Card.Text className="text-muted text-center">Handles Asyhub platform operations and integration.</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={4} lg={4}>
            <Card className="h-100 shadow-sm border-0 rounded-3 transition-all duration-200 hover:scale-[1.03] hover:shadow-lg bg-white" style={{ cursor: 'pointer' }} onClick={() => { setSelectedUnit("System & Network Administration Unit"); setShowUnitModal(true); }}>
              <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                <BsCpuFill size={38} className="mb-3 text-info" />
                <Card.Title className="fw-bold mb-2" style={{ fontSize: 20 }}>System & Network Administration Unit</Card.Title>
                <Card.Text className="text-muted text-center">Manages servers, networks, and IT infrastructure.</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={4} lg={4}>
            <Card className="h-100 shadow-sm border-0 rounded-3 transition-all duration-200 hover:scale-[1.03] hover:shadow-lg bg-white" style={{ cursor: 'pointer' }} onClick={() => { setSelectedUnit("Statistics Unit"); setShowUnitModal(true); }}>
              <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                <BsBarChartFill size={38} className="mb-3 text-success" />
                <Card.Title className="fw-bold mb-2" style={{ fontSize: 20 }}>Statistics Unit</Card.Title>
                <Card.Text className="text-muted text-center">Oversees data analysis and reporting for ICT.</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={4} lg={4}>
            <Card className="h-100 shadow-sm border-0 rounded-3 transition-all duration-200 hover:scale-[1.03] hover:shadow-lg bg-white" style={{ cursor: 'pointer' }} onClick={() => { setSelectedUnit("Audit Unit"); setShowUnitModal(true); }}>
              <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                <BsClipboardCheck size={38} className="mb-3 text-warning" />
                <Card.Title className="fw-bold mb-2" style={{ fontSize: 20 }}>Audit Unit</Card.Title>
                <Card.Text className="text-muted text-center">Ensures compliance and conducts ICT audits.</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={4} lg={4}>
            <Card className="h-100 shadow-sm border-0 rounded-3 transition-all duration-200 hover:scale-[1.03] hover:shadow-lg bg-white" style={{ cursor: 'pointer' }} onClick={() => { setSelectedUnit("Functional Unit"); setShowUnitModal(true); }}>
              <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                <BsGearFill size={38} className="mb-3 text-secondary" />
                <Card.Title className="fw-bold mb-2" style={{ fontSize: 20 }}>Functional Unit</Card.Title>
                <Card.Text className="text-muted text-center">Supports business applications and user needs.</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={4} lg={4}>
            <Card className="h-100 shadow-sm border-0 rounded-3 transition-all duration-200 hover:scale-[1.03] hover:shadow-lg bg-white" style={{ cursor: 'pointer' }} onClick={() => { setSelectedUnit("Helpdesk Unit"); setShowUnitModal(true); }}>
              <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                <BsHeadset size={38} className="mb-3 text-danger" />
                <Card.Title className="fw-bold mb-2" style={{ fontSize: 20 }}>Helpdesk Unit</Card.Title>
                <Card.Text className="text-muted text-center">Provides frontline IT support and assistance.</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <UnitUsersModal show={showUnitModal} unit={selectedUnit} onHide={() => setShowUnitModal(false)} token={userData?.token} userData={userData} />

        {/* Recent Issues section */}
        <Row className="mt-5">
          <Col>
          <div className="fw-bold mb-3" style={{ fontSize: 20, color: '#1a2233' }}>Recent Issues</div>
            <Card className="shadow-sm border-0">
              <Card.Body>
                {recentIssues.length > 0 ? (
                  <table className="table table-striped align-middle">
                    <thead>
                      <tr>
                        <th className="align-middle">
                          <span className="d-flex align-items-center gap-2">
                            <BsCardText /> Title
                          </span>
                        </th>
                        <th className="align-middle">
                          <span className="d-flex align-items-center gap-2">
                            <BsTag /> Type
                          </span>
                        </th>
                        <th className="align-middle">
                          <span className="d-flex align-items-center gap-2">
                            <BsDiagram3 /> Assigned Unit
                          </span>
                        </th>
                        <th className="align-middle">
                          <span className="d-flex align-items-center gap-2">
                            <BsInfoCircle /> Status
                          </span>
                        </th>
                        <th className="align-middle">
                          <span className="d-flex align-items-center gap-2">
                            <BsCalendar /> Created
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentIssues.map((ticket) => (
                        <tr key={ticket._id}>
                          <td>
                            <span className="d-flex align-items-center gap-2">
                              <BsCardText className="text-primary" />
                              <Link to={`/tickets/${ticket._id}`}>{ticket.subject}</Link>
                            </span>
                          </td>
                          <td>
                            <Badge bg="info" text="dark" className="text-capitalize d-inline-flex align-items-center gap-2">
                              <BsTag />
                              {ticket.type ? ticket.type.charAt(0).toUpperCase() + ticket.type.slice(1) : '—'}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg="secondary" className="text-capitalize d-inline-flex align-items-center gap-2">
                              <BsDiagram3 />
                              {ticket.assignedUnit || '—'}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg={statusColors[ticket.status] || "secondary"} className="text-capitalize d-inline-flex align-items-center gap-2">
                              <BsInfoCircle />
                              {ticket.status}
                            </Badge>
                          </td>
                          <td>
                            <span className="d-flex align-items-center gap-2">
                              <BsCalendar className="text-secondary" />
                              {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : '-'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-center text-muted">No recent issues found.</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      {/* Footer Section */}
      <footer className="w-100 mt-5" style={{ background: '#232b36', color: '#fff', padding: '18px 0', fontSize: 16 }}>
        <Container>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
            <div className="mb-2 mb-md-0" style={{ fontSize: 16 }}>
              <span className="me-2"><i className="bi bi-c-circle"></i></span>
              2025 ICT Directorate, Sri Lanka Customs. All rights reserved.
            </div>
            <div className="d-flex gap-4">
              <a href="#" className="text-white text-decoration-none hover:underline">Privacy Policy</a>
              <a href="#" className="text-white text-decoration-none hover:underline">Terms of Service</a>
              <a href="#" className="text-white text-decoration-none hover:underline">Help</a>
            </div>
          </div>
         
        </Container>
      </footer>
    </>
  );
};

export default Home2;
