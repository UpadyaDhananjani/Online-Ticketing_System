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

// @desc    Get a summary of tickets by status
// @route   GET /api/tickets/summary
// @access  Public
const getTicketSummary = asyncHandler(async (req, res) => {
    const summary = await Ticket.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
            },
        },
    ]);
    res.status(200).json(summary);
});

// @desc    Add a reply to a ticket
// @route   POST /api/tickets/:id/replies
// @access  Private
const addUserReply = asyncHandler(async (req, res) => {
    const { text } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
        res.status(404);
        throw new Error('Ticket not found');
    }

    const newReply = {
        text,
        user: req.user.id,
    };

    ticket.replies.push(newReply);
    await ticket.save();

    res.status(201).json(ticket.replies);
});

// @desc    Delete a message from a ticket
// @route   DELETE /api/tickets/:ticketId/messages/:messageId
// @access  Private
const deleteUserMessage = asyncHandler(async (req, res) => {
    const { ticketId, messageId } = req.params;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
        res.status(404);
        throw new Error('Ticket not found');
    }

    const messageIndex = ticket.messages.findIndex(
        (msg) => msg._id.toString() === messageId
    );

    if (messageIndex === -1) {
        res.status(404);
        throw new Error('Message not found');
    }

    // Optional: Check if the logged-in user is the one who created the message
    if (ticket.messages[messageIndex].author.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to delete this message');
    }

    ticket.messages.splice(messageIndex, 1);
    await ticket.save();

    res.status(200).json({ message: 'Message deleted successfully' });
});

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
    deleteUserMessage // <-- The missing export has been added here
};
