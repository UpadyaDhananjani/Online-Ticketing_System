import { getTicketsByUnit } from "../api/ticketApi";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

function TicketsByUnitChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    getTicketsByUnit()
      .then(raw => {
        console.log("Tickets By Unit API Data:", raw);
        setData(raw.data || []);
      })
      .catch(() => setData([]));
  }, []);

  return (
    <div style={{ width: "100%", height: 300 }}>
      {data.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No unit/team ticket data available.</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="unit" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="tickets" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default TicketsByUnitChart;