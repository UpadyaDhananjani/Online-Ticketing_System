// adminRoutes.js

import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { 
    getAllUsers, 
    deleteUser,
    // Import the new controller function for updating priority
    updateTicketPriority 
} from '../controllers/adminController.js';
import { generateTicketReport } from '../controllers/ReportController.js';

const adminRouter = express.Router();

// Existing routes
adminRouter.get('/users', protect, admin, getAllUsers);
adminRouter.delete('/users/:id', protect, admin, deleteUser);

// Report routes
adminRouter.get('/tickets/report/download', protect, admin, generateTicketReport);

// @route   PUT /api/admin/tickets/:id/priority
// @desc    Update a ticket's priority
// @access  Private (Admin)
adminRouter.put('/tickets/:id/priority', protect, admin, updateTicketPriority);

export default adminRouter;