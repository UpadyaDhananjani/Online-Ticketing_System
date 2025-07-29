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
  getTicketsByUnit,
  getRecentTickets,
  getAssigneePerformance
} from "../api/ticketApi";
import DarkModeToggle from "../components/DarkModeToggle";
import TicketsByUnitChart from "./TicketsByUnitChart";

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
  const [priorityData, setPriorityData] = useState({ labels: [], datasets: [] });
  const [teamPerformance, setTeamPerformance] = useState([]);

  useEffect(() => {
    // Fetch recent tickets
    getRecentTickets().then(setTickets);

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
    });

    // Fetch priority distribution
    getTicketStatusDistribution().then(data => {
      setPriorityData({
        labels: data.map(d => d.priority),
        datasets: [{
          label: "Tickets",
          data: data.map(d => d.count),
          backgroundColor: [
            "#10b981", "#f59e0b", "#ef4444", "#7c2d12"
          ],
        }]
      });
    });

    // Fetch team performance
    getAssigneePerformance().then(setTeamPerformance);

    // Fetch stats (example, you may need a separate endpoint)
    // getAdminTicketsSummary().then(setStats);
  }, []);

  // Ticket Trends Chart (Line chart) - static demo data
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

  const priorityOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
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
      
      {/* Header - Make it darker */}
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

      <DarkModeToggle />

      {/* Stats Cards - Darker theme */}
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

      {/* Charts Section - Both cards smaller and side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-700 rounded-lg shadow-md p-4 fade-in transition-colors duration-200 dark:border dark:border-slate-600">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-3">Ticket Trends (Last 7 Days)</h3>
          <div style={{ height: "200px" }}>
            <Line data={ticketTrendsData} options={ticketTrendsOptions} />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-700 rounded-lg shadow-md p-4 fade-in transition-colors duration-200 dark:border dark:border-slate-600">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-3">Tickets by Category</h3>
          <div style={{ height: "200px" }}>
            <Doughnut data={categoryData} options={categoryOptions} />
          </div>
        </div>
      </div>

      {/* Keep the unit chart and priority distribution in their own row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard title="Tickets by Unit/Team">
          <TicketsByUnitChart />
        </ChartCard>
        <ChartCard title="Priority Distribution">
          <Bar data={priorityData} options={priorityOptions} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* System Status Box */}
        <div className="bg-white dark:bg-slate-700 rounded-lg shadow-md p-6 fade-in dark:border dark:border-slate-600">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-4">System Status</h3>
          <SystemStatus />
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-700 rounded-lg shadow-md p-6 fade-in dark:border dark:border-slate-600">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-4">Quick Actions</h3>
          <QuickActions />
        </div>
      </div>

      {/* Recent Tickets Table */}
      <TableSection tickets={tickets} />

      {/* Team Performance Section */}
      <TeamPerformanceSection teamPerformance={teamPerformance} />
    </div>
  );
}

function StatCard({ title, count, change, icon, iconBg, iconColor, countColor }) {
  return (
    <div className="bg-white dark:bg-slate-700 rounded-lg shadow-md p-6 card-hover fade-in flex justify-between items-center transition-colors duration-200 dark:border dark:border-slate-600">
      <div>
        <p className="text-gray-600 dark:text-slate-300 text-sm font-medium">{title}</p>
        <p className={`text-3xl font-bold dark:text-white ${countColor}`}>{count}</p>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{change}</p>
      </div>
      <div className={`w-12 h-12 ${iconBg} dark:bg-slate-600 rounded-full flex items-center justify-center`}>
        <span className={`${iconColor} dark:text-slate-200 text-2xl`}>{icon}</span>
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white dark:bg-slate-700 rounded-lg shadow-md p-6 fade-in transition-colors duration-200 dark:border dark:border-slate-600">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-4">{title}</h3>
      <div className="chart-container">{children}</div>
    </div>
  );
}

function SystemStatus() {
  const statuses = [
    { label: "Email Server", color: "bg-green-500", status: "Online", statusClass: "text-green-400" },
    { label: "Database", color: "bg-green-500", status: "Online", statusClass: "text-green-400" },
    { label: "File Storage", color: "bg-yellow-500", status: "Warning", statusClass: "text-yellow-400" },
    { label: "Backup System", color: "bg-green-500", status: "Online", statusClass: "text-green-400" },
  ];
  return (
    <div className="space-y-4">
      {statuses.map(({ label, color, status, statusClass }) => (
        <div key={label} className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-slate-300">{label}</span>
          <div className="flex items-center space-x-2">
            <div className={`${color} w-3 h-3 rounded-full pulse-dot`}></div>
            <span className={`text-sm dark:${statusClass} ${statusClass}`}>{status}</span>
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

// TableSection: Add dark mode classes
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Ticket ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-700 divide-y divide-gray-200 dark:divide-slate-600">
            {tickets.map((ticket) => (
              <tr key={ticket._id || ticket.id} className="dark:hover:bg-slate-600">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-200">{ticket.ticketId || ticket.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">{ticket.subject}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">{ticket.user?.name || ticket.user || ticket.requester}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">{ticket.category || ticket.type}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityClasses[ticket.priority] || "bg-gray-100 dark:bg-slate-600 text-gray-800 dark:text-slate-200"}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[ticket.status] || "bg-gray-100 dark:bg-slate-600 text-gray-800 dark:text-slate-200"}`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3">
                    View
                  </button>
                  <button className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300">
                    Assign
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// TeamPerformanceSection: Add dark mode classes
function TeamPerformanceSection({ teamPerformance }) {
  const statusColors = {
    Online: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300",
    Away: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300",
    Offline: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300",
  };

  return (
    <div className="bg-white dark:bg-slate-700 rounded-lg shadow-md overflow-hidden fade-in transition-colors duration-200 dark:border dark:border-slate-600">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-600">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200">Team Performance</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-slate-600">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Team Member</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Assigned</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Resolved</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Avg Response</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-700 divide-y divide-gray-200 dark:divide-slate-600">
            {teamPerformance.map((member, idx) => (
              <tr key={member._id || idx} className="dark:hover:bg-slate-600">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {member.initials || (member.name ? member.name.split(" ").map(n => n[0]).join("") : "TM")}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-slate-200">{member.name || member._id || "Unknown"}</div>
                      <div className="text-sm text-gray-500 dark:text-slate-400">{member.position || ""}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">{member.assigned}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">{member.resolved}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">{member.avgResponse || "-"}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-900 dark:text-slate-300">{member.rating || "-"}</span>
                    <div className="ml-1 text-yellow-400">{"⭐".repeat(Math.round(member.rating || 0))}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[member.status] || "bg-gray-100 dark:bg-slate-600 text-gray-800 dark:text-slate-200"}`}>
                    {member.status || "Unknown"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {teamPerformance.length === 0 && (
        <div className="px-6 py-4">
          <div className="text-center text-gray-500 dark:text-slate-400">
            No team performance data found.
          </div>
        </div>
      )}
    </div>
  );
}




export default AdminDashboard;