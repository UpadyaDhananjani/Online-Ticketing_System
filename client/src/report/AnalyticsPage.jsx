import React from "react";
import { Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import ChartAnalytics from "./ChartAnalytics";

const AnalyticsPage = () => {
  return (
    <Container>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>Analytics</h1>
        <Link to="/report">
          <Button variant="secondary">Back to Reports</Button>
        </Link>
      </div>
      <ChartAnalytics />
    </Container>
  );
};

export default AnalyticsPage; 