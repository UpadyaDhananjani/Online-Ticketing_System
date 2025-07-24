import React, { useEffect, useState } from "react";
import { Container, Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import ChartAnalytics from "./ChartAnalytics";
import AssigneePerformanceTable from "./AssigneePerformanceTable";
import TicketsByUnitChart from "./TicketsByUnitChart";
import AvgResolutionTimeChart from "./AvgResolutionTimeChart";
import ActivityLogsTable from "./ActivityLogsTable";
import { getTicketStatusDistribution } from "../api/ticketApi";

const AnalyticsPage = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const statusData = await getTicketStatusDistribution();
        const formattedData = statusData.map(item => ({
          status: item.status,
          count: item.count
        }));
        setChartData(formattedData);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        setError("Failed to load analytics data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <Container>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>Analytics</h1>
        <Link to="/report">
          <Button variant="secondary">Back to Reports</Button>
        </Link>
      </div>
      
      {error && (
        <Alert variant="danger">{error}</Alert>
      )}
      
      {loading ? (
        <div>Loading analytics data...</div>
      ) : chartData && chartData.length > 0 ? (
        <>
          <ChartAnalytics 
            data={chartData} 
            currentMonthLabel="Ticket Status Distribution" 
          />
          <AssigneePerformanceTable />
          <TicketsByUnitChart />
          <AvgResolutionTimeChart />
          <ActivityLogsTable />
        </>
      ) : (
        <Alert variant="info">No analytics data available</Alert>
      )}
    </Container>
  );
};

export default AnalyticsPage;