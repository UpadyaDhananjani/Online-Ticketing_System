import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, Cell
} from "recharts";

const statusColors = {
  open: "#8884d8",
  "in progress": "#82ca9d",
  resolved: "#ffc658",
  closed: "#d84a4a",
  reopened: "#a569bd"
};

const ChartAnalytics = ({ data }) => {
  // Check if data is valid
  const hasValidData = Array.isArray(data) &&
    data.length > 0 &&
    data.some(item => item?.count > 0);

  // Format status text for display
  const formatStatus = (status) => {
    if (typeof status !== 'string') return '';
    return status.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (!hasValidData) {
    return (
      <div className="text-center p-4 text-muted">
        <i className="bi bi-graph-up" style={{ fontSize: "2rem" }}></i>
        <p>No ticket data available for visualization</p>
      </div>
    );
  }

  return (
    <div style={{ height: "400px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis
            dataKey="status"
            type="category"
            width={100}
            tickFormatter={formatStatus}
          />
          <Tooltip
            formatter={(value) => [`${value} tickets`, "Count"]}
            labelFormatter={(label) => `Status: ${formatStatus(label)}`}
          />
          <Legend />
          <Bar
            dataKey="count"
            name="Ticket Count"
            barSize={30}
            animationDuration={1500}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={statusColors[entry.status?.toLowerCase()] || "#8884d8"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartAnalytics;
