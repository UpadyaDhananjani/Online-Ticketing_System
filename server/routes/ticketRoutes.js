// server/routes/ticketRoutes.js
import express from 'express';
import {
  createTicket,
  getUserTickets,
  updateTicket,
  closeTicket,
  reopenTicket,
  upload,
  getTicketById,

  getTicketSummary,

  addUserReply // <-- IMPORT THE NEW FUNCTION


} from '../controllers/ticketController.js';
import uploadMiddleware from '../middleware/uploadMiddleware.js';

import authMiddleware from '../middleware/authMiddleware.js'; // <-- This is correctly imported

const router = express.Router();

// Create a ticket (with image and assignedUnit)
// --- CONFIRMATION: authMiddleware is BEFORE upload.single('image') ---
router.post('/', authMiddleware, upload.single('image'), createTicket);

// Get all tickets for user (or all for admin)
router.get('/', authMiddleware, getUserTickets); // Confirmed authMiddleware is here

// Update a ticket (including assignedUnit)
router.put('/:id', authMiddleware, updateTicket);

// Close a ticket
router.patch('/:id/close', authMiddleware, closeTicket);

// Reopen a ticket
router.patch('/:id/reopen', authMiddleware, reopenTicket);


// --- Correct order: Specific '/summary' route BEFORE general '/:id' route ---
router.get('/summary', getTicketSummary); // No authMiddleware here if it's public


router.get('/:id', authMiddleware, getTicketById);


// Add a user reply to a ticket
router.post('/:id/reply', uploadMiddleware.single('image'), addUserReply);


// Delete a message from a ticket
router.delete('/:ticketId/messages/:messageId', async (req, res) => {
  try {
    const { ticketId, messageId } = req.params;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    // Find the message index
    const msgIndex = ticket.messages.findIndex(m => m._id.toString() === messageId);
    if (msgIndex === -1) return res.status(404).json({ error: 'Message not found' });

    // Optionally: Check if the requester is allowed to delete (authorRole or user check)
    // Example: Only allow if admin or the message author is the current user
    // if (ticket.messages[msgIndex].authorRole === 'admin' && !req.user.isAdmin) return res.status(403).json({ error: 'Forbidden' });

    ticket.messages.splice(msgIndex, 1);
    ticket.updatedAt = Date.now();
    await ticket.save();

    res.json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a ticket by ID


export default router;
