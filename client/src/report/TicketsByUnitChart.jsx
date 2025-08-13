import { getTicketsByUnit } from "../api/ticketApi";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

function TicketsByUnitChart() {
  const [data, setData] = useState([]);

  // Define multiple colors for the bars
  const colors = [
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Yellow
    '#ef4444', // Red
    '#8b5cf6', // Purple
    '#06b6d4'  // Cyan
  ];

  // Custom tick component for multi-line labels
  const CustomTick = (props) => {
    const { x, y, payload } = props;
    const words = payload.value.split(' ');
    
    if (words.length > 2) {
      // Split long names into multiple lines
      const midPoint = Math.ceil(words.length / 2);
      const line1 = words.slice(0, midPoint).join(' ');
      const line2 = words.slice(midPoint).join(' ');
      
      return (
        <g transform={`translate(${x},${y})`}>
          <text x={0} y={0} dy={0} textAnchor="middle" fill="#666" fontSize="11">
            <tspan x="0" dy="0">{line1}</tspan>
            <tspan x="0" dy="12">{line2}</tspan>
          </text>
        </g>
      );
    }
    
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={0} textAnchor="middle" fill="#666" fontSize="11">
          {payload.value}
        </text>
      </g>
    );
  };

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
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="unit" 
              textAnchor="middle"
              height={80}
              interval={0}
              margin={{ top: 20, bottom: 20 }}
              tick={<CustomTick />}
            />
            <YAxis />
            <Tooltip />
            <Bar dataKey="tickets">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default TicketsByUnitChart;