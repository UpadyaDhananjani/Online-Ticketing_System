import React, { useState } from "react";

import TicketList from "./adminTicketList.jsx";

import TicketReply from "./adminTicketReply.jsx";



function AdminDashboard({ token }) {

  const [selectedTicket, setSelectedTicket] = useState(null);

  const [refresh, setRefresh] = useState(false);



  // Callback to trigger refresh in TicketList

  const handleRefresh = () => setRefresh(r => !r);



  return (

    <div>

      {!selectedTicket ? (

        <TicketList token={token} onSelect={setSelectedTicket} refresh={refresh} />

      ) : (

        <TicketReply

          token={token}

          ticket={selectedTicket}

          onBack={() => {

            setSelectedTicket(null);

            handleRefresh(); // Refresh the list after closing reply

          }}

          onTicketUpdate={setSelectedTicket}

          onStatusChange={handleRefresh}

        />

      )}

    </div>

  );

}

export default AdminDashboard;

