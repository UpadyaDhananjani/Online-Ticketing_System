import axios from 'axios';

const API_URL = '/api/tickets'; // Base URL for user tickets
const ADMIN_API_URL = '/api/admin/tickets'; // Base URL for admin tickets

// ---------------- USER TICKET ROUTES ---------------- //

// Create a new ticket (user)
export const createTicket = (data, token) =>
  axios.post(API_URL, data, {
    headers: { Authorization: `Bearer ${token}` }
  });

// Get all tickets (user) - relies on cookies
export const getTickets = () =>
  axios.get(API_URL, { withCredentials: true });

// Update a ticket (user)
export const updateTicket = (id, data, token) =>
  axios.put(`${API_URL}/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });

// Close a ticket (user)
export const closeTicket = (id, token) =>
  axios.patch(`${API_URL}/${id}/close`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });

// Delete a user message (can only delete their own message)
export const deleteUserMessage = (ticketId, messageId, token) =>
  axios.delete(`${API_URL}/${ticketId}/messages/${messageId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });


// ---------------- ADMIN TICKET ROUTES ---------------- //

// Get all tickets (admin)
export const getAllTickets = (token) =>
  axios.get(ADMIN_API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });

// Get a single ticket by ID (admin)
export const getAdminTicketById = (ticketId, token) =>
  axios.get(`${ADMIN_API_URL}/${ticketId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

// Send a reply to a ticket (admin)
export const sendTicketReply = (ticketId, data, token) =>
  axios.post(`${ADMIN_API_URL}/${ticketId}/reply`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });

// Resolve a ticket (admin)
export const resolveTicket = (ticketId, token) =>
  axios.patch(`${ADMIN_API_URL}/${ticketId}/resolve`, null, {
    headers: { Authorization: `Bearer ${token}` }
  });

// Delete any message from ticket (admin)
export const deleteAdminMessage = (ticketId, messageId, token) =>
  axios.delete(`${ADMIN_API_URL}/${ticketId}/messages/${messageId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

// Delete a ticket entirely (admin)
export const deleteAdminTicket = (ticketId, token) =>
  axios.delete(`${ADMIN_API_URL}/${ticketId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
