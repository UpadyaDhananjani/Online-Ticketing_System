import { getAvgResolutionTime } from "../api/ticketApi";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

function AvgResolutionTimeChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    getAvgResolutionTime()
      .then(raw => {
        console.log("Average Resolution Time Data:", raw);
        setData(
          raw.map(d => ({
            ...d,
            avgResolutionTime: d.avgResolutionTime / 3600000 // ms to hours
          }))
        );
      })
      .catch(() => setData([]));
  }, []);

  return (
    <div style={{ width: "100%", height: 300 }}>
      {data.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No resolution time data available.</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="avgResolutionTime" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default AvgResolutionTimeChart;