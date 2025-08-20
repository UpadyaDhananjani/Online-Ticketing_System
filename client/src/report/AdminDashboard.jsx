import React, { useEffect, useState } from "react";
import {
  Bar,
  Doughnut,
  Line
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
  getTicketStatusDistribution,
  getTicketTypeDistribution,
  getRecentTickets,
  getAssigneePerformance
} from "../api/ticketApi";
import { Container, Row, Col } from "react-bootstrap";
import { BsCheck2Circle } from "react-icons/bs";

import TicketsByUnitChart from "./TicketsByUnitChart";
import AssigneePerformanceTable from "./AssigneePerformanceTable";
import PriorityChart from "./PriorityChart";

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

const priorityClasses = {
  Low: "bg-green-100 text-green-800",
  Medium: "bg-yellow-100 text-yellow-800",
  High: "bg-red-100 text-red-800",
  Critical: "bg-red-200 text-red-900",
};

const statusClasses = {
  Open: "bg-red-100 text-red-800",
  "In Progress": "bg-yellow-100 text-yellow-800",
  Resolved: "bg-green-100 text-green-800",
};

function AdminDashboard() {
  const [stats, setStats] = useState({
    openTickets: 0,
    inProgressTickets: 0,
    resolvedToday: 0,
    avgResponseTime: 0,
  });
  const [tickets, setTickets] = useState([]);
  const [categoryData, setCategoryData] = useState({ labels: [], datasets: [] });
  const [teamPerformance, setTeamPerformance] = useState([]);

  useEffect(() => {
    // Fetch recent tickets
    getRecentTickets().then(setTickets).catch(console.error);

    // Fetch category breakdown
    getTicketTypeDistribution().then(data => {
      setCategoryData({
        labels: data.map(d => d.type),
        datasets: [{
          data: data.map(d => d.count),
          backgroundColor: [
            "#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6", "#10b981", "#f97316"
          ],
          hoverOffset: 20,
        }]
      });
    }).catch(console.error);

    // Fetch team performance
    getAssigneePerformance().then(setTeamPerformance).catch(console.error);
  }, []);

  // Real-time stats fetch every 30 seconds
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/tickets/summary");
        if (!res.ok) return;
        const data = await res.json();
        setStats({
          openTickets: data.open || 0,
          inProgressTickets: data.inProgress || 0,
          resolvedToday: data.resolved || 0,
          avgResponseTime: data.avgResponseTime || 0,
        });
      } catch {
        // Silent catch or add error handling as needed
      }
    };

    fetchStats();
    const intervalId = setInterval(fetchStats, 30000);
    return () => clearInterval(intervalId);
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
    plugins: {
      legend: { position: "bottom" },
      tooltip: { enabled: true }
    },
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-6 transition-colors duration-200">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-400 dark:from-slate-800 dark:to-slate-700 text-white shadow-lg rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-white dark:bg-slate-600 rounded-full flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-300 font-bold text-lg">🏛️</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-blue-200 dark:text-slate-300 text-sm">ICT Helpdesk Management System</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <Container className="py-4">
        <div className="text-center mb-4">
          <h2 className="fw-bold mb-1" style={{ color: '#1a2233', fontSize: 32 }}>Current Ticket Status</h2>
          <div className="text-muted" style={{ fontSize: 18 }}>Real-time overview of helpdesk tickets</div>
        </div>
        <Row className="justify-content-center g-4 mb-5">
          {/* Open Issues Card */}
          <Col xs={12} md={4}>
            <StatusCard
              count={stats.openTickets}
              label="Open Issues"
              description="Awaiting assignment"
              colorBg="#fff5f5"
              borderColor="#f87171"
              textColor="#e11d48"
            />
          </Col>
          {/* In Progress Issues Card */}
          <Col xs={12} md={4}>
            <StatusCard
              count={stats.inProgressTickets}
              label="In Progress Issues"
              description="Being worked on"
              colorBg="#fffae6"
              borderColor="#fbbf24"
              textColor="#f59e1b"
            />
          </Col>
          {/* Resolved Issues Card */}
          <Col xs={12} md={4}>
            <StatusCard
              count={stats.resolvedToday}
              label="Resolved Issues"
              description="This month"
              colorBg="#f0fdf4"
              borderColor="#22c55e"
              textColor="#16a34a"
              icon={<BsCheck2Circle size={28} color="#16a34a" />}
            />
          </Col>
        </Row>
      </Container>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChartCard title="Ticket Trends (Last 7 Days)">
          <div style={{ height: "300px" }}>
            <Line data={ticketTrendsData} options={ticketTrendsOptions} />
          </div>
        </ChartCard>
        <ChartCard title="Tickets by Category">
          <div style={{ height: "320px" }} className="flex items-center justify-center">
            <Doughnut data={categoryData} options={categoryOptions} />
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard title="Tickets by Unit/Team">
          <TicketsByUnitChart />
        </ChartCard>
        <ChartCard title="Priority Distribution">
          <PriorityChart />
        </ChartCard>
      </div>

      {/* Quick Actions */}
      {/* <div className="bg-white dark:bg-slate-700 rounded-lg shadow-md p-6 fade-in dark:border dark:border-slate-600 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-4">Quick Actions</h3>
        <QuickActions />
      </div> */}

      {/* Recent Tickets Table */}
      <TableSection tickets={tickets} />

      {/* Assignee Performance Section */}
      <AssigneePerformanceTable data={teamPerformance} />
    </div>
  );
}

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
    <div className="bg-white dark:bg-slate-700 rounded-lg shadow-md p-6 fade-in transition-colors duration-200 dark:border dark:border-slate-600">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-4">{title}</h3>
      <div className="chart-container">{children}</div>
    </div>
  );
}

