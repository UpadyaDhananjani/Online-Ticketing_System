// server/models/userModel.js
import mongoose from "mongoose";
import bcrypt from 'bcryptjs'; // Assuming you use bcryptjs for password hashing

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        // --- THIS IS THE CRUCIAL FIELD FOR UNITS (BACK TO STRING ENUM) ---
        unit: {
            type: String, // Stores the name of the unit as a string
            enum: [ // Must exactly match the hardcoded list in publicController.js
                'System and Network Administration',
                'Asyhub Unit',
                'Statistics Unit',
                'Audit Unit',
                'Helpdesk Unit',
                'Functional Unit'
            ],
            required: true, // Set to true if every user MUST belong to a unit
        },
        // -----------------------------------------------------------------
        verifyOtp: {
            type: String,
            default: ''
        },
        verifyOtpExpireAt: {
            type: Number,
            default: 0
        },
        isAccountVerified: {
            type: Boolean,
            default: false
        },
        resetOtp: {
            type: String,
            default: ''
        },
        resetOtpExpireAt: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true,
    }
);

// Add methods for password hashing, etc., if they are not already here
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const userModel = mongoose.model('User', userSchema);

export default userModel;