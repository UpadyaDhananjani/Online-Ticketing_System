import mongoose from 'mongoose';
import Ticket from '../models/ticketModel.js';
import userModel from '../models/userModel.js'; // Ensure userModel is imported if needed for populate or other logic
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

    // Ensure req.user._id is available from authMiddleware
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "User not authenticated to create ticket." });
    }

    if (!assignedUnit) {
      return res.status(400).json({ error: "assignedUnit is required" });
    }

    const ticket = new Ticket({
      user: req.user._id, // <-- CRUCIAL FIX: Use the ID of the authenticated user
      subject,
      description,
      type,
      assignedUnit,
      image: req.file ? req.file.filename : undefined
    });
    await ticket.save();
    // Populate the user name for the response immediately
    const populatedTicket = await Ticket.findById(ticket._id).populate('user', 'name');
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
    // If you want users to only see their own tickets, uncomment this:
    // if (req.user && req.user._id) {
    //   query.user = req.user._id;
    // }

    // Use .populate('user', 'name') to get the requester's name
    const tickets = await Ticket.find(query).populate('user', 'name').sort({ createdAt: -1 }); // Sort by creation date descending
    return res.json(tickets);
  } catch (err) {
    console.error("Error fetching user tickets:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Update/Edit a ticket
export const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, description, assignedUnit, status } = req.body;

    const updateFields = { subject, description, updatedAt: Date.now() };
    if (assignedUnit) updateFields.assignedUnit = assignedUnit;
    if (status) updateFields.status = status;

    const ticket = await Ticket.findOneAndUpdate(
      { _id: id /* , user: req.user._id */ }, // Add user: req.user._id back if this route is protected and only user can update their tickets
      updateFields,
      { new: true }
    ).populate('user', 'name'); // Populate user data on update response
    
    if (!ticket) return res.status(404).json({ error: 'Ticket not found or status not open for update' });
    return res.json(ticket);
  } catch (err) {
    console.error("Error updating ticket:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Close a ticket
export const closeTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findOneAndUpdate(
      { _id: id, status: 'open' /* , user: req.user._id */ }, // Add user: req.user._id back if only user can close their tickets
      { status: 'closed', updatedAt: Date.now() },
      { new: true }
    ).populate('user', 'name'); // Populate user data on close response

    if (!ticket) return res.status(404).json({ error: 'Ticket not found or already closed' });
    return res.json(ticket);
  } catch (err) {
    console.error("Error closing ticket:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Reopen a closed ticket
export const reopenTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findOneAndUpdate(
      { _id: id, status: 'closed' },
      { status: 'reopened', updatedAt: Date.now() },
      { new: true }
    ).populate('user', 'name'); // Populate user data on reopen response

    if (!ticket) return res.status(404).json({ error: 'Ticket not found or not closed' });
    return res.json(ticket);
  } catch (err) {
    console.error("Error reopening ticket:", err);
    return res.status(500).json({ error: err.message });
  }
};

export const getTicketById = async (req, res) => {
  try {
    // Populate user data when getting a single ticket by ID
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

// Get Ticket Summary Counts
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

// Add reply to ticket (by user)
export const addUserReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const image = req.file ? req.file.filename : null;

    const ticket = await Ticket.findById(id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    // Ensure messages array exists
    ticket.messages = ticket.messages || [];
    
    // --- CRUCIAL FIX: Ensure author is set to req.user._id ---
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "User not authenticated to add reply." });
    }

    ticket.messages.push({
      author: req.user._id, // Assign the authenticated user's ID as author
      authorRole: 'user',
      content,
      image,
      date: new Date()
    });

    ticket.updatedAt = Date.now();
    await ticket.save();

    res.json(ticket);
  } catch (err) {
    console.error("Error adding user reply:", err);
    return res.status(500).json({ error: err.message });
  }
};

// --- NEW FUNCTION: Delete a message from a ticket by a user ---
export const deleteUserMessage = async (req, res) => {
  try {
    const { ticketId, messageId } = req.params;

    // Ensure user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      console.error(`User Delete: Ticket not found for ID: ${ticketId}`);
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    const messageIndex = ticket.messages.findIndex(m => m._id.toString() === messageId);

    if (messageIndex === -1) {
      console.error(`User Delete: Message not found for ID: ${messageId} in ticket ${ticketId}`);
      return res.status(404).json({ success: false, message: 'Message not found in this ticket.' });
    }

    const messageToDelete = ticket.messages[messageIndex];

    // CRITICAL: Authorization check - ensure the logged-in user is the author of the message
    // Check if messageToDelete.author exists before calling .toString()
    if (!messageToDelete.author || messageToDelete.author.toString() !== req.user._id.toString()) {
      console.warn(`User ${req.user._id} attempted to delete message ${messageId} not authored by them.`);
      return res.status(403).json({ success: false, message: 'Not authorized to delete this message.' });
    }

    // Remove the message from the array
    ticket.messages.splice(messageIndex, 1);

    // Update the ticket's updatedAt timestamp
    ticket.updatedAt = Date.now();
    
    // Save the updated ticket
    await ticket.save();

    console.log(`User ${req.user._id} successfully deleted message ${messageId} from ticket ${ticketId}.`);
    return res.status(200).json({ success: true, message: 'Message deleted successfully.' });

  } catch (error) {
    console.error("User Delete Message Error:", error);
    // Provide a more specific error message in development, or a generic one in production
    return res.status(500).json({ success: false, message: 'Failed to delete message due to server error. Check server logs for details.' });
  }
};
