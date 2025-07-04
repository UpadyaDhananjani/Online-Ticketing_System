import mongoose from 'mongoose';
import Ticket from '../models/ticketModel.js';
import userModel from '../models/userModel.js'; // Ensure this is imported and correctly resolves to your User model
import multer from 'multer';
import path from 'path';

// Multer setup (No changes needed here)
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

// Create a new ticket
export const createTicket = async (req, res) => {
  try {
    const { subject, description, type, assignedUnit } = req.body;

    // --- DEBUG LOGS START ---
    console.log("--- createTicket function started ---");
    console.log("req.user in createTicket:", req.user); // Check if req.user is populated
    if (req.user) {
      console.log("req.user._id:", req.user._id); // Check the ID
    } else {
      console.log("req.user is NOT defined. Authentication failed before controller.");
    }
    console.log("Request Body:", req.body);
    console.log("Uploaded File:", req.file);
    // --- DEBUG LOGS END ---

    // Ensure req.user._id is available from authMiddleware
    if (!req.user || !req.user._id) {
      console.error("Authentication check failed in createTicket: req.user or req.user._id is missing.");
      return res.status(401).json({ error: "User not authenticated to create ticket." });
    }

    if (!assignedUnit) {
      return res.status(400).json({ error: "assignedUnit is required" });
    }

    const ticket = new Ticket({
      user: req.user._id, // CRUCIAL: This line must correctly save the logged-in user's ID
      subject,
      description,
      type,
      assignedUnit,
      image: req.file ? req.file.filename : undefined
    });

    // --- DEBUG LOGS START ---
    console.log("Ticket object before saving:", ticket);
    // --- DEBUG LOGS END ---

    await ticket.save();

    // --- DEBUG LOGS START ---
    console.log("Ticket saved to DB:", ticket);
    // --- DEBUG LOGS END ---

    // Populate the user name for the response immediately
    const populatedTicket = await Ticket.findById(ticket._id).populate('user', 'name');

    // --- DEBUG LOGS START ---
    console.log("Populated Ticket (after creation):", populatedTicket);
    if (populatedTicket && populatedTicket.user) {
      console.log("Populated User Name:", populatedTicket.user.name);
    } else {
      console.log("User not populated on newly created ticket.");
    }
    console.log("--- createTicket function finished ---");
    // --- DEBUG LOGS END ---

    return res.status(201).json(populatedTicket); // Return the ticket with populated user data
  } catch (err) {
    console.error("Error creating ticket:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Get all tickets for logged-in user (or all if not filtered)
export const getUserTickets = async (req, res) => {
  try {
    let query = {};
    // If you want to filter by logged-in user, uncomment this:
    // if (req.user && req.user._id) {
    //   query.user = req.user._id;
    // }

    // CRUCIAL: Use .populate('user', 'name') to get the requester's name
    const tickets = await Ticket.find(query).populate('user', 'name').sort({ createdAt: -1 }); // Sort by creation date descending
    
    // --- DEBUG LOGS START ---
    console.log("--- getUserTickets function started ---");
    console.log("Fetched Tickets (first 2 for brevity):", tickets.slice(0, 2));
    if (tickets.length > 0 && tickets[0].user) {
      console.log("Example Ticket User Name:", tickets[0].user.name);
    } else {
      console.log("No tickets found or user not populated in getUserTickets.");
    }
    console.log("--- getUserTickets function finished ---");
    // --- DEBUG LOGS END ---

    return res.json(tickets);
  } catch (err) {
    console.error("Error fetching user tickets:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Update/Edit a ticket (No changes, just for completeness)
export const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, description, assignedUnit, status } = req.body;

    const updateFields = { subject, description, updatedAt: Date.now() };
    if (assignedUnit) updateFields.assignedUnit = assignedUnit;
    if (status) updateFields.status = status;

    const ticket = await Ticket.findOneAndUpdate(
      { _id: id /* , user: req.user._id */ },
      updateFields,
      { new: true }
    ).populate('user', 'name');
    
    if (!ticket) return res.status(404).json({ error: 'Ticket not found or status not open for update' });
    return res.json(ticket);
  } catch (err) {
    console.error("Error updating ticket:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Close a ticket (No changes, just for completeness)
export const closeTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findOneAndUpdate(
      { _id: id, status: 'open' /* , user: req.user._id */ },
      { status: 'closed', updatedAt: Date.now() },
      { new: true }
    ).populate('user', 'name');

    if (!ticket) return res.status(404).json({ error: 'Ticket not found or already closed' });
    return res.json(ticket);
  } catch (err) {
    console.error("Error closing ticket:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Reopen a closed ticket (No changes, just for completeness)
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
    console.error("Error reopening ticket:", err);
    return res.status(500).json({ error: err.message });
  }
};

export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('user', 'name');
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    return res.json(ticket);
  } catch (err) {
    console.error("Error getting ticket by ID:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Get Ticket Summary Counts (No changes, just for completeness)
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
    console.error('Error fetching ticket summary:', err);
    return res.status(500).json({ error: 'Failed to fetch ticket summary from server.' });
  }
};
