<<<<<<< Updated upstream
import express from 'express';
import {
  getAllTickets,
  addAdminReply
} from '../controllers/ticketAdminController.js';
// import authMiddleware from '../middleware/authMiddleware.js';
// import adminMiddleware from '../middleware/adminMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

import Ticket from '../models/ticketModel.js';

const router = express.Router();

// Get all tickets (admin)
// router.get('/', adminMiddleware, getAllTickets);
router.get('/', getAllTickets);

// Add reply with optional attachments
router.post(
  '/:id/reply',
//   authMiddleware,
//   adminMiddleware,
  upload.array('attachments', 5), // up to 5 files
  addAdminReply
);


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


export default router;
=======
import express from 'express';
import { getAllTickets, addAdminReply } from '../controllers/ticketAdminController.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Disabled auth for development
router.get('/', getAllTickets);
router.post('/:id/reply', upload.array('attachments', 5), addAdminReply);

export default router;
>>>>>>> Stashed changes
