import React, { useState } from 'react';
import CreateTicket from '../components/CreateTicket';
import TicketList from '../components/TicketList';

function TicketsPage({ token, filter }) {
  const [editingTicket, setEditingTicket] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const handleEdit = ticket => setEditingTicket(ticket);
  const handleClose = async id => {
    await closeTicket(id, token);
    setRefresh(r => !r);
  };
  const handleUpdated = () => {
    setEditingTicket(null);
    setRefresh(r => !r);
  };

  const handleReopen = async (id) => {
    try {
      const res = await fetch(`/api/tickets/${id}/reopen`, { method: 'PATCH' });
      if (res.ok) {
        setRefresh(r => !r); // This will trigger TicketList to reload
      }
    } catch (err) {
      alert('Failed to reopen ticket');
    }
  };

  return (
    <div>
      {/* Only show CreateTicket if not filtering */}
      {!filter && (
        <CreateTicket token={token} onCreated={() => setRefresh(r => !r)} />
      )}
      {editingTicket && (
        <EditTicket
          token={token}
          ticket={editingTicket}
          onUpdated={handleUpdated}
          onCancel={() => setEditingTicket(null)}
          onClose={handleClose}
          onReopen={handleReopen}
        />
      )}
      {showReply && selectedTicket && (
        <TicketReply
          token={token}
          ticket={selectedTicket}
          onBack={() => {
            setShowReply(false);
            setRefresh(r => !r); // This will refresh the ticket list
          }}
          onStatusChange={newStatus => {
            // Optionally update local ticket state if needed
          }}
          onTicketUpdate={setSelectedTicket} // <-- Pass this!
        />
      )}
      <TicketList token={token} />
    </div>
  );
}

export default TicketsPage;
