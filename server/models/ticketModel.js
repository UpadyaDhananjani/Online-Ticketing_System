// server/models/ticketModel.js

import mongoose from 'mongoose';

// Ensure Mongoose is used consistently
const { Schema } = mongoose;

const messageSchema = new Schema({
    author: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true
    },
    authorRole: { 
        type: String, 
        enum: ['user', 'admin'], 
        required: true 
    },
    content: { 
        type: String, 
        required: true
    },
    attachments: [{ 
        type: String
    }],
    date: { 
        type: Date, 
        default: Date.now 
    }
});

const ticketSchema = new Schema({
    user: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    subject: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String, 
        enum: ['incident', 'bug', 'maintenance', 'request', 'service'], 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['open', 'closed', 'reopened', 'resolved', 'in progress'], 
        default: 'open' 
    },
    priority: { 
        type: String, 
        enum: ['Low', 'Medium', 'High', 'Critical'], // <-- Corrected to simpler values
        default: 'Low' // <-- Corrected to a value from the enum
    },
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
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    },
    image: { 
        type: String, 
        required: false 
    },
    attachments: [{ 
        type: String 
    }],
    assignedTo: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: false 
    },
    reassignedTo: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: false 
    },
    reassignedUnit: {
        type: String,
        enum: [
            'System and Network Administration',
            'Asyhub Unit',
            'Statistics Unit',
            'Audit Unit',
            'Helpdesk Unit',
            'Functional Unit'
        ],
        required: false
    },
    previousAssignedUnit: { 
        type: String 
    },
    previousAssignedTo: { 
        type: Schema.Types.ObjectId, 
        ref: 'User' 
    },
    messages: [messageSchema],
    reassigned: { 
        type: Boolean, 
        default: false 
    }
});

// Update the updatedAt field whenever the document is saved
ticketSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;