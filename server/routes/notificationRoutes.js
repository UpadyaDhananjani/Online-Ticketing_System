import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../controllers/notificationController.js';

const router = express.Router();

// Get all notifications for the authenticated user
router.get('/', authMiddleware, getNotifications);

// Mark a single notification as read
router.put('/:id/read', authMiddleware, markNotificationAsRead);

// Mark all notifications as read
router.put('/read-all', authMiddleware, markAllNotificationsAsRead);

export default router;
