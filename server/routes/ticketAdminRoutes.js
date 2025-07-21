//ticketAdminRoutes.js

import express from 'express';
import { 
  getAllTickets, 
  addAdminReply, 
  deleteMessage, // --- IMPORTED: New deleteMessage function ---
  resolveTicket, // Imported named resolveTicket
  markTicketOpen, // Imported named markTicketOpen
  markTicketInProgress, // Imported named markTicketInProgress
  deleteTicket, // <-- Add this import
  reassignTicket, // <-- Add this import
  getAdminTicketById // <-- Add this import
} from '../controllers/ticketAdminController.js'; // All admin controllers from one file

import authMiddleware from '../middleware/authMiddleware.js'; // Ensure authMiddleware is imported
import upload from '../middleware/uploadMiddleware.js'; // Assuming this is your multer config for attachments

const router = express.Router();

// Apply authMiddleware to all admin routes
router.use(authMiddleware); // --- FIXED: authMiddleware applied to all routes in this router ---

// Get all tickets for admin dashboard (now correctly populates user)
router.get('/', getAllTickets);

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
