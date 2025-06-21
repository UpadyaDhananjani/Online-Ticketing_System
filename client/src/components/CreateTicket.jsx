import React, { useState } from 'react';

function CreateTicket({ token, onCreated }) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('incident'); // default value

  const handleSubmit = async e => {
    e.preventDefault();
    // Add type to the request body
    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, description, type })
    });
    if (res.ok && onCreated) onCreated();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Subject"
        value={subject}
        onChange={e => setSubject(e.target.value)}
        required
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
        required
      />
      <select value={type} onChange={e => setType(e.target.value)}>
        <option value="incident">Incident</option>
        <option value="bug">Bug</option>
        <option value="maintenance">Maintenance</option>
        <option value="request">Request</option>
        <option value="service">Service</option>
      </select>
      <button type="submit">Create Ticket</button>
    </form>
  );
}

export default CreateTicket;
