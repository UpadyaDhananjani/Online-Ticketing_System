// adminRoutes.js

import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { 
    getAllUsers, 
    deleteUser,
    // Import the new controller function for updating priority
    updateTicketPriority 
} from '../controllers/adminController.js'; // Make sure this controller function exists

const adminRouter = express.Router();

// Existing routes
adminRouter.get('/users', authMiddleware, getAllUsers);
adminRouter.delete('/users/:id', authMiddleware, deleteUser);

// NEW ROUTE TO FIX THE ERROR
// @route   PUT /api/admin/tickets/:id/priority
// @desc    Update a ticket's priority
// @access  Private (Admin)
adminRouter.put('/tickets/:id/priority', authMiddleware, updateTicketPriority);

export default adminRouter;