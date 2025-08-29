// server/controllers/ticketController.js
import mongoose from 'mongoose';
import Ticket from '../models/ticketModel.js';
import Notification from '../models/notificationModel.js';
import User from '../models/userModel.js';
import asyncHandler from 'express-async-handler';

// Helper function to create a new notification
const createNotification = async (userId, message, type, ticketId) => {
    try {
        await Notification.create({
            user: userId,
            message,
            type,
            ticket: ticketId,
        });
        console.log(`Notification created for user ${userId} of type ${type}`);
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

// @desc    Create a new ticket
// @route   POST /api/tickets
// @access  Private
const createTicket = asyncHandler(async (req, res) => {
    const { subject, type, description, priority, assignedUnit } = req.body;
    const attachments = req.files ? req.files.map(file => file.path) : [];

    const newTicket = new Ticket({
        user: req.user._id,
        subject,
        type,
        description,
        priority,
        assignedUnit,
        attachments,
        status: 'open'
    });

    const savedTicket = await newTicket.save();

    const admins = await User.find({ isAdmin: true });
    for (const admin of admins) {
        await createNotification(admin._id, `New ticket created: ${subject}`, 'new_ticket', savedTicket._id);
    }

    res.status(201).json(savedTicket);
});

// @desc    Update a ticket
// @route   PUT /api/tickets/:id
// @access  Private
const updateTicket = asyncHandler(async (req, res) => {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
        res.status(404);
        throw new Error('Ticket not found');
    }

    const { subject, description, status, assignedTo, assignedUnit } = req.body;
    const originalAssignedTo = ticket.assignedTo?.toString();

    if (subject) ticket.subject = subject;
    if (description) ticket.description = description;
    if (status) ticket.status = status;
    if (assignedTo) ticket.assignedTo = assignedTo;
    if (assignedUnit) ticket.assignedUnit = assignedUnit;
    ticket.updatedAt = Date.now();

    const updatedTicket = await ticket.save();

    if (assignedTo && originalAssignedTo && originalAssignedTo !== assignedTo) {
        await createNotification(
            originalAssignedTo,
            `Ticket '${updatedTicket.subject}' has been reassigned to another user.`,
            'reassigned',
            updatedTicket._id
        );
    }

    if (status === 'resolved' || status === 'closed') {
        await createNotification(
            updatedTicket.user,
            `Ticket '${updatedTicket.subject}' has been ${status}.`,
            'admin_reply',
            updatedTicket._id
        );
    }

    res.status(200).json(updatedTicket);
});

// @desc    Get tickets (user sees own, admin sees all)
// @route   GET /api/tickets
// @access  Private
const getUserTickets = asyncHandler(async (req, res) => {
    const { user } = req;
    const query = user.isAdmin ? {} : { $or: [{ user: user._id }, { assignedTo: user._id }] };

    const tickets = await Ticket.find(query)
        .populate('user', 'name email')
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 });

    res.status(200).json(tickets);
});

// @desc    Update a ticket's priority
// @route   PATCH /api/tickets/:id/priority
// @access  Private (Admin)
const updateTicketPriority = asyncHandler(async (req, res) => {
    const { priority } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
        res.status(404);
        throw new Error('Ticket not found');
    }

    ticket.priority = priority;
    await ticket.save();

    res.status(200).json({ message: `Priority updated to ${priority}`, ticket });
});

// @desc    Get a single ticket by ID
// @route   GET /api/tickets/:id
// @access  Private
const getTicketById = asyncHandler(async (req, res) => {
    const ticket = await Ticket.findById(req.params.id)
        .populate('user', 'name email')
        .populate('assignedTo', 'name email')
        .populate('messages.author', 'name email');

    if (!ticket) {
        res.status(404);
        throw new Error('Ticket not found');
    }

    res.status(200).json(ticket);
});

// @desc    Get recent tickets
// @route   GET /api/tickets/recent
// @access  Private
const getRecentTickets = asyncHandler(async (req, res) => {
    const tickets = await Ticket.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('user', 'name email')
        .populate('assignedTo', 'name email');

    res.status(200).json(tickets);
});

// @desc    Delete a ticket
// @route   DELETE /api/tickets/:id
// @access  Private
const deleteTicket = asyncHandler(async (req, res) => {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
        res.status(404);
        throw new Error('Ticket not found');
    }

    await ticket.deleteOne();
    res.status(200).json({ message: 'Ticket removed' });
});

