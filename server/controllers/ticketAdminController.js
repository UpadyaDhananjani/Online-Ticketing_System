import Ticket from '../models/ticketModel.js';
import path from 'path';
import fs from 'fs';

// Get all tickets (admin)
export const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({})
      // .populate('user', 'email')
      // .populate('messages.author', 'email role');
    // Optionally format output for admin UI
    res.json(
      tickets.map(t => ({
        ...t.toObject(),
        userEmail: t.user.email
      }))
    );
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

    // Handle file uploads (if using multer)
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(f => `/uploads/${f.filename}`);
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    // Ensure messages is always an array
    if (!Array.isArray(ticket.messages)) ticket.messages = [];

    ticket.messages.push({
      author:  null,         //req.user._id,
      authorRole: 'admin',
      content,
      attachments
    });
    ticket.updatedAt = Date.now();
    await ticket.save();

    res.json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

