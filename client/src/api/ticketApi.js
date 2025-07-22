// client/src/api/ticketApi.js

import axios from 'axios';

// IMPORTANT: Get the API base URL from environment variables for better flexibility.
// If VITE_API_BASE_URL is not set in your .env file, it defaults to http://localhost:4000/api.
// In your client's .env file (e.g., .env.development), you should have:
// VITE_API_BASE_URL=http://localhost:4000/api
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

// Create a pre-configured Axios instance for all API calls
const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Crucial for sending HTTP-only cookies (like your JWT token)
});

// --- Axios Interceptors for Debugging (Highly Recommended) ---
// These will log every request and response, helping you see network activity.

// Request Interceptor: Logs outgoing requests
axiosInstance.interceptors.request.use(
    config => {
        console.log('API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            data: config.data,
            headers: config.headers,
        });
        return config;
    },
    error => {
        console.error('API Request Error:', error.message, error.config);
        return Promise.reject(error);
    }
);

// Response Interceptor: Logs incoming responses
axiosInstance.interceptors.response.use(
    response => {
        console.log('API Response:', {
            status: response.status,
            url: response.config.url,
            data: response.data,
        });
        return response; // Return the full response object for getAdminTickets, or response.data for others.
    },
    error => {
        console.error('API Response Error:', {
            status: error.response?.status,
            url: error.config?.url,
            data: error.response?.data,
            message: error.message,
        });
        return Promise.reject(error);
    }
);
// --- End Axios Interceptors ---


// =======================================================
// --- User/Auth related APIs ---
// =======================================================

export const registerUser = async (userData) => {
    try {
        const response = await axiosInstance.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        throw error;
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

// NEW: Admin Login API function
export const adminLogin = async (userData) => {
    try {
        const response = await axiosInstance.post('/auth/admin-login', userData);
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


// =======================================================
// --- USER TICKET APIs (accessible by authenticated users) ---
// =======================================================

// Create a new ticket (user) - uses formData for attachments
export const createTicket = async (formData) => {
    try {
        const response = await axiosInstance.post('/tickets', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get all tickets for the authenticated user
export const getUserTickets = async () => {
    try {
        const response = await axiosInstance.get('/tickets');
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get a single ticket by ID for the authenticated user
export const getUserTicketById = async (ticketId) => {
    try {
        const response = await axiosInstance.get(`/tickets/${ticketId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Update a ticket (user)
export const updateTicket = async (id, data) => {
    try {
        const response = await axiosInstance.put(`/tickets/${id}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Close a ticket (user)
export const closeTicket = async (id) => {
    try {
        const response = await axiosInstance.patch(`/tickets/${id}/close`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Delete a user's own message from a ticket
export const deleteUserMessage = async (ticketId, messageId) => {
    try {
        const response = await axiosInstance.delete(`/tickets/${ticketId}/messages/${messageId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};


// =======================================================
// --- ADMIN TICKET APIs (accessible by authenticated admins) ---
// =======================================================

/**
 * Fetches all tickets for the admin dashboard.
 * IMPORTANT: This function returns the full Axios `response` object,
 * not just `response.data`. The calling component (e.g., adminTicketList.jsx)
 * must access `response.data` explicitly.
 * @returns {Promise<AxiosResponse>} A promise that resolves to the full Axios response object.
 * @throws {Error} If the API call fails.
 */
export const getAdminTickets = async () => {
    try {
        const response = await axiosInstance.get('/admin/tickets');
        return response; // <-- Returns the full response object
    } catch (error) {
        throw error;
    }
};

// Get a single ticket by ID for admin
export const getAdminTicketById = async (ticketId) => {
    try {
        const response = await axiosInstance.get(`/admin/tickets/${ticketId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Send a reply to a ticket (admin side) - uses formData for attachments
export const sendTicketReply = async (ticketId, formData) => {
    try {
        const response = await axiosInstance.post(`/admin/tickets/${ticketId}/reply`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Resolve a ticket (admin)
export const resolveTicket = async (ticketId) => {
    try {
        const response = await axiosInstance.patch(`/admin/tickets/${ticketId}/resolve`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Delete any message from ticket (admin)
export const deleteAdminMessage = async (ticketId, messageId) => {
    try {
        const response = await axiosInstance.delete(`/admin/tickets/${ticketId}/messages/${messageId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Delete a ticket entirely (admin)
export const deleteAdminTicket = async (ticketId) => {
    try {
        const response = await axiosInstance.delete(`/admin/tickets/${ticketId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Reassign a ticket to a specific user (admin)
export const reassignTicket = async (ticketId, userId) => {
    try {
        const response = await axiosInstance.patch(`/admin/tickets/${ticketId}/assign`, { userId });
        return response.data;
    } catch (error) {
        throw error;
    }
};


// =======================================================
// --- PUBLIC / GENERAL APIs (may or may not require auth) ---
// =======================================================

/**
 * Fetches all public units.
 * This function returns `response.data` directly.
 * @returns {Promise<Array>} A promise that resolves to an array of public unit objects.
 * @throws {Error} If the API call fails.
 */
export const getPublicUnits = async () => { // <--- THIS IS THE EXPORTED FUNCTION
    try {
        const response = await axiosInstance.get('/public/units');
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get users by unit name (typically admin-only lookup)
export const getUsersByUnit = async (unitName) => {
    try {
        const response = await axiosInstance.get(`/user/by-unit/${encodeURIComponent(unitName)}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getAdminUsersByUnit = async (unitName) => {
    const response = await axiosInstance.get(`/admin/users?unit=${encodeURIComponent(unitName)}`);
    return response.data;
};

export const deleteAdminUser = async (userId) => {
    const response = await axiosInstance.delete(`/admin/users/${userId}`);
    return response.data;
};