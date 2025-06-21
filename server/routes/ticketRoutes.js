// server/routes/ticketRoutes.js
import express from 'express';
import {
  createTicket,
  getUserTickets,
  updateTicket,
  closeTicket,
  reopenTicket
} from '../controllers/ticketController.js';

const router = express.Router();

router.post('/', /*authMiddleware,*/ createTicket);
router.get('/', /*authMiddleware,*/ getUserTickets);
router.put('/:id', /*authMiddleware,*/ updateTicket);
router.patch('/:id/close', /*authMiddleware,*/ closeTicket);
router.patch('/:id/reopen', reopenTicket);

export default router;
