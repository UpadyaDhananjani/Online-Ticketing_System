// ChartAnalytics.jsx

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Cell,
} from "recharts";

const COLORS_MAP = {
  open: "#8884d8",
  "in progress": "#82ca9d",
  resolved: "#ffc658",
  closed: "#d84a4a",
  reopened: "#a569bd",
};

const ChartAnalytics = ({ data, currentMonthLabel = "Current Month", lastMonthLabel = "Last Month", lastMonthData }) => (
  <div>
    {/* Current Month Chart */}
    <h5 style={{ textAlign: "center", marginBottom: 8 }}>{currentMonthLabel}</h5>
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} animationDuration={1500}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="status" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" isAnimationActive>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS_MAP[entry.status] || "#8884d8"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>

    {/* Last Month Chart (if provided) */}
    {lastMonthData && (
      <>
        <h5 style={{ textAlign: "center", margin: "32px 0 8px 0" }}>{lastMonthLabel}</h5>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={lastMonthData} animationDuration={1500}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" isAnimationActive>
              {lastMonthData.map((entry, index) => (
                <Cell key={`cell-last-${index}`} fill={COLORS_MAP[entry.status] || "#8884d8"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </>
    )}
  </div>
);

export default ChartAnalytics;
