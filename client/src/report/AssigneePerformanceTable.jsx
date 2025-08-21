import { getAssigneePerformance } from "../api/ticketApi";
import { useEffect, useState } from "react";

function AssigneePerformanceTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const performanceData = await getAssigneePerformance();
        console.log('Assignee Performance Data:', performanceData);
        setData(performanceData || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching assignee performance:', err);
        setError('Failed to load performance data');
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="bg-white dark:bg-slate-700 rounded-lg shadow-md overflow-hidden mb-8 fade-in transition-colors duration-200 dark:border dark:border-slate-600">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-600 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200">
          Staff/Assignee Performance
        </h3>
        <div className="text-sm text-gray-500 dark:text-slate-400">
          {loading ? 'Loading...' : `${data.length} assignees`}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-slate-600">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                Assignee Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                Total Tickets
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                Completed
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                Resolution Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                Avg. Resolution (Days)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-700 divide-y divide-gray-200 dark:divide-slate-600">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-slate-400">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Loading performance data...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-red-500 dark:text-red-400">
                  <div className="flex items-center justify-center space-x-2">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-slate-400">
                  <div className="flex flex-col items-center space-y-2">
                    <span className="text-2xl">📊</span>
                    <span>No performance data available</span>
                    <span className="text-sm">Assign tickets to staff to see performance metrics</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={row._id || row.name || index} className="hover:bg-gray-50 dark:hover:bg-slate-600">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-300">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-300 font-semibold text-xs">
                          {row.name ? row.name.charAt(0).toUpperCase() : 'U'}
                        </span>
                      </div>
                      <span>{row.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
                      {row.totalTickets || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300">
                        {row.completedTickets || (row.resolvedTickets + row.closedTickets) || 0}
                      </span>
                      {row.inProgressTickets > 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300">
                          {row.inProgressTickets} pending
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min(row.resolutionRate || 0, 100)}%` }}
                        ></div>
                      </div>
                      <span className="font-medium">{row.resolutionRate || 0}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">
                    {row.avgResolutionTime > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-600 text-gray-800 dark:text-slate-200">
                        {row.avgResolutionTime} days
                      </span>
                    ) : (
                      <span className="text-gray-400 dark:text-slate-500">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {(row.resolutionRate || 0) >= 80 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300">
                        ✅ Excellent
                      </span>
                    ) : (row.resolutionRate || 0) >= 60 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300">
                        👍 Good
                      </span>
                    ) : (row.resolutionRate || 0) >= 40 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-300">
                        ⚠️ Average
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300">
                        🔴 Needs Attention
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {data.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 dark:bg-slate-600 border-t border-gray-200 dark:border-slate-500">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-slate-400">
            <span>Total staff members: {data.length}</span>
            <span>
              Avg resolution rate: {
                data.length > 0 
                  ? Math.round(data.reduce((sum, item) => sum + (item.resolutionRate || 0), 0) / data.length) 
                  : 0
              }%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssigneePerformanceTable;