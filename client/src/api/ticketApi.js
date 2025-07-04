import axios from 'axios';

const API_URL = '/api/tickets'; // Base URL for user tickets

// Create ticket (with assignedUnit support)
export const createTicket = (data, token) =>
  axios.post(API_URL, data, { headers: { Authorization: `Bearer ${token}` } });

// Get tickets (user) - This fetches tickets for the regular user list
export const getTickets = (token) =>
  axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });

// Update ticket (with assignedUnit support)
export const updateTicket = (id, data, token) =>
  axios.put(`${API_URL}/${id}`, data, { headers: { Authorization: `Bearer ${token}` } });

// Close ticket
export const closeTicket = (id, token) =>
  axios.patch(`${API_URL}/${id}/close`, {}, { headers: { Authorization: `Bearer ${token}` } });

// Get all tickets (admin)
// --- CRUCIAL FIX: Changed endpoint to API_URL (which is /api/tickets) ---
// This ensures the admin dashboard uses the same endpoint that populates user data.
export const getAllTickets = (token) =>
  axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });

// Send ticket reply (admin)
export const sendTicketReply = (ticketId, data, token) =>
  axios.post(`/api/admin/tickets/${ticketId}/reply`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });

// Resolve ticket (admin)
export const resolveTicket = (ticketId, token) =>
  axios.patch(`/api/admin/tickets/${ticketId}/resolve`, null, {
    headers: { Authorization: `Bearer ${token}` }
  });
