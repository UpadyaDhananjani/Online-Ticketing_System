import express from 'express';
import {
  createTicket,
  getUserTickets,
  updateTicket,
  closeTicket,
  reopenTicket,
  upload, // Multer upload middleware from controller
  getTicketById,
  getTicketSummary,
  addUserReply,
  deleteUserMessage // <-- IMPORT THE NEW FUNCTION
} from '../controllers/ticketController.js';

import uploadMiddleware from '../middleware/uploadMiddleware.js'; // Assuming this is for reply attachments
import authMiddleware from '../middleware/authMiddleware.js'; // Your authentication middleware

const router = express.Router();

// Create a ticket (with image and assignedUnit)
// @route   POST /api/tickets
// @access  Private (User)
router.post('/', authMiddleware, upload.single('image'), createTicket);

// Get all tickets for user (or all for admin if this route is shared)
// @route   GET /api/tickets
// @access  Private (User/Admin)
router.get('/', authMiddleware, getUserTickets);

// Update a ticket (including assignedUnit)
// @route   PUT /api/tickets/:id
// @access  Private (User/Admin)
router.put('/:id', authMiddleware, updateTicket);

// Close a ticket
// @route   PATCH /api/tickets/:id/close
// @access  Private (User/Admin)
router.patch('/:id/close', authMiddleware, closeTicket);

// Reopen a ticket
// @route   PATCH /api/tickets/:id/reopen
// @access  Private (User/Admin)
router.patch('/:id/reopen', authMiddleware, reopenTicket);

// Get ticket summary (e.g., counts of open, in progress, resolved)
// @route   GET /api/tickets/summary
// @access  Public (or Private if you want to restrict)
router.get('/summary', getTicketSummary); // No authMiddleware here if it's public

// Get ticket by ID
// @route   GET /api/tickets/:id
// @access  Private (User/Admin)
router.get('/:id', authMiddleware, getTicketById);

// Add a user reply to a ticket
// @route   POST /api/tickets/:id/reply
// @access  Private (User)
router.post('/:id/reply', authMiddleware, uploadMiddleware.single('image'), addUserReply); // Added authMiddleware

// --- NEW ROUTE: Delete a message from a ticket by a user ---
// @route   DELETE /api/tickets/:ticketId/messages/:messageId
// @access  Private (User) - Authenticated user can delete their own messages
router.delete('/:ticketId/messages/:messageId', authMiddleware, deleteUserMessage);

export default router;
