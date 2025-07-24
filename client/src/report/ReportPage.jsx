import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { getAdminTicketsSummary, getAdminReportChartImageUrl, getAdminReportPdfUrl } from "../api/ticketApi";
import { Link } from "react-router-dom";
import ChartAnalytics from "./ChartAnalytics";

function TicketReports() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await getAdminTicketsSummary();
        setSummary(res); // Change this line - remove .data
      } catch (error) {
        console.error("Error fetching ticket summary:", error);
      }
    }
    fetchSummary();
  }, []);

  if (!summary) return <div>Loading reports...</div>;

  // For real-time chart image
  const chartImageUrl = getAdminReportChartImageUrl();
  const pdfUrl = getAdminReportPdfUrl();
  
  // Format data for ChartAnalytics
  const chartData = [
    { status: "Open", count: summary.open },
    { status: "In Progress", count: summary.inProgress },
    { status: "Resolved", count: summary.resolved }
  ];

  const downloadPdf = () => {
    // Logic to download PDF report
    window.open(pdfUrl, "_blank");
  };

  return (
    <Container>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>Ticket Reports</h1>
        <Link to="/analytics">
          <Button variant="info">Analytics</Button>
        </Link>
      </div>
      <Row>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Open Tickets</Card.Title>
              <h2>{summary.open}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Resolved Tickets</Card.Title>
              <h2>{summary.resolved}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>In Progress Tickets</Card.Title>
              <h2>{summary.inProgress}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <ChartAnalytics data={chartData} />

      <Button
        variant="primary"
        onClick={downloadPdf}
      >
        Download PDF Report
      </Button>

      {/* You can add more charts/tables below */}
    </Container>
  );
}

export default TicketReports;
