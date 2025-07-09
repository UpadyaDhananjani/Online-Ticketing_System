import mongoose from 'mongoose';
import Ticket from '../models/ticketModel.js';
import userModel from '../models/userModel.js';
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
    if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
      cb(null, true);
    } else {
      cb(new Error('Only jpg, jpeg, png files are allowed'));
    }
  }
});

// Create a new ticket
export const createTicket = async (req, res) => {
  try {
    const { subject, description, type, assignedUnit } = req.body;

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

    // Handle multiple attachments
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
      attachments // Store as array
    });

    await ticket.save();
    const populatedTicket = await Ticket.findById(ticket._id).populate('user', 'name');

    console.log("--- createTicket function finished ---");
    return res.status(201).json(populatedTicket);
  } catch (err) {
    console.error("Error creating ticket:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Get all tickets
export const getUserTickets = async (req, res) => {
  try {
    // Only fetch tickets for the logged-in user
    const tickets = await Ticket.find({ user: req.user._id }).populate('user', 'name').sort({ createdAt: -1 });
    return res.json(tickets);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Update/Edit a ticket
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

    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    return res.json(ticket);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Close a ticket
export const closeTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findOneAndUpdate(
      { _id: id, status: 'open' },
      { status: 'closed', updatedAt: Date.now() },
      { new: true }
    ).populate('user', 'name');

    if (!ticket) return res.status(404).json({ error: 'Ticket not found or already closed' });
    return res.json(ticket);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Reopen a ticket
export const reopenTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findOneAndUpdate(
      { _id: id, status: 'closed' },
      { status: 'reopened', updatedAt: Date.now() },
      { new: true }
    ).populate('user', 'name');

    if (!ticket) return res.status(404).json({ error: 'Ticket not found or not closed' });
    return res.json(ticket);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Get ticket by ID
export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('user', 'name');
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    return res.json(ticket);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Get summary
export const getTicketSummary = async (req, res) => {
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
    return res.status(500).json({ error: 'Failed to fetch ticket summary from server.' });
  }
};

// Add reply to ticket
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

    ticket.messages = ticket.messages || [];
    ticket.messages.push({
      authorRole: 'user',
      content,
      attachments,
      date: new Date()
    });

    ticket.updatedAt = Date.now();
    await ticket.save();

    res.json(ticket);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
