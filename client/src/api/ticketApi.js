import axios from 'axios';

const API_URL = '/api/tickets';

export const createTicket = (data, token) =>
  axios.post(API_URL, data, { headers: { Authorization: `Bearer ${token}` } });

export const getTickets = (token) =>
  axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });

export const updateTicket = (id, data, token) =>
  axios.put(`${API_URL}/${id}`, data, { headers: { Authorization: `Bearer ${token}` } });

export const closeTicket = (id, token) =>
  axios.patch(`${API_URL}/${id}/close`, {}, { headers: { Authorization: `Bearer ${token}` } });

export const getAllTickets = (token) =>
  axios.get('/api/admin/tickets', { headers: { Authorization: `Bearer ${token}` } });

export const sendTicketReply = (ticketId, data, token) =>
  axios.post(`/api/admin/tickets/${ticketId}/reply`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const resolveTicket = (ticketId, token) =>
  axios.patch(`/api/admin/tickets/${ticketId}/resolve`, null, {
    headers: { Authorization: `Bearer ${token}` }
  });
