import axios from 'axios';

const API_URL = '/api/tickets'; // Base URL for user tickets

// Create ticket (with assignedUnit support) - Keep token here if backend still expects it in header for this specific route
export const createTicket = (data, token) =>
  axios.post(API_URL, data, { headers: { Authorization: `Bearer ${token}` } });

// Get tickets (user) - NO TOKEN PARAMETER, relies on cookies via withCredentials
export const getTickets = () => // Removed 'token' parameter
  axios.get(API_URL, { withCredentials: true }); // Explicitly use withCredentials

// Update ticket (with assignedUnit support) - Keep token here if backend still expects it in header for this specific route
export const updateTicket = (id, data, token) =>
  axios.put(`${API_URL}/${id}`, data, { headers: { Authorization: `Bearer ${token}` } });

// Close ticket - Keep token here if backend still expects it in header for this specific route
export const closeTicket = (id, token) =>
  axios.patch(`${API_URL}/${id}/close`, {}, { headers: { Authorization: `Bearer ${token}` } });

// Get all tickets (admin) - NO TOKEN PARAMETER, relies on cookies via withCredentials
// This now calls the same /api/tickets endpoint that populates user data.
export const getAllTickets = () => // Removed 'token' parameter
  axios.get(API_URL, { withCredentials: true }); // Explicitly use withCredentials

// Send ticket reply (admin) - Keep token here if backend still expects it in header for this specific route
export const sendTicketReply = (ticketId, data, token) =>
  axios.post(`/api/admin/tickets/${ticketId}/reply`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });

// Resolve ticket (admin) - Keep token here if backend still expects it in header for this specific route
export const resolveTicket = (ticketId, token) =>
  axios.patch(`/api/admin/tickets/${ticketId}/resolve`, null, {
    headers: { Authorization: `Bearer ${token}` }
  });
