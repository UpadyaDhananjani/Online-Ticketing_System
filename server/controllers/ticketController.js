// server/controllers/ticketController.js
import mongoose from 'mongoose'; // Ensure mongoose is imported for Schema types if not already
import Ticket from '../models/ticketModel.js';
import multer from 'multer';
import path from 'path';

// Multer setup (No changes)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // make sure this folder exists
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

// Create a new ticket (No changes)
export const createTicket = async (req, res) => {
  try {
    const { subject, description, type } = req.body;
   
    const ticket = new Ticket({
      user: "000000000000000000000000", // Dummy ObjectId
      subject,
      description,
      type,
      image: req.file ? req.file.filename : undefined
    });
    await ticket.save();
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all tickets for logged-in user (No changes)
export const getUserTickets = async (req, res) => {
  try {
    // For testing: return all tickets, not just the user's
  
    // For testing: return all tickets, not just the user's
    const tickets = await Ticket.find();
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update/Edit a ticket (No changes)
export const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, description } = req.body;
    const ticket = await Ticket.findOneAndUpdate(
      { _id: id, status: 'open' }, // Remove user: req.user._id
      { _id: id, status: 'open' }, // Remove user: req.user._id
      { subject, description, updatedAt: Date.now() },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ error: 'Ticket not found or already closed' });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Close a ticket (No changes)
export const closeTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findOneAndUpdate(
      { _id: id, status: 'open' }, // Remove user: req.user._id
      { _id: id, status: 'open' }, // Remove user: req.user._id
      { status: 'closed', updatedAt: Date.now() },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ error: 'Ticket not found or already closed' });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Reopen a closed ticket (No changes)
export const reopenTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findOneAndUpdate(
      { _id: id, status: 'closed' },
      { status: 'reopened', updatedAt: Date.now() },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ error: 'Ticket not found or not closed' });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- MODIFIED FUNCTION: Get Ticket Summary Counts ---
export const getTicketSummary = async (req, res) => {
  try {
    const openCount = await Ticket.countDocuments({ status: 'open' }); // Only 'open'
    const inProgressCount = await Ticket.countDocuments({ status: 'in progress' }); // Only 'in progress'
    const resolvedCount = await Ticket.countDocuments({ status: 'resolved' }); // Only 'resolved'

    res.json({
      open: openCount,
      inProgress: inProgressCount,
      resolved: resolvedCount,
    });
  } catch (err) {
    console.error('Error fetching ticket summary:', err);
    res.status(500).json({ error: 'Failed to fetch ticket summary from server.' });
  }
};