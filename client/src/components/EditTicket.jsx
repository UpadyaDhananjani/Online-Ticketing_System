import React, { useState } from 'react';
import { updateTicket } from '../api/ticketApi';

function EditTicket({ token, ticket, onUpdated, onCancel }) {
  const [subject, setSubject] = useState(ticket.subject);
  const [description, setDescription] = useState(ticket.description);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await updateTicket(ticket._id, { subject, description }, token);
      if (onUpdated) onUpdated();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={subject}
        onChange={e => setSubject(e.target.value)}
        required
      />
      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        required
      />
      <button type="submit">Update Ticket</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
}

export default EditTicket;
