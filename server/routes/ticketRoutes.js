import express from 'express';
import {
    createTicket,
    getUserTickets,
    updateTicket,
    closeTicket,
    reopenTicket,
    getTicketById,
    getTicketSummary,
    addUserReply,
    deleteUserMessage,
    // Add the new controller function here
    updateTicketPriority 
} from '../controllers/ticketController.js';

import uploadMiddleware from '../middleware/uploadMiddleware.js'; // For attachments (Multer)
import authMiddleware from '../middleware/authMiddleware.js'; // For authentication

const router = express.Router();

// ---------------------------------------------
// Ticket Creation (with image)
// @route   POST /api/tickets
// @access  Private (User)
router.post('/', authMiddleware, uploadMiddleware.array('attachments', 5), createTicket);

// ---------------------------------------------
// Get all tickets (user or admin based on role)
// @route   GET /api/tickets
// @access  Private
router.get('/', authMiddleware, getUserTickets);

// ---------------------------------------------
// Update a ticket (general update)
// @route   PUT /api/tickets/:id
// @access  Private
router.put('/:id', authMiddleware, updateTicket);

// ---------------------------------------------
// NEW: Update a ticket's priority
// @route   PATCH /api/tickets/:id/priority
// @access  Private (Admin) - You might want to restrict this to only admins
router.patch('/:id/priority', authMiddleware, updateTicketPriority);

// ---------------------------------------------
// Close a ticket
// @route   PATCH /api/tickets/:id/close
// @access  Private
router.patch('/:id/close', authMiddleware, closeTicket);

// ---------------------------------------------
// Reopen a ticket
// @route   PATCH /api/tickets/:id/reopen
// @access  Private
router.patch('/:id/reopen', authMiddleware, reopenTicket);

// ---------------------------------------------
// Ticket Summary
// @route   GET /api/tickets/summary
// @access  Public (or make Private if needed)
router.get('/summary', getTicketSummary);

// ---------------------------------------------
// Get ticket by ID
// @route   GET /api/tickets/:id
// @access  Private
router.get('/:id', authMiddleware, getTicketById);

// ---------------------------------------------
// Add a reply to a ticket (with attachments)
// @route   POST /api/tickets/:id/reply
// @access  Private
router.post('/:id/reply', authMiddleware, uploadMiddleware.array('attachments', 5), addUserReply);

// ---------------------------------------------
// Delete a user message from a ticket
// @route   DELETE /api/tickets/:ticketId/messages/:messageId
// @access  Private (User can delete own messages)
router.delete('/:ticketId/messages/:messageId', authMiddleware, deleteUserMessage);

export default router;