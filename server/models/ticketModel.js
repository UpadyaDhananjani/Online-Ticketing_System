// server/models/ticketModel.js
import mongoose from 'mongoose';


const messageSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorRole: { type: String, enum: ['user', 'admin'], required: true },
  content: { type: String, required: true }, // HTML or text
  attachments: [{ type: String }], // File URLs or paths
  date: { type: Date, default: Date.now }
});


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
  updatedAt: { type: Date, default: Date.now },
  image: { type: String, required: false } // Optional image field
});

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;