function QuickActions() {
  return (
    <div className="space-y-3">
      <button
        onClick={() => alert("Opening ticket assignment interface...")}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Assign Tickets
      </button>
      <button
        onClick={() => alert("Opening announcement composer...")}
        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
      >
        Send Announcement
      </button>
      <button
        onClick={() => alert("Generating performance report...")}
        className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
      >
        Generate Report
      </button>
      <button
        onClick={() => alert("Opening user management panel...")}
        className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors"
      >
        Manage Users
      </button>
    </div>
  );
}

function TableSection({ tickets }) {
  return (
    <div className="bg-white dark:bg-slate-700 rounded-lg shadow-md overflow-hidden mb-8 fade-in transition-colors duration-200 dark:border dark:border-slate-600">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-600 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200">Recent Tickets</h3>
        <div className="flex items-center space-x-2">
          <select className="border border-gray-300 dark:border-slate-500 dark:bg-slate-600 dark:text-slate-200 rounded px-3 py-1 text-sm">
            <option>All Categories</option>
          </select>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 dark:bg-blue-700 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-slate-600">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Assigned Unit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Requester</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Assigned To</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Last Update</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-700 divide-y divide-gray-200 dark:divide-slate-600">
            {tickets.map((ticket) => (
              <tr key={ticket._id || ticket.id} className="dark:hover:bg-slate-600">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">{ticket.subject}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                    {ticket.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-slate-600 dark:text-slate-200">
                    {ticket.assignedUnit || "—"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">
                  {ticket.user?.name || ticket.user || ticket.requester || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    {ticket.assignedTo?.name || ticket.assignedTo || "—"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      statusClasses[ticket.status] || "bg-gray-100 dark:bg-slate-600 text-gray-800 dark:text-slate-200"
                    }`}
                  >
                    {ticket.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">
                  {ticket.updatedAt
                    ? new Date(ticket.updatedAt).toLocaleString()
                    : "N/A"}
                </td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500 dark:text-slate-400">
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

export default AdminDashboard;
