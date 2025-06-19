// server/routes/ticketRoutes.js
import express from 'express';
import {
  createTicket,
  getUserTickets,
  updateTicket,
  closeTicket
} from '../controllers/ticketController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, createTicket);
router.get('/', authMiddleware, getUserTickets);
router.put('/:id', authMiddleware, updateTicket);
router.patch('/:id/close', authMiddleware, closeTicket);

export default router;
