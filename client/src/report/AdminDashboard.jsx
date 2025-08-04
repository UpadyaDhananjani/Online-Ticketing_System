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
import { Container, Row, Col } from "react-bootstrap";
import { BsCheck2Circle } from "react-icons/bs";
import { toast } from "react-toastify"; // Import toast

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
    Low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    High: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    Critical: "bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100",
};

const statusClasses = {
    Open: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    "In Progress": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    Resolved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    Closed: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300", // Added closed status
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
        getRecentTickets().then(setTickets).catch(err => console.error("Error fetching recent tickets:", err));

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
        }).catch(err => console.error("Error fetching ticket type distribution:", err));

        // Fetch priority distribution (assuming status distribution is used for priority)
        getTicketStatusDistribution().then(data => {
            setPriorityData({
                labels: data.map(d => d.status), // Using status as priority for demo
                datasets: [{
                    label: "Tickets",
                    data: data.map(d => d.count),
                    backgroundColor: [
                        "#10b981", "#f59e0b", "#ef4444", "#7c2d12"
                    ],
                }]
            });
        }).catch(err => console.error("Error fetching ticket status distribution:", err));

        // Fetch team performance
        getAssigneePerformance().then(setTeamPerformance).catch(err => console.error("Error fetching assignee performance:", err));

    }, []);

    // Real-time stats fetch
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/tickets/summary"); // Ensure this endpoint exists
                if (!res.ok) {
                    console.error("Failed to fetch summary stats:", res.status);
                    return;
                }
                const data = await res.json();
                setStats({
                    openTickets: data.open || 0,
                    inProgressTickets: data.inProgress || 0,
                    resolvedToday: data.resolved || 0,
                    avgResponseTime: data.avgResponseTime || 0,
                });
            } catch (err) {
                console.error("Error fetching summary stats:", err);
            }
        };

        fetchStats();
        const intervalId = setInterval(fetchStats, 30000);
        return () => clearInterval(intervalId);
    }, []);

    // Ticket Trends Chart (Line chart) - static demo data
    const ticketTrendsData = {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
            {
                label: "New Tickets",
                data: [12, 19, 15, 25, 22, 18, 24],
                borderColor: "var(--primary-color)", // Use theme variable
                backgroundColor: "rgba(59, 130, 246, 0.1)", // Assuming a default blue for rgba
                tension: 0.4,
                fill: true,
                pointRadius: 4,
            },
            {
                label: "Resolved",
                data: [8, 15, 18, 20, 25, 22, 28],
                borderColor: "var(--status-resolved-text)", // Use theme variable
                backgroundColor: "rgba(16, 185, 129, 0.1)", // Assuming a default green for rgba
                tension: 0.4,
                fill: true,
                pointRadius: 4,
            },
        ],
    };
    const ticketTrendsOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
                labels: {
                    color: 'var(--text-color)', // Theme legend text
                },
            },
            tooltip: { mode: "index", intersect: false }
        },
        interaction: { mode: "nearest", axis: "x", intersect: false },
        scales: {
            x: {
                ticks: {
                    color: 'var(--text-color-secondary)', // Theme x-axis ticks
                },
                grid: {
                    color: 'var(--border-color)', // Theme grid lines
                    drawBorder: false,
                },
            },
            y: {
                beginAtZero: true,
                ticks: {
                    color: 'var(--text-color-secondary)', // Theme y-axis ticks
                },
                grid: {
                    color: 'var(--border-color)', // Theme grid lines
                },
            },
        },
    };

    const priorityOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
                labels: {
                    color: 'var(--text-color)',
                },
            },
            title: {
                display: true,
                text: 'Priority Distribution', // Add title for clarity
                color: 'var(--heading-color)',
                font: {
                    size: 18,
                },
            },
        },
        scales: {
            x: {
                ticks: {
                    color: 'var(--text-color-secondary)',
                },
                grid: {
                    color: 'var(--border-color)',
                    drawBorder: false,
                },
            },
            y: {
                beginAtZero: true,
                ticks: {
                    color: 'var(--text-color-secondary)',
                },
                grid: {
                    color: 'var(--border-color)',
                },
            },
        },
    };

    const categoryOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    color: 'var(--text-color)', // Theme legend text
                },
            },
            tooltip: { enabled: true },
            title: {
                display: true,
                text: 'Tickets by Category', // Add title for clarity
                color: 'var(--heading-color)',
                font: {
                    size: 18,
                },
            },
        },
    };

    return (
        <div className="bg-background-color min-h-screen p-6 transition-colors duration-200">
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

            {/* Main Dashboard Content from adminHome.jsx */}
            <Container className="py-4">
                <div className="text-center mb-4">
                    <h2 className="fw-bold mb-1 text-heading-color text-3xl">Current Ticket Status</h2>
                    <div className="text-text-muted-color text-lg">Real-time overview of helpdesk tickets</div>
                </div>
                <Row className="justify-content-center g-4 mb-5">
                    {/* Open Issues Card */}
                    <Col xs={12} md={4}>
                        <div className="h-100 p-4 d-flex flex-row align-items-center justify-content-between rounded-3 shadow-sm transition-colors duration-300"
                            style={{ background: 'var(--status-open-bg)', borderLeft: '6px solid var(--status-open-border)', minHeight: 140 }}>
                            <div>
                                <div className="fw-bold text-4xl leading-none" style={{ color: 'var(--status-open-text)' }}>{stats.openTickets}</div>
                                <div className="fw-bold text-xl text-text-color">Open Issues</div>
                                <div className="text-text-muted-color text-base">Awaiting assignment</div>
                            </div>
                            <span className="d-inline-block ms-3 w-10 h-10 rounded-full"
                                style={{
                                    background: 'radial-gradient(circle at 30% 30%, var(--status-open-border) 60%, var(--status-open-text) 100%)',
                                    boxShadow: '0 2px 8px rgba(249, 113, 113, 0.15)'
                                }}></span>
                        </div>
                    </Col>
                    {/* In Progress Issues Card */}
                    <Col xs={12} md={4}>
                        <div className="h-100 p-4 d-flex flex-row align-items-center justify-content-between rounded-3 shadow-sm transition-colors duration-300"
                            style={{ background: 'var(--status-inprogress-bg)', borderLeft: '6px solid var(--status-inprogress-border)', minHeight: 140 }}>
                            <div>
                                <div className="fw-bold text-4xl leading-none" style={{ color: 'var(--status-inprogress-text)' }}>{stats.inProgressTickets}</div>
                                <div className="fw-bold text-xl text-text-color">In Progress Issues</div>
                                <div className="text-text-muted-color text-base">Being worked on</div>
                            </div>
                            <span className="d-inline-block ms-3 w-10 h-10 rounded-full"
                                style={{
                                    background: 'radial-gradient(circle at 30% 30%, var(--status-inprogress-border) 60%, var(--status-inprogress-text) 100%)',
                                    boxShadow: '0 2px 8px rgba(251, 191, 36, 0.13)'
                                }}></span>
                        </div>
                    </Col>
                    {/* Resolved Issues Card */}
                    <Col xs={12} md={4}>
                        <div className="h-100 p-4 d-flex flex-row align-items-center justify-content-between rounded-3 shadow-sm transition-colors duration-300"
                            style={{ background: 'var(--status-resolved-bg)', borderLeft: '6px solid var(--status-resolved-border)', minHeight: 140 }}>
                            <div>
                                <div className="fw-bold text-4xl leading-none" style={{ color: 'var(--status-resolved-text)' }}>{stats.resolvedToday}</div>
                                <div className="fw-bold text-xl text-text-color">Resolved Issues</div>
                                <div className="text-text-muted-color text-base">This month</div>
                            </div>
                            <span className="d-inline-flex align-items-center justify-content-center ms-3 w-10 h-10 rounded-full"
                                style={{
                                    background: 'linear-gradient(135deg, var(--status-resolved-border) 60%, var(--status-resolved-text) 100%)',
                                    boxShadow: '0 2px 8px rgba(34, 197, 94, 0.13)'
                                }}>
                                <BsCheck2Circle size={28} color="var(--status-resolved-text)" />
                            </span>
                        </div>
                    </Col>
                </Row>
            </Container>

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

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <div className="bg-card-background rounded-lg shadow-md p-3 fade-in transition-colors duration-200 dark:border dark:border-slate-600">
                    <h3 className="text-lg font-semibold text-heading-color mb-2">Ticket Trends (Last 7 Days)</h3>
                    <div style={{ height: "300px" }}>
                        <Line data={ticketTrendsData} options={ticketTrendsOptions} />
                    </div>
                </div>
                <div className="bg-card-background rounded-lg shadow-md p-3 fade-in transition-colors duration-200 dark:border dark:border-slate-600">
                    <h3 className="text-lg font-semibold text-heading-color mb-2">Tickets by Category</h3>
                    <div style={{ height: "320px" }}
                        className="flex items-center justify-center">
                        <Doughnut data={categoryData} options={categoryOptions} />
                    </div>
                </div>
            </div>

            {/* Unit chart and priority distribution */}
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
                <div className="bg-card-background rounded-lg shadow-md p-6 fade-in dark:border dark:border-slate-600">
                    <h3 className="text-lg font-semibold text-heading-color mb-4">System Status</h3>
                    <SystemStatus />
                </div>

                {/* Quick Actions */}
                <div className="bg-card-background rounded-lg shadow-md p-6 fade-in dark:border dark:border-slate-600">
                    <h3 className="text-lg font-semibold text-heading-color mb-4">Quick Actions</h3>
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
        <div className="bg-card-background rounded-lg shadow-md p-6 card-hover fade-in flex justify-between items-center transition-colors duration-200 dark:border dark:border-slate-600">
            <div>
                <p className="text-text-muted-color text-sm font-medium">{title}</p>
                <p className={`text-3xl font-bold text-text-color ${countColor}`}>{count}</p>
                <p className="text-sm text-text-muted-color mt-1">{change}</p>
            </div>
            <div className={`w-12 h-12 ${iconBg} dark:bg-slate-600 rounded-full flex items-center justify-center`}>
                <span className={`${iconColor} dark:text-slate-200 text-2xl`}>{icon}</span>
            </div>
        </div>
    );
}

