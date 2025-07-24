import { getAvgResolutionTime } from "../api/ticketApi";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function AvgResolutionTimeChart() {
  const [data, setData] = useState([]);
  useEffect(() => {
    getAvgResolutionTime().then(raw => {
      setData(raw.map(d => ({
        ...d,
        avgResolutionTime: d.avgResolutionTime / 3600000 // ms to hours
      })));
    });
  }, []);
  return (
    <div>
      <h4>Average Resolution Time (hrs) by Month</h4>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="_id" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="avgResolutionTime" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AvgResolutionTimeChart;