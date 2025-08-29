// client/src/api/ticketApi.js

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

// Create a pre-configured Axios instance for all API calls
export const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Crucial for sending HTTP-only cookies (like your JWT token)
});

// --- Axios Interceptors for Debugging ---

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
            data: response.data, // Log the data
        });
        return response; // RETURN THE FULL RESPONSE OBJECT
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
        return response.data; // Explicitly return data
    } catch (error) {
        throw error;
    }
};

export const loginUser = async (userData) => {
    try {
        const response = await axiosInstance.post('/auth/login', userData);
        return response.data; // Explicitly return data
    } catch (error) {
        throw error;
    }
};

export const adminLogin = async (userData) => {
    try {
        const response = await axiosInstance.post('/auth/admin-login', userData);
        return response.data; // Explicitly return data
    } catch (error) {
        throw error;
    }
};

export const logoutUser = async () => {
    try {
        const response = await axiosInstance.post('/auth/logout');
        return response.data; // Explicitly return data
    } catch (error) {
        throw error;
    }
};

export const getMe = async () => {
    try {
        const response = await axiosInstance.get('/auth/me');
        return response.data; // Explicitly return data
    } catch (error) {
        throw error;
    }
};


// =======================================================
// --- USER TICKET APIs (accessible by authenticated users) ---
// =======================================================

