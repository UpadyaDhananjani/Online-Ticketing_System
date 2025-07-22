//adminDashboard.jsx


import React, { useState } from "react";

import TicketList from "./adminTicketList.jsx";

import TicketReply from "./adminTicketReply.jsx";



function AdminDashboard({ token }) {

 const [selectedTicket, setSelectedTicket] = useState(null);

 const [refresh, setRefresh] = useState(0);



  // Handler to update selected ticket and refresh the ticket list

  const handleTicketUpdate = (updatedTicket) => {

    setSelectedTicket(updatedTicket);

    setRefresh((r) => r + 1); // Triggers TicketList to refetch

  };



  return (

    <div>

      {!selectedTicket ? (

        <TicketList token={token} onSelect={setSelectedTicket} refresh={refresh} />

      ) : (

        <TicketReply

          token={token}

          ticket={selectedTicket}

          onBack={() => setSelectedTicket(null)}

          onTicketUpdate={handleTicketUpdate}

        />

      )}

    </div>

  );

}

export default AdminDashboard;

