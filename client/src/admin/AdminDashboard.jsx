
import React, { useEffect, useState, useCallback } from "react";
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

const sampleTickets = [
  { id: "ICT-2024-001", subject: "Printer not working", user: "Sarah Johnson", category: "Hardware", priority: "High", status: "Open" },
  { id: "ICT-2024-002", subject: "Email server down", user: "Mike Chen", category: "Network", priority: "Critical", status: "In Progress" },
  { id: "ICT-2024-003", subject: "Software installation", user: "Lisa Wong", category: "Software", priority: "Medium", status: "Resolved" },
  { id: "ICT-2024-004", subject: "Password reset request", user: "David Brown", category: "Security", priority: "Low", status: "Open" },
  { id: "ICT-2024-005", subject: "Network connectivity issue", user: "Emma Davis", category: "Network", priority: "High", status: "In Progress" },
];

// Priority badge classes
const priorityClasses = {
  Low: "bg-green-100 text-green-800",
  Medium: "bg-yellow-100 text-yellow-800",
  High: "bg-red-100 text-red-800",
  Critical: "bg-red-200 text-red-900",
};

// Status badge classes
const statusClasses = {
  Open: "bg-red-100 text-red-800",
  "In Progress": "bg-yellow-100 text-yellow-800",
  Resolved: "bg-green-100 text-green-800",
};

function AdminDashboard() {
  // Stats state - In real app, fetch these
  const [stats, setStats] = useState({
    openTickets: 23,
    inProgressTickets: 47,
    resolvedToday: 34,
    avgResponseTime: 1.2, // in hours
  });

  // Tickets data state
  const [tickets, setTickets] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  // Sort tickets function
  const sortTickets = useCallback((key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  // Sorted tickets memoization
  const sortedTickets = React.useMemo(() => {
    if (!sortConfig.key) return tickets;
    const sorted = [...tickets].sort((a, b) => {
      const aVal = a[sortConfig.key] ?? "";
      const bVal = b[sortConfig.key] ?? "";
      if (aVal < bVal) return sortConfig.direction === "ascending" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "ascending" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [tickets, sortConfig]);

  // Simulate fetching ticket data for table (replace with API)
  useEffect(() => {
    // In real app, fetch from API:
    // fetch('/api/admin/tickets/recent').then(...).then(setTickets)
    setTickets(sampleTickets);
  }, []);

  // Charts Data

  // Ticket Trends Chart (Line chart)
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

  // Category Breakdown (Doughnut)
  const categoryData = {
    labels: ["Hardware", "Software", "Network", "Security", "Mobile", "Training"],
    datasets: [
      {
        data: [30, 25, 20, 15, 7, 3],
        backgroundColor: [
          "#ef4444",
          "#f59e0b",
          "#3b82f6",
          "#8b5cf6",
          "#10b981",
          "#f97316",
        ],
        hoverOffset: 20,
      },
    ],
  };
  const categoryOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
      tooltip: { enabled: true }
    },
  };

  // Priority Distribution (Bar)
  const priorityData = {
    labels: ["Low", "Medium", "High", "Critical"],
    datasets: [
      {
        label: "Tickets",
        data: [15, 35, 25, 8],
        backgroundColor: [
          "#10b981",
          "#f59e0b",
          "#ef4444",
          "#7c2d12",
        ],
      },
    ],
  };
  const priorityOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  };

  // Table sorting helper
  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return "";
    return sortConfig.direction === "ascending" ? "▲" : "▼";
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-400 text-white shadow-lg rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">🏛️</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-blue-200 text-sm">ICT Helpdesk Management System</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative text-white hover:text-blue-200 transition-colors">
              🔔
              <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-300 rounded-full flex items-center justify-center">
                <span className="text-blue-800 font-semibold text-sm">JS</span>
              </div>
              <span className="text-sm">John Smith</span>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Open Tickets"
          count={stats.openTickets}
          change="+5 from yesterday"
          icon="🔴"
          iconBg="bg-red-100"
          iconColor="text-red-600"
          countColor="text-red-600"
        />
        <StatCard
          title="In Progress"
          count={stats.inProgressTickets}
          change="-2 from yesterday"
          icon="🟡"
          iconBg="bg-yellow-100"
          iconColor="text-yellow-600"
          countColor="text-yellow-600"
        />
        <StatCard
          title="Resolved Today"
          count={stats.resolvedToday}
          change="+12 from yesterday"
          icon="✅"
          iconBg="bg-green-100"
          iconColor="text-green-600"
          countColor="text-green-600"
        />
        <StatCard
          title="Avg Response Time"
          count={`${stats.avgResponseTime}h`}
          change="-0.3h improvement"
          icon="⏱️"
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          countColor="text-blue-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard title="Ticket Trends (Last 7 Days)">
          <Line data={ticketTrendsData} options={ticketTrendsOptions} />
        </ChartCard>
        <ChartCard title="Tickets by Category">
          <Doughnut data={categoryData} options={categoryOptions} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <ChartCard title="Priority Distribution">
          <Bar data={priorityData} options={priorityOptions} />
        </ChartCard>

        {/* System Status Box */}
        <div className="bg-white rounded-lg shadow-md p-6 fade-in">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">System Status</h3>
          <SystemStatus />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 fade-in">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <QuickActions />
        </div>
      </div>

      {/* Recent Tickets Table */}
      <TableSection
        tickets={sortedTickets}
        onSort={sortTickets}
        getSortIndicator={getSortIndicator}
      />
      
      {/* Team Performance Section (Static Data for demo) */}
      <TeamPerformanceSection />
    </div>
  );
}

function StatCard({ title, count, change, icon, iconBg, iconColor, countColor }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 card-hover fade-in flex justify-between items-center">
      <div>
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <p className={`text-3xl font-bold ${countColor}`}>{count}</p>
        <p className="text-sm text-gray-500 mt-1">{change}</p>
      </div>
      <div className={`w-12 h-12 ${iconBg} rounded-full flex items-center justify-center`}>
        <span className={`${iconColor} text-2xl`}>{icon}</span>
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 fade-in">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="chart-container">{children}</div>
    </div>
  );
}

