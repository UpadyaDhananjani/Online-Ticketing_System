// src/admin/TicketReply.jsx
import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { sendTicketReply } from "../api/ticketApi";

function TicketReply({ token, ticket, onBack }) {
  const [reply, setReply] = useState("");
  const [attachment, setAttachment] = useState(null);

  const handleFileChange = e => setAttachment(e.target.files[0]);

  const handleSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("message", reply);
    if (attachment) formData.append("attachment", attachment);
    await sendTicketReply(ticket._id, formData, token);
    setReply("");
    setAttachment(null);
    onBack();
  };

  return (
    <div>
      <button onClick={onBack}>Back to Tickets</button>
      <h3>Reply to: {ticket.subject}</h3>
      <div>
        <strong>Previous Messages:</strong>
        <ul>
          {ticket.messages.map((msg, idx) => (
            <li key={idx}>
              <div dangerouslySetInnerHTML={{ __html: msg.content }} />
              <small>{msg.author} - {new Date(msg.date).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      </div>
      <form onSubmit={handleSubmit}>
        <ReactQuill value={reply} onChange={setReply} placeholder="Write a reply" />
        <div>
          <input type="file" onChange={handleFileChange} />
        </div>
        <button type="submit">Reply</button>
      </form>
    </div>
  );
}
export default TicketReply;
