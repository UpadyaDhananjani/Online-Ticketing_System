import React from "react";
import PropTypes from "prop-types";
import "./MessageHistory.style.css";

export const MessageHistory = ({ msg, description, image }) => (
  <div>
    {description && (
      <div
        style={{
          background: "#f8f9fa",
          padding: "1rem",
          borderRadius: "8px",
          marginBottom: "1rem",
          border: "1px solid #e1e1e1",
        }}
      >
        <strong>Description:</strong>
        <div style={{ marginTop: 4 }}>{description}</div>
      </div>
    )}
    {image && (
      <div style={{ marginBottom: "1rem" }}>
        <strong>Attachment:</strong>
        <div>
          <img
            // src={`/uploads/${image}`}
            src={`http://localhost:3000/uploads/${image}`}
            alt="Ticket Attachment"
            style={{
              maxWidth: "300px",
              maxHeight: "200px",
              borderRadius: 8,
              marginTop: 8,
            }}
          />
        </div>
      </div>
    )}
    {msg && msg.length > 0 ? (
      msg.map((m, i) => (
        <div key={i} style={{ marginBottom: 12 }}>
          <div>
            <strong>{m.sender}</strong>{" "}
            <span style={{ color: "#888" }}>
              {new Date(m.date).toLocaleString()}
            </span>
          </div>
          <div>{m.message}</div>
        </div>
      ))
    ) : (
      <div>No messages yet.</div>
    )}
  </div>
);

MessageHistory.propTypes = {
  msg: PropTypes.array.isRequired,
  description: PropTypes.string,
  image: PropTypes.string,
};