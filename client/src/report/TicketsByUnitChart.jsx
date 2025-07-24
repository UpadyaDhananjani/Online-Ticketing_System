import { getTicketsByUnit } from "../api/ticketApi";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

function TicketsByUnitChart() {
  const [data, setData] = useState([]);
  useEffect(() => {
    getTicketsByUnit().then(setData);
  }, []);
  return (
    <div>
      <h4>Tickets by Assigned Unit/Team</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="unit" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="tickets" fill="#8884d8" name="Total Tickets" />
          <Bar dataKey="resolved" fill="#82ca9d" name="Resolved" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


export default TicketsByUnitChart;