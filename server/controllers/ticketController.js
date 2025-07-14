import mongoose from 'mongoose';
import Ticket from '../models/ticketModel.js';
import userModel from '../models/userModel.js';
import multer from 'multer';
import path from 'path';

// ---------------------
// Multer Setup
// ---------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
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

// ---------------------
// Create Ticket
// ---------------------
export const createTicket = async (req, res) => {
  try {
    const { subject, description, type, assignedUnit, assignedTo } = req.body;

    console.log("--- createTicket function started ---");
    console.log("req.user:", req.user);
    console.log("Request Body:", req.body);
    console.log("Uploaded File:", req.file);

    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "User not authenticated to create ticket." });
    }

    if (!assignedUnit) {
      return res.status(400).json({ error: "assignedUnit is required" });
    }

    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(f => `/uploads/${f.filename}`);
    }

    const ticket = new Ticket({
      user: req.user._id,
      subject,
      description,
      type,
      assignedUnit,
      attachments, // Store as array
      assignedTo: assignedTo || undefined // Save assignedTo if provided
    });

    await ticket.save();

    const populatedTicket = await Ticket.findById(ticket._id).populate('user', 'name');
    return res.status(201).json(populatedTicket);
  } catch (err) {
    console.error("Error creating ticket:", err);
    return res.status(500).json({ error: err.message });
  }
};

// ---------------------
// Get Tickets (User's own)
// ---------------------
export const getUserTickets = async (req, res) => {
  try {
    const userId = req.user._id;
    const tickets = await Ticket.find({
      $or: [
        { user: userId },
        { assignedTo: userId }
      ]
    })
      .populate('user', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------------
// Update Ticket
// ---------------------
export const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, description, assignedUnit, status } = req.body;

    const updateFields = {
      subject,
      description,
      updatedAt: Date.now()
    };

    if (assignedUnit) updateFields.assignedUnit = assignedUnit;
    if (status) updateFields.status = status;

    const ticket = await Ticket.findOneAndUpdate(
      { _id: id },
      updateFields,
      { new: true }
    ).populate('user', 'name');

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found or not editable' });
    }

    return res.json(ticket);
  } catch (err) {
    console.error("Error updating ticket:", err);
    return res.status(500).json({ error: err.message });
  }
};

// ---------------------
// Close Ticket
// ---------------------
export const closeTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findOneAndUpdate(
      { _id: id, status: 'open' },
      { status: 'closed', updatedAt: Date.now() },
      { new: true }
    ).populate('user', 'name');

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found or already closed' });
    }

    return res.json(ticket);
  } catch (err) {
    console.error("Error closing ticket:", err);
    return res.status(500).json({ error: err.message });
  }
};

// ---------------------
// Reopen Ticket
// ---------------------
export const reopenTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findOneAndUpdate(
      { _id: id, status: 'closed' },
      { status: 'reopened', updatedAt: Date.now() },
      { new: true }
    ).populate('user', 'name');

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found or not closed' });
    }

    return res.json(ticket);
  } catch (err) {
    console.error("Error reopening ticket:", err);
    return res.status(500).json({ error: err.message });
  }
};

// ---------------------
// Get Ticket by ID
// ---------------------
export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('user', 'name')
      .populate('assignedTo', 'name email'); // <-- populate assignedTo
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    return res.json(ticket);
  } catch (err) {
    console.error("Error getting ticket by ID:", err);
    return res.status(500).json({ error: err.message });
  }
};

// ---------------------
// Ticket Summary
// ---------------------
export const getTicketSummary = async (req, res) => {
  try {
    const open = await Ticket.countDocuments({ status: 'open' });
    const inProgress = await Ticket.countDocuments({ status: 'in progress' });
    const resolved = await Ticket.countDocuments({ status: 'resolved' });

    return res.json({ open, inProgress, resolved });
  } catch (err) {
    console.error('Error fetching ticket summary:', err);
    return res.status(500).json({ error: 'Failed to fetch ticket summary.' });
  }
};

// ---------------------
// Add Reply to Ticket (User)
// ---------------------
export const addUserReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(f => `/uploads/${f.filename}`);
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "User not authenticated." });
    }

    ticket.messages.push({
      author: req.user._id,
      authorRole: 'user',
      content,
      attachments,
      date: new Date()
    });

    ticket.updatedAt = Date.now();
    await ticket.save();

    return res.json(ticket);
  } catch (err) {
    console.error("Error adding user reply:", err);
    return res.status(500).json({ error: err.message });
  }
};

// ---------------------
// Delete User Message
// ---------------------
export const deleteUserMessage = async (req, res) => {
  try {
    const { ticketId, messageId } = req.params;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    const messageIndex = ticket.messages.findIndex(m => m._id.toString() === messageId);
    if (messageIndex === -1) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }

    const messageToDelete = ticket.messages[messageIndex];

    if (!messageToDelete.author || messageToDelete.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this message.' });
    }

    ticket.messages.splice(messageIndex, 1);
    ticket.updatedAt = Date.now();
    await ticket.save();

    return res.status(200).json({ success: true, message: 'Message deleted successfully.' });
  } catch (error) {
    console.error("Delete Message Error:", error);
    return res.status(500).json({ success: false, message: 'Failed to delete message due to server error.' });
  }
};
