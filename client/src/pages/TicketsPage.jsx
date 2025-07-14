import React, { useState } from 'react';
import CreateTicket from '../components/CreateTicket';
import TicketList from '../components/TicketList';
// FIXED: Updated import path and component name to match the actual filename on your system
import AdminTicketReply from '../admin/adminTicketReply'; // Renamed to AdminTicketReply to match filename

function TicketsPage({ token, filter }) {
  const [editingTicket, setEditingTicket] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const handleEdit = ticket => setEditingTicket(ticket);
  // Placeholder for closeTicket function if it's not imported from ticketApi
  const closeTicket = async (id, token) => {
    console.log(`Closing ticket ${id} with token ${token}`);
    try {
      const res = await fetch(`/api/tickets/${id}/close`, { 
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to close ticket');
      console.log('Ticket closed successfully');
    } catch (error) {
      console.error('Error closing ticket:', error);
      alert('Failed to close ticket');
    }
  };


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
        // Assuming EditTicket component exists and is imported
        // <EditTicket
        //   token={token}
        //   ticket={editingTicket}
        //   onUpdated={handleUpdated}
        //   onCancel={() => setEditingTicket(null)}
        //   onClose={handleClose}
        //   onReopen={handleReopen}
        // />
        <p>EditTicket component placeholder</p> // Replace with actual EditTicket
      )}
      {showReply && selectedTicket && (
        // FIXED: Changed component usage to AdminTicketReply
        <AdminTicketReply
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
      <TicketList token={token} refresh={refresh} /> {/* Pass refresh prop */}
    </div>
  );
}

export default TicketsPage;
