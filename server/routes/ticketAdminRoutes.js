import express from 'express';
import { getAllTickets, addAdminReply } from '../controllers/ticketAdminController.js';
import upload from '../middleware/uploadMiddleware.js';

import Ticket from '../models/ticketModel.js';

const router = express.Router();

// Disabled auth for development
router.get('/', getAllTickets);

// Add reply with optional attachments
router.post(
  '/:id/reply',
//   authMiddleware,
//   adminMiddleware,
  upload.array('attachments', 5), // up to 5 files
  addAdminReply
);

// Mark ticket as resolved
router.patch('/:id/resolve', async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status: 'resolved', updatedAt: Date.now() },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark ticket as open
router.patch('/:id/open', async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status: 'open', updatedAt: Date.now() },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.patch('/:id/in progress', async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status: 'in progress', updatedAt: Date.now() },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a message from a ticket
router.delete('/:ticketId/messages/:messageId', async (req, res) => {
  try {
    const { ticketId, messageId } = req.params;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      console.error('Ticket not found:', ticketId);
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Defensive: ensure messages is an array
    if (!Array.isArray(ticket.messages)) {
      console.error('Ticket messages is not an array:', ticket.messages);
      return res.status(500).json({ error: 'Ticket messages is not an array' });
    }

    const msgIndex = ticket.messages.findIndex(m => m._id.toString() === messageId);
    if (msgIndex === -1) {
      console.error('Message not found:', messageId);
      return res.status(404).json({ error: 'Message not found' });
    }

    ticket.messages.splice(msgIndex, 1);
    ticket.updatedAt = Date.now();
    await ticket.save();

    res.json({ success: true, ticket });
  } catch (err) {
    console.error('Delete message error:', err);
    res.status(500).json({ error: err.message });
  }
});


export default router;

