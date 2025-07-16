// client/src/api/ticketApi.js

import axios from 'axios';

// IMPORTANT: Ensure this matches your backend server URL
// If running locally, it's usually http://localhost:4000
// If deployed, change this to your deployed backend URL
const API_URL = 'http://localhost:4000/api';

// Create an Axios instance with common configurations
const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Crucial for sending HTTP-only cookies (like your JWT token)
});

// --- User/Auth related APIs (examples, adjust as needed) ---
// If these are not in ticketApi.js, ensure they are correctly placed elsewhere.
export const registerUser = async (userData) => {
    try {
        const response = await axiosInstance.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        throw error; // Let the caller handle the error
    }
};

export const loginUser = async (userData) => {
    try {
        const response = await axiosInstance.post('/auth/login', userData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const logoutUser = async () => {
    try {
        const response = await axiosInstance.post('/auth/logout');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getMe = async () => {
    try {
        const response = await axiosInstance.get('/auth/me');
        return response.data;
    } catch (error) {
        throw error;
    }
};

// --- Ticket related APIs ---

// Fetch all tickets for admin
export const getAdminTickets = async () => {
    try {
        const response = await axiosInstance.get('/tickets/admin');
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Fetch a single ticket by ID for admin
export const getAdminTicketById = async (ticketId) => {
    try {
        const response = await axiosInstance.get(`/tickets/admin/${ticketId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Send a reply to a ticket (admin side)
export const sendTicketReply = async (ticketId, formData) => {
    try {
        const response = await axiosInstance.post(`/tickets/${ticketId}/reply`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data' // Important for file uploads
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Resolve a ticket
export const resolveTicket = async (ticketId) => {
    try {
        const response = await axiosInstance.put(`/tickets/${ticketId}/resolve`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Delete an admin message
export const deleteAdminMessage = async (ticketId, messageId) => {
    try {
        const response = await axiosInstance.delete(`/tickets/${ticketId}/message/${messageId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// --- Reassign specific APIs ---

// Get all public units (for dropdown)
export const getPublicUnits = async () => {
    try {
        // This endpoint usually doesn't need a token, but 'withCredentials: true'
        // on axiosInstance will send cookies anyway. If your public route
        // is *not* behind auth, you might use plain axios.get without axiosInstance.
        // However, keeping it consistent with axiosInstance is generally fine.
        const response = await axiosInstance.get('/public/units');
        return response.data; // Should return an array of unit objects
    } catch (error) {
        console.error("Error in getPublicUnits API:", error); // Added specific log
        throw error;
    }
};

// Get users by unit name
export const getUsersByUnit = async (unitName) => {
    try {
        // Use encodeURIComponent for unitName to handle spaces or special characters
        const response = await axiosInstance.get(`/users/by-unit/${encodeURIComponent(unitName)}`);
        // The backend should return { success: true, users: [...] }
        return response.data;
    } catch (error) {
        console.error("Error in getUsersByUnit API:", error); // Added specific log
        throw error;
    }
};

// Reassign a ticket to a specific user (or null to unassign)
export const reassignTicket = async (ticketId, assignedToId) => {
    try {
        const response = await axiosInstance.patch(`/tickets/${ticketId}/reassign`, { assignedTo: assignedToId });
        return response.data;
    } catch (error) {
        console.error("Error in reassignTicket API:", error); // Added specific log
        throw error;
    }
};

// --- Client/User Ticket APIs (examples, adjust as needed) ---
// If you have separate user dashboards, these might be in a different API file.
export const createTicket = async (formData) => {
    try {
        const response = await axiosInstance.post('/tickets', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getUserTickets = async () => {
    try {
        const response = await axiosInstance.get('/tickets');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getUserTicketById = async (ticketId) => {
    try {
        const response = await axiosInstance.get(`/tickets/${ticketId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteUserMessage = async (ticketId, messageId) => {
    try {
        const response = await axiosInstance.delete(`/tickets/${ticketId}/message/${messageId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};