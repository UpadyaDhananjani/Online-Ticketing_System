// server/routes/ticketAdminRoutes.js

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
  getAdminTicketById,
  getAdminTicketsSummary,
  getRecentTickets,
  getAdminUsersByUnit
} from '../controllers/ticketAdminController.js';

import {
  generateReportChartImage, 
  downloadReportPdf,
  getAssigneePerformance,
  getTicketsByUnit,
  getAvgResolutionTime,
  getTicketActivityLogs,
  getTicketStatusDistribution,  // Add this import
  getTicketTypeDistribution    // Add this import
} from '../controllers/ReportController.js';

import authMiddleware from '../middleware/authMiddleware.js';
import authorizeRoles from '../middleware/authorizeRoles.js';
import upload from '../middleware/uploadMiddleware.js'; // Assuming this is for file uploads

const router = express.Router();

// Apply auth and role-based middleware to all routes
router.use(authMiddleware);
router.use(authorizeRoles('admin'));

// -------------------- Admin Ticket Routes --------------------


// Charts and analytics
// --- REPORT ROUTES ---
router.get('/reports/chart-image', generateReportChartImage);
router.get('/reports/pdf', downloadReportPdf);
router.get('/assignee-performance', getAssigneePerformance);
router.get('/tickets_by_unit', getTicketsByUnit);
router.get('/avg-resolution-time', getAvgResolutionTime);
router.get('/activity-logs', getTicketActivityLogs);
router.get('/status-distribution', getTicketStatusDistribution);  // Add this route
router.get('/type-distribution', getTicketTypeDistribution);      // Add this route
router.get('/recent', getRecentTickets); // New route for recent tickets

// Summary widget for dashboard
router.get('/summary', getAdminTicketsSummary);

// Get all tickets for admin dashboard
router.get('/', getAllTickets);

// Get users by unit for reassignment
router.get('/users/:unit', getAdminUsersByUnit);

// Get a single ticket by ID (admin only)
router.get('/:id', getAdminTicketById);

// Add a reply to a ticket with optional attachments
router.post('/:id/reply', upload.array('attachments', 5), addAdminReply);

// Mark ticket status updates
router.patch('/:id/resolve', resolveTicket);
router.patch('/:id/open', markTicketOpen);
router.patch('/:id/in-progress', markTicketInProgress);

// Delete a message from a ticket
router.delete('/:ticketId/messages/:messageId', deleteMessage);

// Delete a ticket
router.delete('/:id', deleteTicket);

// Reassign a ticket
router.patch('/:id/assign', reassignTicket);

// -------------------- Admin Summary and Reports --------------------


export default router;