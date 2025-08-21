import mongoose from 'mongoose';

const notificationSchema = mongoose.Schema(
    {
        // The user who receives the notification
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Reference to your User model
            required: true,
        },
        // The message to be displayed to the user
        message: {
            type: String,
            required: true,
        },
        // The type of notification (e.g., new_ticket, admin_reply)
        type: {
            type: String,
            enum: ['new_ticket', 'admin_opened', 'admin_reply', 'reassigned'],
            required: true,
        },
        // A link back to the specific ticket, if applicable
        ticket: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ticket', // Reference to your Ticket model
        },
        // The read status of the notification
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields
    }
);

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