function SystemStatus() {
  const statuses = [
    { label: "Email Server", color: "bg-green-500", status: "Online", statusClass: "status-online" },
    { label: "Database", color: "bg-green-500", status: "Online", statusClass: "status-online" },
    { label: "File Storage", color: "bg-yellow-500", status: "Warning", statusClass: "status-warning" },
    { label: "Backup System", color: "bg-green-500", status: "Online", statusClass: "status-online" },
  ];
  return (
    <div className="space-y-4">
      {statuses.map(({ label, color, status, statusClass }) => (
        <div key={label} className="flex items-center justify-between">
          <span className="text-gray-600">{label}</span>
          <div className="flex items-center space-x-2">
            <div className={`${color} w-3 h-3 rounded-full pulse-dot`}></div>
            <span className={`text-sm ${statusClass}`}>{status}</span>
          </div>
        </div>
      ))}
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

function TableSection({ tickets, onSort, getSortIndicator }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8 fade-in">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Recent Tickets</h3>
        <div className="flex items-center space-x-2">
          <select className="border border-gray-300 rounded px-3 py-1 text-sm">
            <option>All Categories</option>
            <option>Hardware</option>
            <option>Software</option>
            <option>Network</option>
          </select>
          <button
            onClick={() => alert("Refreshing tickets...")}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {[
                { label: "Ticket ID", key: "id" },
                { label: "Subject", key: "subject" },
                { label: "User", key: "user" },
                { label: "Category", key: "category" },
                { label: "Priority", key: "priority" },
                { label: "Status", key: "status" },
              ].map(({ label, key }) => (
                <th
                  key={key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sortable"
                  onClick={() => onSort(key)}
                >
                  {label} {getSortIndicator(key)}
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ticket.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ticket.subject}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ticket.user}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ticket.category}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      priorityClasses[ticket.priority] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      statusClasses[ticket.status] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {ticket.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => alert(`Opening ticket ${ticket.id} details...`)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    View
                  </button>
                  <button
                    onClick={() => alert(`Assigning ticket ${ticket.id} to team member...`)}
                    className="text-green-600 hover:text-green-900"
                  >
                    Assign
                  </button>
                </td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500">
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

function TeamPerformanceSection() {
  // Static demo data
  const teamMembers = [
    {
      initials: "JS",
      name: "John Smith",
      position: "Senior Technician",
      assigned: 15,
      resolved: 12,
      avgResponse: "1.2h",
      rating: 4.8,
      status: "Online",
    },
    {
      initials: "MJ",
      name: "Mary Johnson",
      position: "Network Specialist",
      assigned: 18,
      resolved: 16,
      avgResponse: "0.9h",
      rating: 4.9,
      status: "Online",
    },
    {
      initials: "RW",
      name: "Robert Wilson",
      position: "Hardware Technician",
      assigned: 12,
      resolved: 10,
      avgResponse: "1.5h",
      rating: 4.6,
      status: "Away",
    },
  ];

  const statusColors = {
    Online: "bg-green-100 text-green-800",
    Away: "bg-yellow-100 text-yellow-800",
    Offline: "bg-red-100 text-red-800",
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden fade-in">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Team Performance</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team Member
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Resolved
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Response
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {teamMembers.map(({ initials, name, position, assigned, resolved, avgResponse, rating, status }) => (
              <tr key={name}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {initials}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{name}</div>
                      <div className="text-sm text-gray-500">{position}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{assigned}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{resolved}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{avgResponse}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-900">{rating}</span>
                    <div className="ml-1 text-yellow-400">{"⭐".repeat(Math.round(rating))}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || "bg-gray-100 text-gray-800"}`}
                  >
                    {status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;
=======
// client/src/admin/AdminDashboard.jsx
// (Admin Dashboard)
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import AllTickets from "../Data/AllTickets.jsx";
import TicketReply from "./adminTicketReply.jsx"; // Path confirmed from previous steps

function AdminDashboard({ token }) {
    const { statusFilter: urlStatusFilter, id: ticketIdFromUrl } = useParams(); // Get statusFilter and ticketId from URL
    const navigate = useNavigate();

    // Normalize the URL parameter for filtering AllTickets
    const normalizedUrlStatusFilter = urlStatusFilter ?
        urlStatusFilter.replace('-', ' ').toLowerCase() :
        "all";

    // For display purposes in the AllTickets component header/dropdown
    const displayStatusFilter = normalizedUrlStatusFilter === "all" ? "All" : normalizedUrlStatusFilter;

    console.log("AdminDashboard: urlStatusFilter from URL:", urlStatusFilter);
    console.log("AdminDashboard: ticketIdFromUrl from URL:", ticketIdFromUrl);
    console.log("AdminDashboard: Passing initialStatusFilter to AllTickets (for logic):", normalizedUrlStatusFilter);
    console.log("AdminDashboard: Passing displayStatusFilter to AllTickets (for UI):", displayStatusFilter);

    // We no longer need selectedTicket state in AdminDashboard for TicketReply
    // const [selectedTicket, setSelectedTicket] = useState(null); // REMOVED
    const [refresh, setRefresh] = useState(0); // Still used for AllTickets refresh

    // No need to reset selectedTicket here anymore, as TicketReply will fetch its own data
    // useEffect(() => {
    //     setSelectedTicket(null);
    // }, [normalizedUrlStatusFilter]);

    // handleTicketUpdate is still relevant if AllTickets needs to refresh after a reply
    const handleTicketUpdate = () => {
        // This function will now just trigger a refresh of the AllTickets list
        // after a ticket has been updated (e.g., replied to, resolved).
        setRefresh((r) => r + 1);
        // We don't need to update selectedTicket here anymore as TicketReply manages its own state
    };

    const handleSelectTicket = (ticket) => {
        console.log("AdminDashboard: Ticket selected via onSelect (navigating to reply page):", ticket);
        // Navigate to the specific ticket reply page using its ID
        navigate(`/admin/tickets/${ticket._id}/reply`);
    };

    const handleBackToList = () => {
        console.log("AdminDashboard: Back to list clicked. Navigating to:", `/admin/tickets/${urlStatusFilter || 'all'}`);
        // Navigate back to the appropriate filtered list based on the original URL filter
        navigate(`/admin/tickets/${urlStatusFilter || 'all'}`);
        // Ensure the AllTickets component refreshes when returning to the list
        setRefresh((r) => r + 1);
    };

    // Determine which component to render based on whether a ticket ID is present in the URL
    // If ticketIdFromUrl exists, render TicketReply; otherwise, render AllTickets.
    return (
        <div>
            {ticketIdFromUrl ? (
                // Render TicketReply, passing the ID from the URL
                <TicketReply
                    token={token}
                    ticketId={ticketIdFromUrl} // Pass the ID from the URL
                    onBack={handleBackToList}
                    onTicketUpdate={handleTicketUpdate}
                />
            ) : (
                // Render AllTickets
                <AllTickets
                    token={token}
                    onSelect={handleSelectTicket}
                    refresh={refresh}
                    initialStatusFilter={normalizedUrlStatusFilter}
                    displayStatusFilter={displayStatusFilter}
                />
            )}
        </div>
    );
}

export default AdminDashboard;

