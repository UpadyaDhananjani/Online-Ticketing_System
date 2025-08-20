import Ticket from '../models/ticketModel.js';
import User from '../models/userModel.js'; // Correct import name
import multer from 'multer';
import path from 'path';

// Multer setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Ensure this folder exists
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

export const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (['.jpg', '.jpeg', '.png'].includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only jpg, jpeg, png files are allowed'));
        }
    }
});

// Helper to normalize status for consistent filtering/display
const normalizeStatus = (status) => {
    if (!status) return null;
    return status.toLowerCase().trim();
};

// @desc    Get users by unit for admin (for reassignment)
// @route   GET /api/admin/tickets/users/:unit
// @access  Admin
export const getAdminUsersByUnit = async (req, res) => {
    try {
        const { unit } = req.params;
        console.log("Admin fetching users for unit:", unit);
        
        // Decode the unit name in case it's URL encoded
        const decodedUnit = decodeURIComponent(unit);
        
        const users = await User.find({ unit: decodedUnit }).select('_id name email unit');
        console.log("Found users for admin:", users);
        
        res.json({ success: true, users });
    } catch (error) {
        console.error("Error fetching users by unit for admin:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all tickets for admin dashboard
// @route   GET /api/admin/tickets
// @access  Admin
export const getAllTickets = async (req, res) => {
    try {
        // Admins can see all tickets, regardless of assignment
        const tickets = await Ticket.find({})
            .populate('user', 'name email') // Populate original user
            .populate('assignedTo', 'name email') // Populate assigned admin/user
            .sort({ createdAt: -1 }); // Sort by most recent
        res.status(200).json(tickets);
    } catch (error) {
        console.error("Error fetching all tickets for admin:", error);
        res.status(500).json({ message: 'Server error fetching tickets.' });
    }
};

// @desc    Get a single ticket by ID for admin
// @route   GET /api/admin/tickets/:id
// @access  Admin
export const getAdminTicketById = async (req, res) => {
    console.log("Get Admin Ticket By ID Request:", req.params.id);
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('user', 'name email')
            .populate('assignedTo', 'name email')
            .populate({
                path: 'messages.author', // Populate the author of each message
                select: 'name email role' // Select relevant fields
            });

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found.' });
        }
        res.status(200).json(ticket);
    } catch (error) {
        console.error("Error fetching admin ticket by ID:", error);
        // Check for invalid MongoDB ID format
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid ticket ID format.' });
        }
        res.status(500).json({ message: 'Server error fetching ticket details.' });
    }
};

// @desc    Add a reply to a ticket (admin)
// @route   POST /api/admin/tickets/:id/reply
// @access  Admin
export const addAdminReply = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const attachments = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

        const ticket = await Ticket.findById(id);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found.' });
        }

        // Ensure messages array exists
        if (!ticket.messages) {
            ticket.messages = [];
        }

        ticket.messages.push({
            author: req.user._id, // Admin's ID
            authorRole: 'admin',
            content,
            attachments,
            date: new Date()
        });

        // Update ticket status when admin replies:
        // - If ticket is 'open', change to 'in progress' (admin started working on it)
        // - If ticket was 'resolved' or 'closed', change to 'in progress' (admin reopened work)
        const previousStatus = ticket.status;
        if (ticket.status === 'open' || ticket.status === 'resolved' || ticket.status === 'closed') {
            ticket.status = 'in progress';
            console.log(`Ticket ${id} status changed from '${previousStatus}' to 'in progress' due to admin reply`);
        }
        ticket.updatedAt = new Date();

        await ticket.save();

        // Re-populate the ticket to send back comprehensive data
        const updatedTicket = await Ticket.findById(ticket._id)
            .populate('user', 'name email')
            .populate('assignedTo', 'name email')
            .populate({
                path: 'messages.author',
                select: 'name email role'
            });

        res.status(200).json(updatedTicket);
    } catch (error) {
        console.error("Error adding admin reply:", error);
        res.status(500).json({ message: 'Server error adding reply.' });
    }
};

// @desc    Delete a message from a ticket (admin)
// @route   DELETE /api/admin/tickets/:ticketId/messages/:messageId
// @access  Admin
export const deleteMessage = async (req, res) => {
    try {
        const { ticketId, messageId } = req.params;
        console.log(`Delete message request received - TicketId: ${ticketId}, MessageId: ${messageId}`);

        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            console.log(`Ticket not found: ${ticketId}`);
            return res.status(404).json({ success: false, message: 'Ticket not found.' });
        }

        const messageIndex = ticket.messages.findIndex(m => m._id.toString() === messageId);
        if (messageIndex === -1) {
            console.log(`Message not found: ${messageId} in ticket: ${ticketId}`);
            return res.status(404).json({ success: false, message: 'Message not found.' });
        }

        // Optional: Add logic to check if admin is allowed to delete this specific message
        // e.g., if (ticket.messages[messageIndex].author.toString() !== req.user._id.toString() && req.user.role !== 'superadmin') {
        //     return res.status(403).json({ message: 'Not authorized to delete this message.' });
        // }

        ticket.messages.splice(messageIndex, 1);
        ticket.updatedAt = new Date();
        await ticket.save();

        console.log(`Message ${messageId} deleted successfully from ticket ${ticketId}`);
        res.status(200).json({ success: true, message: 'Message deleted successfully.' });
    } catch (error) {
        console.error("Error deleting message:", error);
        res.status(500).json({ message: 'Server error deleting message.' });
    }
};

