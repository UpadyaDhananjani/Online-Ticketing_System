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
  getTicketSummary // <-- IMPORT THE NEW FUNCTION
} from '../controllers/ticketController.js';

const router = express.Router();

router.post('/', upload.single('image'), createTicket);
router.get('/', /*authMiddleware,*/ getUserTickets);
router.put('/:id', /*authMiddleware,*/ updateTicket);
router.patch('/:id/close', /*authMiddleware,*/ closeTicket);
router.patch('/:id/reopen', reopenTicket);

// --- FIX: Place the more specific '/summary' route BEFORE the general '/:id' route ---
router.get('/summary', getTicketSummary); // This route MUST come before router.get('/:id')

router.get('/:id', getTicketById); // Now this will only be hit if it's not '/summary'

export default router;