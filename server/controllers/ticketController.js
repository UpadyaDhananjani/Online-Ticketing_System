// server/controllers/ticketController.js
import mongoose from 'mongoose';
import Ticket from '../models/ticketModel.js';
import Notification from '../models/notificationModel.js';
import User from '../models/userModel.js';

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

// @desc    Create a new ticket
// @route   POST /api/tickets
// @access  Private
const createTicket = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a ticket
// @route   PUT /api/tickets/:id
// @access  Private
const updateTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
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

        // Notify old assignee if reassigned
        if (assignedTo && originalAssignedTo && originalAssignedTo !== assignedTo) {
            await createNotification(
                originalAssignedTo,
                `Ticket '${updatedTicket.subject}' has been reassigned to another user.`,
                'reassigned',
                updatedTicket._id
            );
        }

        // Notify user if closed/resolved
        if (status === 'resolved' || status === 'closed') {
            await createNotification(
                updatedTicket.user,
                `Ticket '${updatedTicket.subject}' has been ${status}.`,
                'admin_reply',
                updatedTicket._id
            );
        }

        res.status(200).json(updatedTicket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get tickets (user sees own, admin sees all)
// @route   GET /api/tickets
// @access  Private
const getUserTickets = async (req, res) => {
    try {
        const { user } = req;
        const query = user.isAdmin ? {} : { $or: [{ user: user._id }, { assignedTo: user._id }] };

        const tickets = await Ticket.find(query)
            .populate('user', 'name email')
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json(tickets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a ticket's priority
// @route   PATCH /api/tickets/:id/priority
// @access  Private (Admin)
const updateTicketPriority = async (req, res) => {
    try {
        const { priority } = req.body;
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        ticket.priority = priority;
        await ticket.save();

        res.status(200).json({ message: `Priority updated to ${priority}`, ticket });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a single ticket by ID
// @route   GET /api/tickets/:id
// @access  Private
const getTicketById = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('user', 'name email')
            .populate('assignedTo', 'name email')
            .populate('messages.author', 'name email');

        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        res.status(200).json(ticket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get recent tickets
// @route   GET /api/tickets/recent
// @access  Private
const getRecentTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({})
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('user', 'name email')
            .populate('assignedTo', 'name email');

        res.status(200).json(tickets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a ticket
// @route   DELETE /api/tickets/:id
// @access  Private
const deleteTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        await ticket.remove();
        res.status(200).json({ message: 'Ticket removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Close a ticket
// @route   PATCH /api/tickets/:id/close
// @access  Private (Admin)
const closeTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        if (ticket.status === 'closed') {
            return res.status(400).json({ message: 'Ticket is already closed' });
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
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reopen a ticket
// @route   PATCH /api/tickets/:id/reopen
// @access  Private (Admin)
const reopenTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        if (ticket.status !== 'closed') {
            return res.status(400).json({ message: 'Ticket is not closed' });
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
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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
    updateTicketPriority
};