// @desc    Resolve a ticket
// @route   PATCH /api/admin/tickets/:id/resolve
// @access  Admin
export const resolveTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const ticket = await Ticket.findByIdAndUpdate(
            id,
            { status: 'resolved', updatedAt: new Date() },
            { new: true }
        ).populate('user', 'name email').populate('assignedTo', 'name email');

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found.' });
        }
        res.status(200).json(ticket);
    } catch (error) {
        console.error("Error resolving ticket:", error);
        res.status(500).json({ message: 'Server error resolving ticket.' });
    }
};

// @desc    Mark ticket as open
// @route   PATCH /api/admin/tickets/:id/open
// @access  Admin
export const markTicketOpen = async (req, res) => {
    try {
        const { id } = req.params;
        const ticket = await Ticket.findByIdAndUpdate(
            id,
            { status: 'open', updatedAt: new Date() },
            { new: true }
        ).populate('user', 'name email').populate('assignedTo', 'name email');

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found.' });
        }
        res.status(200).json(ticket);
    } catch (error) {
        console.error("Error marking ticket open:", error);
        res.status(500).json({ message: 'Server error marking ticket open.' });
    }
};

// @desc    Mark ticket as in progress
// @route   PATCH /api/admin/tickets/:id/in-progress
// @access  Admin
export const markTicketInProgress = async (req, res) => {
    try {
        const { id } = req.params;
        const ticket = await Ticket.findByIdAndUpdate(
            id,
            { status: 'in progress', updatedAt: new Date() },
            { new: true }
        ).populate('user', 'name email').populate('assignedTo', 'name email');

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found.' });
        }
        res.status(200).json(ticket);
    } catch (error) {
        console.error("Error marking ticket in progress:", error);
        res.status(500).json({ message: 'Server error marking ticket in progress.' });
    }
};

// @desc    Delete a ticket (admin)
// @route   DELETE /api/admin/tickets/:id
// @access  Admin
export const deleteTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const ticket = await Ticket.findByIdAndDelete(id);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found.' });
        }
        res.status(200).json({ message: 'Ticket deleted successfully.' });
    } catch (error) {
        console.error("Error deleting ticket:", error);
        res.status(500).json({ message: 'Server error deleting ticket.' });
    }
};

// @desc    Reassign a ticket to another user/admin
// @route   PATCH /api/admin/tickets/:id/assign
// @access  Admin
export const reassignTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body; // The ID of the user/admin to reassign to

        if (!userId) {
            return res.status(400).json({ message: 'User ID for reassignment is required.' });
        }

        const newAssignee = await User.findById(userId);
        if (!newAssignee) {
            return res.status(404).json({ message: 'New assignee user not found.' });
        }

        // Get the current ticket to save previous assignment data
        const currentTicket = await Ticket.findById(id);
        if (!currentTicket) {
            return res.status(404).json({ message: 'Ticket not found.' });
        }

        const ticket = await Ticket.findByIdAndUpdate(
            id,
            {
                // Store previous assignment for tracking
                previousAssignedTo: currentTicket.assignedTo,
                previousAssignedUnit: currentTicket.assignedUnit,
                // Set new assignment
                assignedTo: newAssignee._id,
                assignedUnit: newAssignee.unit,
                // Mark as reassigned and update timestamp
                reassigned: true,
                updatedAt: new Date()
            },
            { new: true }
        ).populate('user', 'name email')
         .populate('assignedTo', 'name email')
         .populate('previousAssignedTo', 'name email');

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found.' });
        }

        console.log(`Ticket ${id} reassigned from ${currentTicket.assignedUnit || 'unassigned'} to ${newAssignee.unit}`);
        console.log(`Previous assignee: ${currentTicket.assignedTo || 'none'}, New assignee: ${newAssignee._id}`);

        res.status(200).json(ticket);
    } catch (error) {
        console.error("Error reassigning ticket:", error);
        res.status(500).json({ message: 'Server error reassigning ticket.' });
    }
};

// @desc    Get summary counts for admin dashboard (open, in progress, resolved)
// @route   GET /api/admin/tickets/summary
// @access  Admin
export const getAdminTicketsSummary = async (req, res) => {
    try {
        const openCount = await Ticket.countDocuments({ status: 'open' });
        const inProgressCount = await Ticket.countDocuments({ status: 'in progress' });
        const resolvedCount = await Ticket.countDocuments({ status: 'resolved' });

        return res.json({
            open: openCount,
            inProgress: inProgressCount,
            resolved: resolvedCount,
        });
    } catch (err) {
        console.error("Error fetching admin ticket summary:", err);
        return res.status(500).json({ error: 'Failed to fetch ticket summary from server.' });
    }
};

export const getRecentTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find()
            .populate('user', 'name email')
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 })
            .limit(10);

        console.log("Recent tickets fetched:", tickets.length);
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
