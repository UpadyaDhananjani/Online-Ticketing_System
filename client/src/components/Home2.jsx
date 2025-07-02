import React, { useEffect, useState } from "react";
import { Container, Row, Col, Spinner, Alert, Card, Badge } from "react-bootstrap";
import { Link } from 'react-router-dom';
import {
  BsCardText,
  BsTag,
  BsDiagram3,
  BsInfoCircle,
  BsCalendar,
} from "react-icons/bs";

const Home2 = () => {
  const [ticketCounts, setTicketCounts] = useState({
    open: 0,
    inProgress: 0,
    resolved: 0,
  });

  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const statusColors = {
    open: "success",
    closed: "danger",
    resolved: "primary",
    reopened: "warning",
    "in progress": "info",
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
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
    const intervalId = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(intervalId);
  }, []);

  if (loading)
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </Container>
    );

  if (error)
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      </Container>
    );

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
    <Container className="py-4">
      <h2 className="mb-4 text-center">Dashboard</h2>
      <Row className="justify-content-center g-4">
        <Col xs={12} md={4}>
          <Card style={boxStyle} className="hover-effect">
            <div style={countStyle}>
              {ticketCounts.open}
            </div>
            <div style={titleStyle}>
              <BsInfoCircle className="me-2" />
              Open Issues
            </div>
          </Card>
        </Col>
        <Col xs={12} md={4}>
          <Card style={boxStyle} className="hover-effect">
            <div style={countStyle}>
              {ticketCounts.inProgress}
            </div>
            <div style={titleStyle}>
              <BsDiagram3 className="me-2" />
              In Progress Issues
            </div>
          </Card>
        </Col>
        <Col xs={12} md={4}>
          <Card style={boxStyle} className="hover-effect">
            <div style={countStyle}>
              {ticketCounts.resolved}
            </div>
            <div style={titleStyle}>
              <BsCalendar className="me-2" />
              Resolved Issues
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Issues section */}
      <Row className="mt-4">
        <Col>
          <h3 className="mb-3">Recent Issues</h3>
          <Card className="shadow-sm border-0">
            <Card.Body>
              {recentIssues.length > 0 ? (
                <table className="table table-striped align-middle">
                  <thead>
                    <tr>
                      <th>
                        <span className="d-flex align-items-center gap-2">
                          <BsCardText /> Title
                        </span>
                      </th>
                      <th>
                        <span className="d-flex align-items-center gap-2">
                          <BsTag /> Type
                        </span>
                      </th>
                      <th>
                        <span className="d-flex align-items-center gap-2">
                          <BsDiagram3 /> Assigned Unit
                        </span>
                      </th>
                      <th>
                        <span className="d-flex align-items-center gap-2">
                          <BsInfoCircle /> Status
                        </span>
                      </th>
                      <th>
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

      <style>{`
        .hover-effect:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
          cursor: pointer;
        }
      `}</style>
    </Container>
  );
};

export default Home2;
