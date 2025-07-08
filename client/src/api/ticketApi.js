import axios from 'axios';

const API_URL = '/api/tickets'; // Base URL for user tickets
const ADMIN_API_URL = '/api/admin/tickets'; // Base URL for admin tickets

// Create ticket (user)
export const createTicket = (data, token) =>
  axios.post(API_URL, data, { headers: { Authorization: `Bearer ${token}` } });

// Get tickets (user) - Relies on cookies via withCredentials
export const getTickets = () => 
  axios.get(API_URL, { withCredentials: true });

// Update ticket (user)
export const updateTicket = (id, data, token) =>
  axios.put(`${API_URL}/${id}`, data, { headers: { Authorization: `Bearer ${token}` } });

// Close ticket (user)
export const closeTicket = (id, token) =>
  axios.patch(`${API_URL}/${id}/close`, {}, { headers: { Authorization: `Bearer ${token}` } });

// Get all tickets (admin) - Uses token for Authorization header
export const getAllTickets = (token) => 
  axios.get(ADMIN_API_URL, { headers: { Authorization: `Bearer ${token}` } });

// Send ticket reply (admin) - Uses token
export const sendTicketReply = (ticketId, data, token) =>
  axios.post(`${ADMIN_API_URL}/${ticketId}/reply`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });

// Resolve ticket (admin) - Uses token
export const resolveTicket = (ticketId, token) =>
  axios.patch(`${ADMIN_API_URL}/${ticketId}/resolve`, null, {
    headers: { Authorization: `Bearer ${token}` }
  });

// Get a single ticket for admin (e.g., for TicketReply) - Uses token
export const getAdminTicketById = (ticketId, token) =>
  axios.get(`${ADMIN_API_URL}/${ticketId}`, { 
    headers: { Authorization: `Bearer ${token}` }
  });

// --- CRITICAL: Ensure this export is present and spelled correctly ---
export const deleteAdminMessage = (ticketId, messageId, token) =>
  axios.delete(`${ADMIN_API_URL}/${ticketId}/messages/${messageId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
