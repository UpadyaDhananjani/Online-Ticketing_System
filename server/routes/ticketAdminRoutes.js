import express from 'express';
import {
  getAllTickets,
  addAdminReply
} from '../controllers/ticketAdminController.js';
// import authMiddleware from '../middleware/authMiddleware.js';
// import adminMiddleware from '../middleware/adminMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

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

export default router;
