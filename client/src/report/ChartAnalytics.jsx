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

const ChartAnalytics = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data} animationDuration={1500}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="status" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="count" isAnimationActive>
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={statusColors[entry.status] || "#8884d8"} />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);

export default ChartAnalytics;
