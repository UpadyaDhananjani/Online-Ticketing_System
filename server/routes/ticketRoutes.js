// server/routes/ticketRoutes.js
import express from 'express';
import {
  createTicket,
  getUserTickets,
  updateTicket,
  closeTicket,
  reopenTicket,
  upload,
  getTicketById
} from '../controllers/ticketController.js';

const router = express.Router();

// Create a ticket (with image and assignedUnit)
router.post('/', upload.single('image'), createTicket);

// Get all tickets for user (or all for admin)
router.get('/', /*authMiddleware,*/ getUserTickets);

// Update a ticket (including assignedUnit)
router.put('/:id', /*authMiddleware,*/ updateTicket);

// Close a ticket
router.patch('/:id/close', /*authMiddleware,*/ closeTicket);

// Reopen a ticket
router.patch('/:id/reopen', reopenTicket);

// Get a ticket by ID
router.get('/:id', getTicketById);

export default router;
