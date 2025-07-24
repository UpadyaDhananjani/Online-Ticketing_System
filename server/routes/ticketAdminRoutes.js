// ticketAdminRoutes.js

import express from 'express';
import {
    getAllTickets,
    addAdminReply,
    deleteMessage,
    resolveTicket,
    markTicketOpen,
    markTicketInProgress,
    deleteTicket,
    reassignTicket,
    getAdminTicketById, // Keep this import
} from '../controllers/ticketAdminController.js';

import {
    generateReportChartImage,
    downloadReportPdf,
    getAssigneePerformance,
    getTicketsByUnit,
    getAvgResolutionTime,
    getTicketActivityLogs
} from '../controllers/ReportController.js';

// IMPORTANT: Import getTicketSummary from TicketController.js
import { getTicketSummary } from '../controllers/ticketController.js';

import authMiddleware from '../middleware/authMiddleware.js';
import authorizeRoles from '../middleware/authorizeRoles.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Apply authMiddleware and authorizeRoles('admin') to all admin routes in this router
router.use(authMiddleware);
router.use(authorizeRoles('admin'));

// --- REPORT ROUTES (MUST COME BEFORE DYNAMIC ID ROUTES) ---
// NEW: Add the missing /summary route and ensure it's protected
router.get('/summary', getTicketSummary); // <-- MOVED TO TOP
router.get('/reports/chart-image', generateReportChartImage);
router.get('/reports/pdf', downloadReportPdf);
router.get('/assignee-performance', getAssigneePerformance);
router.get('/tickets-by-unit', getTicketsByUnit);
router.get('/avg-resolution-time', getAvgResolutionTime);
router.get('/activity-logs', getTicketActivityLogs);

// --- GENERAL TICKET ROUTES ---
router.get('/', getAllTickets); // Get all tickets for admin dashboard

// --- DYNAMIC ID ROUTES (MUST COME AFTER STATIC ROUTES) ---
// Get a single ticket by ID (Admin only)
router.get('/:id', getAdminTicketById); // <-- NOW AFTER /summary

// Add reply with optional attachments
router.post(
    '/:id/reply',
    upload.array('attachments', 5), // up to 5 files
    addAdminReply
);

// Mark ticket as resolved
router.patch('/:id/resolve', resolveTicket);

// Mark ticket as open
router.patch('/:id/open', markTicketOpen);

// Mark ticket as in progress
router.patch('/:id/in-progress', markTicketInProgress);

// Delete a message from a ticket (Admin only)
router.delete('/:ticketId/messages/:messageId', deleteMessage);

// Delete a ticket (Admin only)
router.delete('/:id', deleteTicket);

// Reassign a ticket (Admin only)
router.patch('/:id/assign', reassignTicket);


export default router;
