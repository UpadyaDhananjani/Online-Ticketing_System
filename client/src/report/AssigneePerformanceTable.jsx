import { getAssigneePerformance } from "../api/ticketApi";
import { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";

function AssigneePerformanceTable() {
  const [data, setData] = useState([]);
  useEffect(() => {
    getAssigneePerformance().then(setData);
  }, []);
  return (
    <div>
      <h4>Staff/Assignee Performance</h4>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Assignee Name</th>
            <th>Tickets Assigned</th>
            <th>Tickets Resolved</th>
            <th>Avg. Resolution Time (hrs)</th>
            <th>Tickets Overdue</th>
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.assigneeName}>
              <td>{row.assigneeName}</td>
              <td>{row.ticketsAssigned}</td>
              <td>{row.ticketsResolved}</td>
              <td>{row.avgResolutionTime ? (row.avgResolutionTime / 3600000).toFixed(2) : '-'}</td>
              <td>{row.ticketsOverdue}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default AssigneePerformanceTable;