// @desc    Close a ticket
// @route   PATCH /api/tickets/:id/close
// @access  Private (Admin)
const closeTicket = asyncHandler(async (req, res) => {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
        res.status(404);
        throw new Error('Ticket not found');
    }

    if (ticket.status === 'closed') {
        res.status(400);
        throw new Error('Ticket is already closed');
    }

    ticket.status = 'closed';
    await ticket.save();

    await createNotification(
        ticket.user,
        `Your ticket '${ticket.subject}' has been closed.`,
        'admin_reply',
        ticket._id
    );

    res.status(200).json(ticket);
});

// @desc    Reopen a ticket
// @route   PATCH /api/tickets/:id/reopen
// @access  Private (Admin)
const reopenTicket = asyncHandler(async (req, res) => {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
        res.status(404);
        throw new Error('Ticket not found');
    }

    if (ticket.status !== 'closed') {
        res.status(400);
        throw new Error('Ticket is not closed');
    }

    ticket.status = 'reopened';
    await ticket.save();

    await createNotification(
        ticket.user,
        `Your ticket '${ticket.subject}' has been reopened.`,
        'admin_reply',
        ticket._id
    );

    res.status(200).json(ticket);
});

// @desc    Get a summary of tickets by status
// @route   GET /api/tickets/summary
// @access  Public
const getTicketSummary = async (req, res) => {
    try {
        const summary = await Ticket.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);
        res.status(200).json(summary);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a user reply to a ticket
// @route   POST /api/tickets/:id/reply
// @access  Private
const addUserReply = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const attachments = req.files ? req.files.map(file => file.path) : [];

        const ticket = await Ticket.findById(id);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Ensure messages array exists
        if (!ticket.messages) {
            ticket.messages = [];
        }

        ticket.messages.push({
            author: req.user._id,
            authorRole: 'user',
            content,
            attachments,
            date: new Date()
        });

        // Update ticket status if it's closed or resolved
        const previousStatus = ticket.status;
        if (ticket.status === 'closed' || ticket.status === 'resolved') {
            ticket.status = 'reopened';
            console.log(`Ticket ${id} status changed from '${previousStatus}' to 'reopened' due to user reply`);
        }

        ticket.updatedAt = new Date();
        await ticket.save();

        // Create notification for admins
        const admins = await User.find({ isAdmin: true });
        for (const admin of admins) {
            await createNotification(
                admin._id,
                `New reply on ticket: ${ticket.subject}`,
                'user_reply',
                ticket._id
            );
        }

        // Populate the updated ticket for response
        const updatedTicket = await Ticket.findById(id)
            .populate('user', 'name email')
            .populate('assignedTo', 'name email')
            .populate('reassignedTo', 'name email')
            .populate({
                path: 'messages.author',
                select: 'name email'
            });

        res.status(200).json(updatedTicket);
    } catch (error) {
        console.error("Error adding user reply:", error);
        res.status(500).json({ message: 'Server error adding reply.' });
    }
};

// @desc    Delete a user message
// @route   DELETE /api/tickets/:ticketId/messages/:messageId
// @access  Private
const deleteUserMessage = async (req, res) => {
    try {
        const { ticketId, messageId } = req.params;
        const userId = req.user._id;

        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        // Find the message
        const messageIndex = ticket.messages.findIndex(msg => msg._id.toString() === messageId);
        if (messageIndex === -1) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }

        const message = ticket.messages[messageIndex];

        // Check if user owns the message or is admin
        if (message.author.toString() !== userId.toString() && !req.user.isAdmin) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this message' });
        }

        // Remove the message
        ticket.messages.splice(messageIndex, 1);
        ticket.updatedAt = new Date();
        await ticket.save();

        res.status(200).json({ success: true, message: 'Message deleted successfully' });
    } catch (error) {
        console.error("Error deleting user message:", error);
        res.status(500).json({ success: false, message: 'Server error deleting message.' });
    }
};

export {
    createTicket,
    getUserTickets,
    updateTicket,
    closeTicket,
    reopenTicket,
    getTicketById,
    getRecentTickets,
    deleteTicket,
    getTicketSummary,
    updateTicketPriority,
    addUserReply,
    deleteUserMessage
};
