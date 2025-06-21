import React, { useState } from 'react';
import TicketList from '../components/TicketList';
import CreateTicket from '../components/CreateTicket';
import EditTicket from '../components/EditTicket';
import { closeTicket } from '../api/ticketApi';

function TicketsPage({ token }) {
  const [editingTicket, setEditingTicket] = useState(null);
  const [refresh, setRefresh] = useState(false);

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
        const updatedTicket = await res.json();
        setTickets((prev) =>
          prev.map((t) => (t._id === id ? { ...t, status: updatedTicket.status } : t))
        );
      }
    } catch (err) {
      alert('Failed to reopen ticket');
    }
  };





  return (
    <div>
      <CreateTicket token={token} onCreated={() => setRefresh(r => !r)} />
      {editingTicket && (
        <EditTicket
          token={token}
          ticket={editingTicket}
          onUpdated={handleUpdated}
          onCancel={() => setEditingTicket(null)}
        />
      )}
      <TicketList
        key={refresh} // force re-mount on refresh
        token={token}
        onEdit={handleEdit}
        onClose={handleClose}
        onReopen={handleReopen}
      />
    </div>
  );
}

export default TicketsPage;
