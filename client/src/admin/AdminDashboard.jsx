// src/admin/AdminDashboard.jsx
import React, { useState } from "react";
import TicketList from "./adminTicketList.jsx";
import TicketReply from "./adminTicketReply.jsx";


function AdminDashboard({ token }) {
  const [selectedTicket, setSelectedTicket] = useState(null);

  return (
    <div>
      {!selectedTicket ? (
        <TicketList token={token} onSelect={setSelectedTicket} />
      ) : (
        <TicketReply token={token} ticket={selectedTicket} onBack={() => setSelectedTicket(null)} />
      )}
    </div>
  );
}
export default AdminDashboard;
