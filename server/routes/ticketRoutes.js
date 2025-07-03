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


// --- Correct order: Specific '/summary' route BEFORE general '/:id' route ---
router.get('/summary', getTicketSummary);

router.get('/:id', getTicketById); // Now this will only be hit if it's not '/summary'

// Add a user reply to a ticket
router.post('/:id/reply', uploadMiddleware.single('image'), addUserReply);

// Get a ticket by ID

export default router;

