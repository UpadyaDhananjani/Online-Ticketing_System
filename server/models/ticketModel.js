// server/models/ticketModel.js
import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['incident', 'bug', 'maintenance', 'request', 'service'], 
    required: true 
  },
  status: { type: String, enum: ['open', 'closed', 'reopened'], default: 'open' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;
