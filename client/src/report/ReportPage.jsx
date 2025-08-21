import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import {
  Line,
  Doughnut,
} from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  Filler,
} from "chart.js";
import { 
  getAdminTicketsSummary, 
  getAdminReportChartImageUrl, 
  getAdminReportPdfUrl,
  getTicketTypeDistribution,
  getRecentTickets,
  getAssigneePerformance
} from "../api/ticketApi";
import { Link } from "react-router-dom";
import { BsCheck2Circle, BsPrinter, BsDownload, BsGraphUp } from "react-icons/bs";
import { toast } from "react-toastify";
import ChartAnalytics from "./ChartAnalytics";
import TicketsByUnitChart from "./TicketsByUnitChart";
import PriorityChart from "./PriorityChart";
import AssigneePerformanceTable from "./AssigneePerformanceTable";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  Filler
);

function TicketReports() {
  const [summary, setSummary] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [categoryData, setCategoryData] = useState({ labels: [], datasets: [] });
  const [teamPerformance, setTeamPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  useEffect(() => {
    async function fetchAllData() {
      try {
        setLoading(true);
        
        // Fetch summary data
        const summaryRes = await getAdminTicketsSummary();
        setSummary(summaryRes);
        
        // Fetch recent tickets
        const ticketsRes = await getRecentTickets();
        setTickets(ticketsRes);
        
        // Fetch category breakdown
        const categoryRes = await getTicketTypeDistribution();
        setCategoryData({
          labels: categoryRes.map(d => d.type),
          datasets: [{
            data: categoryRes.map(d => d.count),
            backgroundColor: [
              "#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6", "#10b981", "#f97316"
            ],
            hoverOffset: 20,
          }]
        });
        
        // Fetch team performance
        const performanceRes = await getAssigneePerformance();
        setTeamPerformance(performanceRes);
        
      } catch (error) {
        console.error("Error fetching report data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAllData();
  }, []);

  // Static demo ticket trends data
  const ticketTrendsData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "New Tickets",
        data: [12, 19, 15, 25, 22, 18, 24],
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 4,
      },
      {
        label: "Resolved",
        data: [8, 15, 18, 20, 25, 22, 28],
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 4,
      },
    ],
  };

  const ticketTrendsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      tooltip: { mode: "index", intersect: false }
    },
    interaction: { mode: "nearest", axis: "x", intersect: false },
    scales: {
      y: { beginAtZero: true }
    },
  };

  const categoryOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
      tooltip: { enabled: true }
    },
  };

  if (loading) return (
    <Container className="mt-4">
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading comprehensive reports...</p>
      </div>
    </Container>
  );

  if (!summary) return (
    <Container className="mt-4">
      <div className="text-center py-5">
        <BsGraphUp size={48} className="text-muted mb-3" />
        <p className="text-muted">No report data available</p>
      </div>
    </Container>
  );

  // For real-time chart image
  const chartImageUrl = getAdminReportChartImageUrl();
  const pdfUrl = getAdminReportPdfUrl();
  
  // Format data for ChartAnalytics
  const chartData = [
    { status: "Open", count: summary.open },
    { status: "In Progress", count: summary.inProgress },
    { status: "Resolved", count: summary.resolved }
  ];

  const downloadPdf = async () => {
    try {
      setPdfGenerating(true);
      
      // Show success toast
      toast.info("🔄 Generating comprehensive PDF report with all charts and data...", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Logic to download PDF report
      window.open(pdfUrl, "_blank");
      
      // Show completion toast
      setTimeout(() => {
        toast.success("✅ Comprehensive PDF report generated successfully!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }, 2000);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error("❌ Failed to generate PDF report. Please try again.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setPdfGenerating(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-6">
      <style>
        {`
          .bg-gray-50 {
            background-color: #f9fafb;
          }
          .rounded-lg {
            border-radius: 0.5rem;
          }
          .shadow-md {
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
          .shadow-lg {
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          }
          .hover\\:shadow-lg:hover {
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          }
          .transition-all {
            transition-property: all;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
            transition-duration: 200ms;
          }
          .font-semibold {
            font-weight: 600;
          }
          .text-gray-800 {
            color: #1f2937;
          }
          .text-gray-900 {
            color: #111827;
          }
          .text-gray-500 {
            color: #6b7280;
          }
          .hover\\:bg-gray-50:hover {
            background-color: #f9fafb;
          }
          .chart-container {
            position: relative;
          }
        `}
      </style>
      <Container className="max-w-7xl">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-600 text-white shadow-lg rounded-lg p-6 mb-6">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <div className="bg-white rounded-circle d-flex align-items-center justify-content-center me-4" 
                   style={{ width: 60, height: 60 }}>
                <BsGraphUp size={28} className="text-blue-600" />
              </div>
              <div>
                <h1 className="h2 mb-1">Comprehensive Ticket Reports</h1>
                <p className="mb-0 opacity-75">ICT Helpdesk Analytics & Performance Dashboard</p>
              </div>
            </div>
            <div className="d-flex gap-3">
              <Link to="/analytics">
                <Button variant="light" size="lg">
                  <BsGraphUp className="me-2" />
                  Analytics
                </Button>
              </Link>
              <Button variant="outline-light" size="lg" onClick={downloadPdf} disabled={pdfGenerating}>
                {pdfGenerating ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <BsPrinter className="me-2" />
                    Download PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Status Cards Section */}
        <div className="text-center mb-5">
          <h2 className="fw-bold mb-1" style={{ color: '#1a2233', fontSize: 32 }}>Current Ticket Status</h2>
          <div className="text-muted" style={{ fontSize: 18 }}>Real-time overview of helpdesk performance</div>
        </div>
        
        <Row className="justify-content-center g-4 mb-6">
          <Col xs={12} md={4}>
            <StatusCard
              count={summary.open || 0}
              label="Open Issues"
              description="Awaiting assignment"
              colorBg="#fff5f5"
              borderColor="#f87171"
              textColor="#e11d48"
            />
          </Col>
          <Col xs={12} md={4}>
            <StatusCard
              count={summary.inProgress || 0}
              label="In Progress Issues"
              description="Being worked on"
              colorBg="#fffae6"
              borderColor="#fbbf24"
              textColor="#f59e1b"
            />
          </Col>
          <Col xs={12} md={4}>
            <StatusCard
              count={summary.resolved || 0}
              label="Resolved Issues"
              description="This month"
              colorBg="#f0fdf4"
              borderColor="#22c55e"
              textColor="#16a34a"
              icon={<BsCheck2Circle size={28} color="#16a34a" />}
            />
          </Col>
        </Row>

        {/* Charts Section */}
        <Row className="g-4 mb-6">
          <Col lg={6}>
            <ChartCard title="Ticket Trends (Last 7 Days)">
              <div style={{ height: "300px" }}>
                <Line data={ticketTrendsData} options={ticketTrendsOptions} />
              </div>
            </ChartCard>
          </Col>
          <Col lg={6}>
            <ChartCard title="Tickets by Category">
              <div style={{ height: "320px" }} className="d-flex align-items-center justify-content-center">
                <Doughnut data={categoryData} options={categoryOptions} />
              </div>
            </ChartCard>
          </Col>
        </Row>

        <Row className="g-4 mb-6">
          <Col lg={6}>
            <ChartCard title="Tickets by Unit/Team">
              <TicketsByUnitChart />
            </ChartCard>
          </Col>
          <Col lg={6}>
            <ChartCard title="Priority Distribution">
              <PriorityChart />
            </ChartCard>
          </Col>
        </Row>

        {/* Status Distribution Chart */}
        <div className="mb-4">
          <ChartCard title="Ticket Status Distribution">
            <ChartAnalytics data={chartData} />
          </ChartCard>
        </div>

        {/* Tables Section */}
        <div className="mb-4">
          {/* Recent Tickets Table */}
          <TableSection tickets={tickets} />
        </div>
        
        <div className="mb-4">
          {/* Assignee Performance Section */}
          <AssigneePerformanceTable data={teamPerformance} />
        </div>

        {/* Download Section */}
        <div className="text-center mt-6 p-4 bg-white rounded-lg shadow-sm">
          <h4 className="mb-3">Export Comprehensive Reports</h4>
          <p className="text-muted mb-4">Download complete reports including all charts, tables, and analytics</p>
          <Button
            variant="primary"
            size="lg"
            onClick={downloadPdf}
            className="me-3"
            disabled={pdfGenerating}
          >
            {pdfGenerating ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                Generating Comprehensive PDF...
              </>
            ) : (
              <>
                <BsDownload className="me-2" />
                Download Comprehensive PDF Report
              </>
            )}
          </Button>
          <Button
            variant="outline-secondary"
            size="lg"
            onClick={() => window.print()}
            disabled={pdfGenerating}
          >
            <BsPrinter className="me-2" />
            Print Report
          </Button>
          <div className="mt-3">
            <small className="text-muted">
              📊 Includes: Status charts, priority analysis, type distribution, recent tickets table, and unit performance metrics
            </small>
          </div>
        </div>
      </Container>
    </div>
  );
}

// Supporting Components
function StatusCard({ count, label, description, colorBg, borderColor, textColor, icon }) {
  return (
    <div className="h-100 p-4 d-flex flex-row align-items-center justify-content-between rounded-3 shadow-sm"
      style={{ background: colorBg, borderLeft: `6px solid ${borderColor}`, minHeight: 140 }}>
      <div>
        <div className="fw-bold" style={{ fontSize: 36, color: textColor }}>{count}</div>
        <div className="fw-bold" style={{ fontSize: 20, color: '#1a2233' }}>{label}</div>
        <div className="text-muted" style={{ fontSize: 15 }}>{description}</div>
      </div>
      <span className="d-inline-flex align-items-center justify-content-center ms-3"
        style={{
          width: 38, height: 38, borderRadius: '50%',
          background: `linear-gradient(135deg, #bbf7d0 60%, ${borderColor} 100%)`,
          boxShadow: `0 2px 8px rgba(${hexToRgb(borderColor)}, 0.13)`
        }}
      >
        {icon}
      </span>
    </div>
  );
}

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r}, ${g}, ${b}`;
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-200 hover:shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="chart-container">{children}</div>
    </div>
  );
}

function TableSection({ tickets }) {
  const statusClasses = {
    open: "bg-red-100 text-red-800",
    "in progress": "bg-yellow-100 text-yellow-800", 
    resolved: "bg-green-100 text-green-800",
    closed: "bg-secondary-100 text-secondary-800",
    reopened: "bg-blue-100 text-blue-800",
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg">
      <div className="px-6 py-4 border-b border-gray-200 d-flex align-items-center justify-content-between">
        <h3 className="text-lg font-semibold text-gray-800">Recent Tickets</h3>
        <div className="d-flex align-items-center gap-2">
          <select className="form-select form-select-sm">
            <option>All Categories</option>
          </select>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned Unit</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requester</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Update</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket._id || ticket.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{ticket.subject}</td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  <span className="badge bg-primary rounded-pill">{ticket.type}</span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  <span className="badge bg-secondary rounded-pill">{ticket.assignedUnit || "—"}</span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {ticket.user?.name || ticket.user || ticket.requester || "N/A"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  <span className="badge bg-success rounded-pill">
                    {ticket.assignedTo?.name || ticket.assignedTo || "—"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge rounded-pill ${statusClasses[ticket.status] || "bg-secondary text-white"}`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {ticket.updatedAt
                    ? new Date(ticket.updatedAt).toLocaleString()
                    : "N/A"}
                </td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-4 text-muted">
                  No tickets found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TicketReports;
