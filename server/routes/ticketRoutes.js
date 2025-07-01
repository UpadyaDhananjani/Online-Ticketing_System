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
  getTicketSummary// <-- IMPORT THE NEW FUNCTION

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


// --- FIX: Place the more specific '/summary' route BEFORE the general '/:id' route ---
router.get('/summary', getTicketSummary); // This route MUST come before router.get('/:id')

router.get('/:id', getTicketById); // Now this will only be hit if it's not '/summary'



// Get a ticket by ID

export default router;

