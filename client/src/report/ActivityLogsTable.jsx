import { getActivityLogs } from "../api/ticketApi";
import { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";

function ActivityLogsTable() {
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    getActivityLogs().then(setLogs);
  }, []);
  return (
    <div>
      <h4>Ticket Activity Logs</h4>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Ticket ID</th>
            <th>Action Taken</th>
            <th>By</th>
            <th>Date/Time</th>
            <th>Comments</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, idx) => (
            <tr key={idx}>
              <td>{log.ticketId}</td>
              <td>{log.action}</td>
              <td>{log.by}</td>
              <td>{new Date(log.date).toLocaleString()}</td>
              <td>{log.comments}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}


export default ActivityLogsTable;