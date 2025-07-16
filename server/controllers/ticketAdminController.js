import Ticket from '../models/ticketModel.js';
import User from '../models/userModel.js'; // Ensure User model is imported for populate
import path from 'path';
import fs from 'fs';

// Get all tickets (admin)
export const getAllTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({})
            .populate('user', 'name email') // Populate the 'user' field (requester)
            .populate('assignedTo', 'name email') // <--- ADDED THIS LINE to populate assignedTo
            .sort({ createdAt: -1 }); // Sort by creation date descending

        res.json(tickets);
    } catch (err) {
        console.error("Get All Tickets Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// Add a reply to a ticket (admin)
export const addAdminReply = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        let attachments = [];

        // Ensure req.user is available from authMiddleware
        if (!req.user || !req.user._id) {
            return res.status(401).json({ error: "Admin not authenticated to add reply." });
        }

        // Handle file uploads (if using multer)
        if (req.files && req.files.length > 0) {
            attachments = req.files.map(f => `/uploads/${f.filename}`);
        }

        const ticket = await Ticket.findById(id);
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

        // Ensure messages is always an array
        if (!Array.isArray(ticket.messages)) ticket.messages = [];

        ticket.messages.push({
            author: req.user._id, // --- FIXED: Use req.user._id for author ---
            authorRole: 'admin',
            content,
            attachments
        });

        // If not resolved, set status to in progress
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

// --- NEW/MOVED FUNCTION: Delete a message from a ticket ---
export const deleteMessage = async (req, res) => {
    try {
        const { ticketId, messageId } = req.params;

        // Optional: Add admin authorization check here if not handled by middleware
        // if (!req.user || req.user.role !== 'admin') { /* ... */ }

        // Find the ticket by ID
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

        // Update the ticket's updatedAt timestamp
        ticket.updatedAt = Date.now();

        // Save the updated ticket
        await ticket.save();

        console.log(`Admin: Message ${messageId} deleted from ticket ${ticketId}`);
        return res.status(200).json({ success: true, message: 'Message deleted successfully.' });

    } catch (error) {
        console.error("Admin: Error deleting message:", error);
        return res.status(500).json({ success: false, message: 'Failed to delete message due to server error.' });
    }
};

// --- NEW FUNCTION: Delete a ticket (Admin only) ---
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

// --- Existing functions (copy-pasted for completeness, ensure they are here) ---

// Mark ticket as resolved
export const resolveTicket = async (req, res) => { // Renamed from anonymous to named export
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
export const markTicketOpen = async (req, res) => { // Renamed from anonymous to named export
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
export const markTicketInProgress = async (req, res) => { // Renamed from anonymous to named export
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