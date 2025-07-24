//ticketAdminRoutes.js

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
  getAdminTicketsSummary // Add this import
} from '../controllers/ticketAdminController.js';

import { 
  generateReportChartImage, 
  downloadReportPdf,
  getAssigneePerformance,
  getTicketsByUnit,
  getAvgResolutionTime,
  getTicketActivityLogs,
  getTicketStatusDistribution,  // Add comma here
  getTicketTypeDistribution     // Add this import
} from '../controllers/ReportController.js';

import authMiddleware from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Apply authMiddleware to all admin routes
router.use(authMiddleware);

// Get all tickets for admin dashboard
router.get('/', getAllTickets);

// Get ticket summary for admin dashboard
router.get('/summary', getAdminTicketsSummary); // Add this route
// --- REPORT ROUTES ---
router.get('/reports/chart-image', generateReportChartImage);
router.get('/reports/pdf', downloadReportPdf);
router.get('/assignee-performance', getAssigneePerformance);
router.get('/tickets-by-unit', getTicketsByUnit);
router.get('/avg-resolution-time', getAvgResolutionTime);
router.get('/activity-logs', getTicketActivityLogs);
// Add this route with the other report routes
router.get('/status-distribution', getTicketStatusDistribution);
router.get('/type-distribution', getTicketTypeDistribution);      // Add this route


// Add reply with optional attachments
router.post(
  '/:id/reply',
  upload.array('attachments', 5), // up to 5 files
  addAdminReply
);

// Mark ticket as resolved
router.patch('/:id/resolve', resolveTicket); // Using named export from controller

// Mark ticket as open
router.patch('/:id/open', markTicketOpen); // Using named export from controller

// Mark ticket as in progress
router.patch('/:id/in-progress', markTicketInProgress); // Using named export from controller, changed path to kebab-case

// --- NEW ROUTE: Delete a message from a ticket (Admin only) ---
router.delete('/:ticketId/messages/:messageId', deleteMessage); // Using named export from controller

// --- NEW ROUTE: Delete a ticket (Admin only) ---
router.delete('/:id', deleteTicket);

// --- NEW ROUTE: Reassign a ticket (Admin only) ---
router.patch('/:id/assign', reassignTicket);

// --- NEW ROUTE: Get a single ticket by ID (Admin only) ---
router.get('/:id', getAdminTicketById);


export default router;
