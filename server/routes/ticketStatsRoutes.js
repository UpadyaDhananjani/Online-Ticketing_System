import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { getTicketStats } from '../controllers/ticketStatsController.js';

const ticketStatsRouter = express.Router();

// @route   GET /api/admin/tickets/stats
// @desc    Get ticket statistics
// @access  Private/Admin
ticketStatsRouter.get('/stats', protect, admin, getTicketStats);

export default ticketStatsRouter;
