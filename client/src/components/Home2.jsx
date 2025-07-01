// client/src/components/Home2.jsx
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Spinner, Alert, Card, Badge } from "react-bootstrap";
import { Link } from 'react-router-dom'; // Assuming you might want to link to recent issues

const Home2 = () => {
  const [ticketCounts, setTicketCounts] = useState({
    open: 0,
    completed: 0,
    unassigned: 0,
  });
  const [recentIssues, setRecentIssues] = useState([]); // To display recent issues
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
      setError(""); // Clear previous errors
      try {
        // Fetch ticket summary counts
        const summaryRes = await fetch("/api/tickets/summary");
        if (!summaryRes.ok) {
          const errorText = await summaryRes.text();
          throw new Error(`Failed to fetch ticket summary: ${summaryRes.status} - ${errorText}`);
        }
        const summaryData = await summaryRes.json();
        setTicketCounts({
          open: summaryData.open || 0,
          completed: summaryData.completed || 0,
          unassigned: summaryData.unassigned || 0,
        });

        // Fetch recent issues (e.g., last 5 tickets, or open ones, adjust as needed)
        // You might have a separate endpoint for this, or modify your existing /api/tickets to support queries
        const recentIssuesRes = await fetch("/api/tickets?limit=5&sortBy=createdAt&sortOrder=desc"); // Example: fetch last 5 tickets
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

    // Optional: Auto-refresh the dashboard data periodically (e.g., every 30 seconds)
    const intervalId = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(intervalId);

  }, []); // Empty dependency array means this runs once on component mount

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
    backgroundColor: "#343a40", // Dark background for the boxes
    color: "white",
    padding: "20px",
    borderRadius: "8px",
    textAlign: "center",
    marginBottom: "20px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    height: "150px", // Fixed height for consistency
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer", // Indicate clickable
    transition: "transform 0.2s ease-in-out",
  };

  const countStyle = {
    fontSize: "3rem",
    fontWeight: "bold",
    lineHeight: 1,
  };

  const titleStyle = {
    fontSize: "1.2rem",
    marginTop: "10px",
    color: "#adb5bd",
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center">Dashboard</h2>
      <Row className="justify-content-center">
        <Col md={4}>
          <Card style={boxStyle} className="hover-effect">
            <div style={countStyle}>{ticketCounts.open}</div>
            <div style={titleStyle}>Open Issues</div>
          </Card>
        </Col>
        <Col md={4}>
          <Card style={boxStyle} className="hover-effect">
            <div style={countStyle}>{ticketCounts.completed}</div>
            <div style={titleStyle}>Completed Issues</div>
          </Card>
        </Col>
        <Col md={4}>
          <Card style={boxStyle} className="hover-effect">
            <div style={countStyle}>{ticketCounts.unassigned}</div>
            <div style={titleStyle}>Unassigned Issues</div>
          </Card>
        </Col>
      </Row>

      {/* Recent Issues section - as per your screenshot */}
      <Row className="mt-4">
        <Col>
          <h3 className="mb-3">Recent Issues</h3>
          <Card className="shadow-sm border-0">
            <Card.Body>
              {recentIssues.length > 0 ? (
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Type</th> {/* Changed from Priority based on schema */}
                      <th>Status</th>
                      <th>Created</th>
                      {/* <th>Assigned To</th> Assuming no assignedTo field for now */}
                    </tr>
                  </thead>
                  <tbody>
                    {recentIssues.map((ticket) => (
                      <tr key={ticket._id}>
                        <td>
                          <Link to={`/tickets/${ticket._id}`}>
                            {ticket.subject}
                          </Link>
                        </td>
                        <td><Badge bg="info" className="text-capitalize">{ticket.type}</Badge></td>
                        <td>
                          <Badge bg={statusColors[ticket.status] || "secondary"} className="text-capitalize">
                            {ticket.status}
                          </Badge>
                        </td>
                        <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                        {/* <td>{ticket.assignedTo ? ticket.assignedTo : 'N/A'}</td> */}
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
      {/* Add a CSS class for hover effect */}
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