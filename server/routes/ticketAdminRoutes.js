// server/routes/adminRoutes.js
import express from 'express';
import {
    getAllTickets,
    addAdminReply,
    deleteMessage,
    resolveTicket,
    markTicketOpen,
    markTicketInProgress,
    deleteTicket,
    getAdminTicketById,
    getUsersByUnit, // Keep this
    reassignTicket // Keep this
} from '../controllers/ticketAdminController.js';

import authMiddleware from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

// =========================================================================
// IMPORTANT: Order matters! Place more specific routes BEFORE generic ones.
// =========================================================================

// --- MODIFIED ROUTE: Get users by unit (now uses :unitName) ---
router.get('/users/by-unit-name/:unitName', getUsersByUnit); // Changed from :unitId to :unitName

// Reassign a ticket (uses :id, but has a specific '/assign' suffix)
router.patch('/:id/assign', reassignTicket);

// Main route for getting all tickets (no ID parameter)
router.get('/', getAllTickets);

// Get a single ticket by ID for admin (GENERIC :id route - must come AFTER specific ones)
router.get('/:id', getAdminTicketById);

// Add reply with optional attachments
router.post(
    '/:id/reply',
    upload.array('attachments', 5),
    addAdminReply
);

// Mark ticket status changes (specific suffixes after :id)
router.patch('/:id/resolve', resolveTicket);
router.patch('/:id/open', markTicketOpen);
router.patch('/:id/in-progress', markTicketInProgress);

// Delete a message from a ticket (two ID parameters)
router.delete('/:ticketId/messages/:messageId', deleteMessage);

// Delete a ticket entirely (generic :id delete route)
router.delete('/:id', deleteTicket);

export default router;