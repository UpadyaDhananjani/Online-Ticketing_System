import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Spinner, Alert } from "react-bootstrap";
import { getAdminTicketsSummary } from "../api/ticketApi";
import { Link } from "react-router-dom";
import ChartAnalytics from "./ChartAnalytics";

const TicketReports = () => {
  const [reportData, setReportData] = useState({
    counts: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const response = await getAdminTicketsSummary();
        console.log("API Response:", response);

        if (!response || typeof response !== "object") {
          throw new Error("Invalid data format received from server");
        }

        setReportData({
          counts: {
            open: response.open ?? 0,
            inProgress: response.inProgress ?? 0,
            resolved: response.resolved ?? 0,
            closed: response.closed ?? 0,
            reopened: response.reopened ?? 0
          },
          loading: false,
          error: null
        });
      } catch (error) {
        console.error("Failed to load report data:", error);
        setReportData(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
    };

    fetchReportData();
  }, []);

  const prepareChartData = () => {
    if (!reportData.counts) return [];
    
    return [
      { status: "open", count: reportData.counts.open },
      { status: "in progress", count: reportData.counts.inProgress },
      { status: "resolved", count: reportData.counts.resolved },
      { status: "closed", count: reportData.counts.closed },
      { status: "reopened", count: reportData.counts.reopened }
    ].filter(item => item.count > 0); // Only include statuses with counts > 0
  };

  if (reportData.loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading ticket reports...</p>
      </Container>
    );
  }

  if (reportData.error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Reports</Alert.Heading>
          <p>{reportData.error}</p>
          <Button 
            variant="outline-danger"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  const chartData = prepareChartData();

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Ticket Analytics Dashboard</h1>
        <div>
          <Link to="/admin" className="btn btn-outline-secondary me-2">
            Back to Admin
          </Link>
          <Link to="/analytics" className="btn btn-primary">
            Advanced Analytics
          </Link>
        </div>
      </div>

      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <Card.Title>Open Tickets</Card.Title>
              <h2 className="text-primary">{reportData.counts?.open || 0}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <Card.Title>In Progress</Card.Title>
              <h2 className="text-warning">{reportData.counts?.inProgress || 0}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <Card.Title>Resolved</Card.Title>
              <h2 className="text-success">{reportData.counts?.resolved || 0}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title className="text-center mb-4">Ticket Status Distribution</Card.Title>
          <ChartAnalytics data={chartData} />
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TicketReports;