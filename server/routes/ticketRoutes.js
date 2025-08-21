// server/routes/ticketRoutes.js
import express from 'express';
import {
    createTicket,
    getUserTickets,
    updateTicket,
    closeTicket,
    reopenTicket,
    getTicketById,
    getRecentTickets,
    getTicketSummary,
    updateTicketPriority,
    addUserReply,
    deleteUserMessage,
} from '../controllers/ticketController.js';

import uploadMiddleware from '../middleware/uploadMiddleware.js'; // For attachments (Multer)
import authMiddleware from '../middleware/authMiddleware.js'; // For authentication

const router = express.Router();

// ---------------------------------------------
// GET specific routes first to avoid ID conflicts
// ---------------------------------------------

// @route   GET /api/tickets/summary
// @access  Private (Admin)
router.get('/summary', authMiddleware, getTicketSummary);

// @route   GET /api/tickets/recent
// @access  Private
router.get('/recent', authMiddleware, getRecentTickets);


// ---------------------------------------------
// General routes for all tickets
// ---------------------------------------------

// @route   POST /api/tickets
// @access  Private (User)
router.post('/', authMiddleware, uploadMiddleware.array('attachments', 5), createTicket);

// @route   GET /api/tickets
// @access  Private
router.get('/', authMiddleware, getUserTickets);


// ---------------------------------------------
// Specific routes with dynamic IDs
// ---------------------------------------------

// @route   GET /api/tickets/:id
// @access  Private
router.get('/:id', authMiddleware, getTicketById);

// @route   PUT /api/tickets/:id
// @access  Private
router.put('/:id', authMiddleware, updateTicket);

// @route   PATCH /api/tickets/:id/priority
// @access  Private (Admin)
router.patch('/:id/priority', authMiddleware, updateTicketPriority);

// @route   PATCH /api/tickets/:id/close
// @access  Private
router.patch('/:id/close', authMiddleware, closeTicket);

// @route   PATCH /api/tickets/:id/reopen
// @access  Private
router.patch('/:id/reopen', authMiddleware, reopenTicket);

// @route   POST /api/tickets/:id/reply
// @access  Private
router.post('/:id/reply', authMiddleware, uploadMiddleware.array('attachments', 5), addUserReply);


// ---------------------------------------------
// Route for nested resources
// ---------------------------------------------

// @route   DELETE /api/tickets/:ticketId/messages/:messageId
// @access  Private (User can delete own messages)
router.delete('/:ticketId/messages/:messageId', authMiddleware, deleteUserMessage);


export default router;