import React from "react";
//import tickets from "./data/sampleTickets";

function Home() {
  const openIssues = tickets.filter(ticket => ticket.status === "Open").length;
  const completedIssues = tickets.filter(ticket => ticket.status === "Completed").length;
  const unassignedIssues = tickets.filter(ticket => !ticket.assignedTo).length;

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-medium">
          Version 0.5.5
        </span>
        <div className="flex gap-4 items-center">
          <button className="bg-white border border-gray-300 px-3 py-1 rounded hover:bg-gray-50">Send Feedback</button>
          <div className="bg-gray-200 px-3 py-1 rounded">admin</div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-900 text-white rounded-lg p-6">
          <p className="text-xl font-semibold">Open Issues</p>
          <p className="text-3xl mt-2">{openIssues}</p>
        </div>
        <div className="bg-gray-900 text-white rounded-lg p-6">
          <p className="text-xl font-semibold">Completed Issues</p>
          <p className="text-3xl mt-2">{completedIssues}</p>
        </div>
        <div className="bg-gray-900 text-white rounded-lg p-6">
          <p className="text-xl font-semibold">Unassigned Issues</p>
          <p className="text-3xl mt-2">{unassignedIssues}</p>
        </div>
      </div>

      {/* Recent Issues */}
      <h2 className="text-2xl font-semibold mb-4">Recent Issues</h2>
      <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
        <table className="min-w-full text-sm table-auto">
          <thead>
            <tr className="text-left text-gray-600 border-b">
              <th className="py-2 px-4">Title</th>
              <th className="py-2 px-4">Priority</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Created</th>
              <th className="py-2 px-4">Assigned To</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(ticket => (
              <tr key={ticket.id} className="border-t">
                <td className="py-2 px-4">{ticket.title}</td>
                <td className="py-2 px-4">{ticket.priority}</td>
                <td className="py-2 px-4">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    ticket.status === "Open" ? "bg-green-100 text-green-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    ● {ticket.status}
                  </span>
                </td>
                <td className="py-2 px-4">{ticket.created}</td>
                <td className="py-2 px-4">{ticket.assignedTo || "Unassigned"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Home;
