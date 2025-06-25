// server/controllers/ticketController.js
import Ticket from '../models/ticketModel.js';

// Create a new ticket
export const createTicket = async (req, res) => {
  try {
    const { subject, description, type } = req.body;
    const ticket = new Ticket({
     user: "000000000000000000000000", // Dummy ObjectId
      subject,
      description,
      type
    });
    await ticket.save();
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all tickets for logged-in user
export const getUserTickets = async (req, res) => {
  try {
    // For testing: return all tickets, not just the user's
    const tickets = await Ticket.find();
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update/Edit a ticket
export const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, description } = req.body;
    const ticket = await Ticket.findOneAndUpdate(
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

// Close a ticket
export const closeTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findOneAndUpdate(
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

// Reopen a closed ticket
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
