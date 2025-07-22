//adminRoutes.js

import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { getAllUsers, deleteUser } from '../controllers/adminController.js';

const adminRouter = express.Router();

adminRouter.get('/users', authMiddleware, getAllUsers);
adminRouter.delete('/users/:id', authMiddleware, deleteUser);

export default adminRouter;