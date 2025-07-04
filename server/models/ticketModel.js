import mongoose from 'mongoose';


const messageSchema = new mongoose.Schema({
  // Removed duplicate 'author' field. Assuming one 'author' field is enough.
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Changed to required: true as author should always exist
  authorRole: { type: String, enum: ['user', 'admin'], required: true },
  content: { type: String, required: true }, // HTML or text
  attachments: [{ type: String }], // File URLs or paths
  date: { type: Date, default: Date.now }
});


const ticketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // This is correct for referencing the User
  subject: { type: String, required: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['incident', 'bug', 'maintenance', 'request', 'service'], 
    required: true 
  },
  status: { type: String, enum: ['open', 'closed', 'reopened', 'resolved', 'in progress'], default: 'open' },
    assignedUnit: {
    type: String,
    enum: [
      'System and Network Administration',
      'Asyhub Unit',
      'Statistics Unit',
      'Audit Unit',
      'Helpdesk Unit',
      'Functional Unit'
    ],
    required: true
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  image: { type: String, required: false }, // Optional image field
  messages: [messageSchema]
});

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;