export const createTicket = async (formData) => {
    try {
        const response = await axiosInstance.post('/tickets', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data; // Explicitly return data
    } catch (error) {
        throw error;
    }
};

export const getUserTickets = async () => {
    try {
        const response = await axiosInstance.get('/tickets');
        return response.data; // Explicitly return data
    } catch (error) {
        throw error;
    }
};

export const getUserTicketById = async (ticketId) => {
    try {
        const response = await axiosInstance.get(`/tickets/${ticketId}`);
        return response.data; // Explicitly return data
    } catch (error) {
        throw error;
    }
};

export const updateTicket = async (id, data) => {
    try {
        const response = await axiosInstance.put(`/tickets/${id}`, data);
        return response.data; // Explicitly return data
    } catch (error) {
        throw error;
    }
};

export const closeTicket = async (id) => {
    try {
        const response = await axiosInstance.patch(`/tickets/${id}/close`);
        return response.data; // Explicitly return data
    } catch (error) {
        throw error;
    }
};

export const deleteUserMessage = async (ticketId, messageId) => {
    try {
        const response = await axiosInstance.delete(`/tickets/${ticketId}/messages/${messageId}`);
        return response.data; // Explicitly return data
    } catch (error) {
        throw error;
    }
};


// =======================================================
// --- ADMIN TICKET APIs (accessible by authenticated admins) ---
// =======================================================

/**
 * Fetches all tickets for the admin dashboard.
 * THIS FUNCTION RETURNS THE FULL Axios `response` object, including headers.
 * The calling component (e.g., adminTicketList.jsx) must access `response.data` explicitly.
 * @returns {Promise<AxiosResponse>} A promise that resolves to the full Axios response object.
 * @throws {Error} If the API call fails.
 */
export const getAdminTickets = async () => {
    try {
        // No special interceptor handling needed anymore, just return the full response
        const response = await axiosInstance.get('/admin/tickets');
        return response; // <--- Return the full response object for headers/pagination
    } catch (error) {
        throw error;
    }
};

export const getAdminTicketById = async (ticketId) => {
    try {
        const response = await axiosInstance.get(`/admin/tickets/${ticketId}`);
        return response.data; // Explicitly return data
    } catch (error) {
        throw error;
    }
};

export const sendTicketReply = async (ticketId, formData) => {
    try {
        const response = await axiosInstance.post(`/admin/tickets/${ticketId}/reply`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data; // Explicitly return data
    } catch (error) {
        throw error;
    }
};

export const resolveTicket = async (ticketId) => {
    try {
        const response = await axiosInstance.patch(`/admin/tickets/${ticketId}/resolve`);
        return response.data; // Explicitly return data
    } catch (error) {
        throw error;
    }
};

export const deleteAdminMessage = async (ticketId, messageId) => {
    try {
        const response = await axiosInstance.delete(`/admin/tickets/${ticketId}/messages/${messageId}`);
        return response.data; // Explicitly return data
    } catch (error) {
        throw error;
    }
};

export const deleteAdminTicket = async (ticketId) => {
    try {
        const response = await axiosInstance.delete(`/admin/tickets/${ticketId}`);
        return response.data; // Explicitly return data
    } catch (error) {
        throw error;
    }
};

export const reassignTicket = async (ticketId, userId) => {
    try {
        const response = await axiosInstance.patch(`/admin/tickets/${ticketId}/assign`, { userId });
        return response; // Return full response for consistency
    } catch (error) {
        throw error;
    }
};

// =======================================================
// --- NEW FUNCTION: Update Ticket Priority (for admins) ---
// =======================================================
/**
 * Updates the priority of a specific ticket.
 * @param {string} ticketId - The ID of the ticket to update.
 * @param {string} newPriority - The new priority level ('Low', 'Normal', 'High', 'Critical').
 * @returns {Promise<object>} A promise that resolves to the updated ticket object.
 * @throws {Error} If the API call fails.
 */
export const updateTicketPriority = async (ticketId, newPriority) => {
    try {
        const response = await axiosInstance.put(`/admin/tickets/${ticketId}/priority`, { priority: newPriority });
        return response.data; // Explicitly return data
    } catch (error) {
        throw error;
    }
};

// =======================================================
// --- PUBLIC / GENERAL APIs ---
// =======================================================

export const getPublicUnits = async () => {
    try {
        const response = await axiosInstance.get('/public/units');
        return response.data; // Explicitly return data
    } catch (error) {
        throw error;
    }
};

export const getUsersByUnit = async (unitName) => {
    try {
        const response = await axiosInstance.get(`/user/by-unit/${encodeURIComponent(unitName)}`);
        return response.data; // Explicitly return data
    } catch (error) {
        throw error;
    }
};

export const getAdminUsersByUnit = async (unitName) => {
    try {
        const response = await axiosInstance.get(`/admin/tickets/users/${encodeURIComponent(unitName)}`);
        return response.data; // Explicitly return data
    } catch (error) {
        throw error;
    }
};

export const deleteAdminUser = async (userId) => {
    try {
        const response = await axiosInstance.delete(`/admin/users/${userId}`);
        return response.data; // Explicitly return data
    } catch (error) {
        throw error;
    }
};

// --- ADMIN REPORT APIs ---
export const getAdminReportChartImageUrl = () => `${API_URL}/admin/tickets/report/chart`;
export const getAdminReportPdfUrl = () => `${API_URL}/admin/tickets/report/download`;

export const getAdminTicketsSummary = async () => {
    try {
        const response = await axiosInstance.get('/admin/tickets/summary');
        return response.data; // Explicitly return data
    } catch (error) {
        throw error;
    }
};

export const getAvgResolutionTime = async () => {
    try {
        const response = await axiosInstance.get('/admin/tickets/avg-resolution-time');
        return response.data; // Explicitly return data
    } catch (error) {
        throw error;
    }
};

export const getAssigneePerformance = async () => {
    try {
        const response = await axiosInstance.get('/admin/tickets/assignee-performance');
        console.log('%cAssignee Performance API Data:',"background: #222; color: #bada55", response.data);
        return response.data; // Explicitly return data
    } catch (error) {
        throw error;
    }
};

export const getTicketStatusDistribution = async () => {
    try {
        const response = await axiosInstance.get('/admin/tickets/status-distribution');
        return response.data; // Explicitly return data
    } catch (error) {
        throw error;
    }
};

export const getTicketTypeDistribution = async () => {
    try {
        const response = await axiosInstance.get('/admin/tickets/type-distribution');
        return response.data; // Explicitly return data
    } catch (error) {
        throw error;
    }
};

export const getTicketPriorityDistribution = async () => {
    try {
        const response = await axiosInstance.get('/admin/tickets/priority-distribution');
        return response.data; // Explicitly return data
    } catch (error) {
        throw error;
    }
};

// Corrected function to accept unitName as a parameter
export const getTicketsByUnit = async (unitName) => {
    try {
        const response = await axiosInstance.get('/admin/tickets/tickets_by_unit');
        console.log("Tickets by Unit API Response:", response.data);
        return response; // Return full response for consistency
    } catch (error) {
        console.error("Tickets by Unit API Error:", error);
        throw error;
    }
};

export const getActivityLogs = async () => {
    try {
        const response = await axiosInstance.get('/admin/activity-logs');
        return response.data; // Explicitly return data
    } catch (error) {
        throw error;
    }
};

export const getRecentTickets = async () => {
    try {
        const response = await axiosInstance.get('/admin/tickets/recent');
        console.log(response.data);
        return response.data; // Explicitly return data
    } catch (error) {
        throw error;
    }
};