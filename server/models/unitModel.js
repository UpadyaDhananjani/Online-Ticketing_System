// server/models/unitModel.js
const mongoose = require('mongoose');

const unitSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
        },
        // Add any other unit-specific fields
    },
    {
        timestamps: true,
    }
);

const Unit = mongoose.model('Unit', unitSchema);
module.exports = Unit;