import Notification from '../models/notificationModel.js';
import asyncHandler from 'express-async-handler';

// @desc    Get all notifications for a user
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
    // Get notifications for the authenticated user, sorted by creation date
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
});

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markNotificationAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
        res.status(404);
        throw new Error('Notification not found');
    }

    // Ensure the notification belongs to the authenticated user
    if (notification.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to update this notification');
    }

    notification.isRead = true;
    const updatedNotification = await notification.save();

    res.status(200).json(updatedNotification);
});

// @desc    Mark all notifications as read for a user
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { user: req.user._id, isRead: false },
        { $set: { isRead: true } }
    );

    res.status(200).json({ message: 'All notifications marked as read' });
});

// Function to create a new notification (used by other controllers)
const createNotification = async (userId, message, type, ticketId) => {
    try {
        const newNotification = new Notification({
            user: userId,
            message,
            type,
            ticket: ticketId,
        });
        await newNotification.save();
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

export {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    createNotification,
};
