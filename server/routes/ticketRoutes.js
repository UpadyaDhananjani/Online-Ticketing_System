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


export default router;