function ChartCard({ title, children }) {
    return (
        <div className="bg-card-background rounded-lg shadow-md p-6 fade-in transition-colors duration-200 dark:border dark:border-slate-600">
            <h3 className="text-lg font-semibold text-heading-color mb-4">{title}</h3>
            <div className="chart-container">{children}</div>
        </div>
    );
}

function SystemStatus() {
    const statuses = [
        { label: "Email Server", color: "bg-green-500", status: "Online", statusClass: "text-green-500" },
        { label: "Database", color: "bg-green-500", status: "Online", statusClass: "text-green-500" },
        { label: "File Storage", color: "bg-yellow-500", status: "Warning", statusClass: "text-yellow-500" },
        { label: "Backup System", color: "bg-green-500", status: "Online", statusClass: "text-green-500" },
    ];
    return (
        <div className="space-y-4">
            {statuses.map(({ label, color, status, statusClass }) => (
                <div key={label} className="flex items-center justify-between">
                    <span className="text-text-color">{label}</span>
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
                onClick={() => toast.info("Opening ticket assignment interface...")}
                className="w-full bg-primary-color text-white py-2 px-4 rounded-lg hover:bg-primary-color-hover transition-colors"
            >
                Assign Tickets
            </button>
            <button
                onClick={() => toast.info("Opening announcement composer...")}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
                Send Announcement
            </button>
            <button
                onClick={() => toast.info("Generating performance report...")}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
                Generate Report
            </button>
            <button
                onClick={() => toast.info("Opening user management panel...")}
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
        <div className="bg-card-background rounded-lg shadow-md overflow-hidden mb-8 fade-in transition-colors duration-200 dark:border dark:border-slate-600">
            <div className="px-6 py-4 border-b border-border-color flex items-center justify-between">
                <h3 className="text-lg font-semibold text-heading-color">Recent Tickets</h3>
                <div className="flex items-center space-x-2">
                    <select className="border border-border-color bg-background-color text-text-color rounded px-3 py-1 text-sm">
                        <option>All Categories</option>
                    </select>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-primary-color text-white px-3 py-1 rounded text-sm hover:bg-primary-color-hover transition-colors"
                    >
                        Refresh
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-table-header-bg">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-color uppercase tracking-wider">Ticket ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-color uppercase tracking-wider">Subject</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-color uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-color uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-color uppercase tracking-wider">Priority</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-color uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-color uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card-background divide-y divide-border-color">
                        {tickets.map((ticket) => (
                            <tr key={ticket._id || ticket.id} className="hover:bg-card-background-light">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-color">{ticket.ticketId || ticket.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-color">{ticket.subject}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-color">{ticket.user?.name || ticket.user || ticket.requester}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-color">{ticket.category || ticket.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityClasses[ticket.priority] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"}`}>
                                        {ticket.priority}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[ticket.status] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"}`}>
                                        {ticket.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button className="text-link-color hover:text-link-hover-color mr-3">
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
            {tickets.length === 0 && (
                <div className="px-6 py-4">
                    <div className="text-center text-text-muted-color">
                        No recent tickets found.
                    </div>
                </div>
            )}
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
        <div className="bg-card-background rounded-lg shadow-md overflow-hidden fade-in transition-colors duration-200 dark:border dark:border-slate-600">
            <div className="px-6 py-4 border-b border-border-color">
                <h3 className="text-lg font-semibold text-heading-color">Team Performance</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-table-header-bg">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-color uppercase tracking-wider">Team Member</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-color uppercase tracking-wider">Assigned</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-color uppercase tracking-wider">Resolved</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-color uppercase tracking-wider">Avg Response</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-color uppercase tracking-wider">Rating</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-color uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card-background divide-y divide-border-color">
                        {teamPerformance.map((member, idx) => (
                            <tr key={member._id || idx} className="hover:bg-card-background-light">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-primary-color rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                            {member.initials || (member.name ? member.name.split(" ").map(n => n[0]).join("") : "TM")}
                                        </div>
                                        <div className="ml-3">
                                            <div className="text-sm font-medium text-text-color">{member.name || member._id || "Unknown"}</div>
                                            <div className="text-sm text-text-muted-color">{member.position || ""}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-color">{member.assigned}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-color">{member.resolved}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-color">{member.avgResponse || "-"}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <span className="text-sm text-text-color">{member.rating || "-"}</span>
                                        <div className="ml-1 text-yellow-400">{"⭐".repeat(Math.round(member.rating || 0))}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[member.status] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"}`}>
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
                    <div className="text-center text-text-muted-color">
                        No team performance data found.
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;