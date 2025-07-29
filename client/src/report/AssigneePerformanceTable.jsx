import { getAssigneePerformance } from "../api/ticketApi";
import { useEffect, useState } from "react";

function AssigneePerformanceTable() {
  const [data, setData] = useState([]);
  useEffect(() => {
    getAssigneePerformance().then(setData);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8 fade-in">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center">
        <h3 className="text-lg font-semibold text-gray-800">
          Staff/Assignee Performance
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assignee Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tickets Assigned
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tickets Resolved
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg. Resolution Time (hrs)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tickets Overdue
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  No performance data found.
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.assigneeName} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.assigneeName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.ticketsAssigned}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.ticketsResolved}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.avgResolutionTime
                      ? (row.avgResolutionTime / 3600000).toFixed(2)
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.ticketsOverdue}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AssigneePerformanceTable;