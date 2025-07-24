// server/controllers/ticketAdminController.js
import Ticket from '../models/ticketModel.js';
import User from '../models/userModel.js'; // Ensure User model is imported
import path from 'path';
import fs from 'fs';
import PDFDocument from 'pdfkit';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

// Get all tickets (admin)
export const getAllTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({})
            .populate('user', 'name email')
            .populate('assignedTo', 'name email')
            .populate('previousAssignedTo', 'name email')
            .sort({ createdAt: -1 });

        res.json(tickets);
    } catch (err) {
        console.error("Get All Tickets Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// Get a single ticket by ID for admin
export const getAdminTicketById = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('user', 'name email')
            .populate('assignedTo', 'name email')
            .populate('previousAssignedTo', 'name email');

        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        return res.json(ticket);
    } catch (err) {
        console.error("Get Admin Ticket By ID Error:", err);
        return res.status(500).json({ error: err.message });
    }
};

// --- MODIFIED: Get users by unit (now expecting unitName as a string) ---
export const getUsersByUnit = async (req, res) => {
    try {
        const { unitName } = req.params; // Changed from unitId to unitName
        // Now query by the string name of the unit
        const users = await User.find({ unit: unitName }).select('name email');
        res.json(users);
    } catch (error) {
        console.error("Get Users By Unit Error:", error);
        res.status(500).json({ message: 'Error fetching users by unit', error: error.message });
    }
};

// --- NEW FUNCTION: Reassign a ticket ---
export const reassignTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        const ticket = await Ticket.findById(id);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found.' });
        }

        if (userId) {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }
            ticket.previousAssignedUnit = ticket.assignedUnit;
            ticket.previousAssignedTo = ticket.assignedTo;
            ticket.assignedTo = userId;
            ticket.assignedUnit = user.unit;
            ticket.reassigned = true;
        } else {
            ticket.previousAssignedUnit = ticket.assignedUnit;
            ticket.previousAssignedTo = ticket.assignedTo;
            ticket.assignedTo = null;
            ticket.reassigned = false;
        }
        ticket.updatedAt = Date.now();
        await ticket.save();

        const updatedTicket = await Ticket.findById(id)
            .populate('user', 'name email')
            .populate('assignedTo', 'name email')
            .populate('previousAssignedTo', 'name email');

        res.json({ success: true, message: 'Ticket reassigned successfully.', ticket: updatedTicket });
    } catch (error) {
        res.status(500).json({ message: 'Failed to reassign ticket due to server error.', error: error.message });
    }
};

// Add a reply to a ticket (admin)
export const addAdminReply = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        let attachments = [];

        if (!req.user || !req.user._id) {
            return res.status(401).json({ error: "Admin not authenticated to add reply." });
        }

        if (req.files && req.files.length > 0) {
            attachments = req.files.map(f => `/uploads/${f.filename}`);
        }

        const ticket = await Ticket.findById(id);
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

        if (!Array.isArray(ticket.messages)) ticket.messages = [];

        ticket.messages.push({
            author: req.user._id,
            authorRole: 'admin',
            content,
            attachments
        });

        if (ticket.status !== "resolved") {
            ticket.status = "in progress";
        }

        ticket.updatedAt = Date.now();
        await ticket.save();

        res.json({ success: true, ticket });
    } catch (err) {
        console.error("Add Admin Reply Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// Delete a message from a ticket
export const deleteMessage = async (req, res) => {
    try {
        const { ticketId, messageId } = req.params;
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            console.error(`Admin: Ticket not found for ID: ${ticketId}`);
            return res.status(404).json({ success: false, message: 'Ticket not found.' });
        }

        // Find the index of the message to be deleted
        const messageIndex = ticket.messages.findIndex(
          msg => msg._id.toString() === messageId && msg.author && msg.author.toString() === req.user._id.toString()
        );

        if (messageIndex === -1) {
          return res.status(403).json({ success: false, message: 'You can only delete your own messages.' });
        }

        ticket.messages.splice(messageIndex, 1);
        ticket.updatedAt = Date.now();
        await ticket.save();
        console.log(`Admin: Message ${messageId} deleted from ticket ${ticketId}`);
        return res.status(200).json({ success: true, message: 'Message deleted successfully.' });
    } catch (error) {
        console.error("Admin: Error deleting message:", error);
        return res.status(500).json({ success: false, message: 'Failed to delete message due to server error.' });
    }
};

// Delete a ticket (Admin only)
export const deleteTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const ticket = await Ticket.findByIdAndDelete(id);
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found.' });
        }
        return res.status(200).json({ success: true, message: 'Ticket deleted successfully.' });
    } catch (error) {
        console.error('Admin: Error deleting ticket:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete ticket due to server error.' });
    }
};

// Mark ticket as resolved
export const resolveTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            { status: 'resolved', updatedAt: Date.now() },
            { new: true }
        );
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
        res.json(ticket);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Mark ticket as open
export const markTicketOpen = async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            { status: 'open', updatedAt: Date.now() },
            { new: true }
        );
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
        res.json(ticket);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Mark ticket as in progress
export const markTicketInProgress = async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            { status: 'in progress', updatedAt: Date.now() },
            { new: true }
        );
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
        res.json(ticket);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Generate a chart image (PNG) for ticket status summary

// Get admin ticket summary
export const getAdminTicketsSummary = async (req, res) => {
  try {
    console.log("Getting admin ticket summary for user:", req.user);
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