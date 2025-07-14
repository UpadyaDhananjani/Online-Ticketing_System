// server/controllers/authController.js
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js'; // Assuming you have this configured
import bcrypt from 'bcryptjs'; // Essential for password hashing/comparison
import jwt from 'jsonwebtoken'; // Essential for JWT token creation/signing

// Helper to determine environment for cookie settings
// This should be at the top level of the module.
const isProduction = process.env.NODE_ENV === 'production';

// Helper function to generate JWT token
const generateToken = (id, role) => {
    // console.log(`CONTROLLER: Generating token for ID: ${id} with role: ${role}`); // Can uncomment for debugging
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// --- Register User ---
export const register = async (req, res) => {
    const { name, email, password, unit } = req.body;

    if (!name || !email || !password || !unit) {
        return res.json({ success: false, message: 'Missing Details' });
    }

    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            console.log("CONTROLLER: Register failed: User with this email already exists.");
            return res.status(400).json({ success: false, message: 'User with this email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user with default role 'user'
        const user = new userModel({ name, email, password: hashedPassword, unit, role: 'user' });
        await user.save();

        const token = generateToken(user._id, user.role);

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days (was 1 day, changed to match typical JWT expiry)
            sameSite: isProduction ? 'None' : 'Lax',
            secure: isProduction,
            // You might need to set 'domain' in production if your frontend and backend are on different subdomains
            // domain: isProduction ? '.yourdomain.com' : undefined,
        });
        console.log("CONTROLLER: Registration successful. Cookie 'token' set.");
        // console.log("CONTROLLER: Response Set-Cookie header after registration:", res.getHeaders()['set-cookie']); // Can uncomment for debugging

        res.status(201).json({
            success: true,
            message: 'Registration successful!',
            userData: {
                id: user._id, // Corrected from newUser to user
                name: user.name,
                email: user.email,
                role: user.role,
                unit: user.unit,
                isAccountVerified: user.isAccountVerified // Assuming this property exists on your user model
            },
        });

    } catch (error) {
        console.error('CONTROLLER ERROR: Register error (catch block):', error);
        res.status(500).json({ success: false, message: 'Server error during registration.' });
    }
};

// --- Login User ---
export const login = async (req, res) => {
    console.log("CONTROLLER: Login request received. Body:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
        console.log("CONTROLLER: Login validation failed: Missing fields.");
        return res.status(400).json({ success: false, message: 'Please enter all fields.' });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            console.log("CONTROLLER: Login failed: User not found for email:", email);
            return res.status(400).json({ success: false, message: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("CONTROLLER: Login failed: Password mismatch for email:", email);
            return res.status(400).json({ success: false, message: 'Invalid credentials.' });
        }

        const token = generateToken(user._id, user.role);

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days (was 1 day, changed to match typical JWT expiry)
            sameSite: isProduction ? 'None' : 'Lax',
            secure: isProduction,
            // domain: isProduction ? '.yourdomain.com' : undefined,
        });
        console.log("CONTROLLER: Login successful. Cookie 'token' set for user:", user.email);
        // console.log("CONTROLLER: Response Set-Cookie header after login:", res.getHeaders()['set-cookie']); // Can uncomment for debugging

        res.status(200).json({
            success: true,
            message: 'Logged in successfully!',
            userData: {
                id: user._id,
                name: user.name,
                email: user.email,
                unit: user.unit, // Assuming user model has unit field
                role: user.role,
                isAccountVerified: user.isAccountVerified
            },
        });

    } catch (error) {
        console.error('CONTROLLER ERROR: Login error (catch block):', error);
        res.status(500).json({ success: false, message: 'Server error during login.' });
    }
};

// --- Logout User ---
export const logout = async (req, res) => {
    console.log("CONTROLLER: Logout request received.");
    try {
        res.clearCookie('token', {
            httpOnly: true,
            sameSite: isProduction ? 'None' : 'Lax',
            secure: isProduction,
            // domain: isProduction ? '.yourdomain.com' : undefined,
        });
        console.log("CONTROLLER: Logout successful. Cookie 'token' cleared.");
        // console.log("CONTROLLER: Response Set-Cookie header after logout:", res.getHeaders()['set-cookie']); // Can uncomment for debugging
        res.status(200).json({ success: true, message: 'Logged out successfully!' });
    } catch (error) {
        console.error('CONTROLLER ERROR: Logout error:', error);
        res.status(500).json({ success: false, message: 'Server error during logout.' });
    }
};

// --- Get User Data (Protected Route - Populated by authMiddleware) ---
export const getUserData = async (req, res) => {
    console.log("CONTROLLER: Get user data request received.");
    // req.user is populated by authMiddleware if authentication is successful
    console.log("CONTROLLER: req.user status:", req.user ? `User object exists (${req.user.email}, Role: ${req.user.role})` : "User object is NULL/undefined");
    
    if (req.user) {
        // Only send necessary user data
        return res.status(200).json({
            success: true,
            userData: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                unit: req.user.unit, // Include unit for non-admin users if available
                isAccountVerified: req.user.isAccountVerified,
                role: req.user.role,
            },
        });
    } else {
        // This block should ideally not be hit if authMiddleware is correctly sending 401.
        console.log("CONTROLLER: Get user data failed: User not authenticated (req.user is null/undefined). Sending 401.");
        return res.status(401).json({ success: false, message: "User not authenticated." });
    }
};

// --- Send Verify OTP (Protected) ---
export const sendVerifyOtp = async (req, res) => {
    console.log("CONTROLLER: Send Verify OTP request received.");
    if (!req.user) {
        console.log("CONTROLLER: Send Verify OTP failed: User not authenticated.");
        return res.status(401).json({ success: false, message: "User not authenticated." });
    }
    // Placeholder logic: In a real app, generate OTP, save it to user model, send email via transporter
    // For now, just send a success message.
    res.status(200).json({ success: true, message: "Verification OTP sent (dummy response)." });
};

// --- Verify Email (Protected) ---
export const verifyEmail = async (req, res) => {
    console.log("CONTROLLER: Verify Email request received. Body:", req.body);
    if (!req.user) {
        console.log("CONTROLLER: Verify Email failed: User not authenticated.");
        return res.status(401).json({ success: false, message: "User not authenticated." });
    }
    const { otp } = req.body;
    // Placeholder logic: In a real app, compare received OTP with saved OTP for req.user
    // If valid, update user.isAccountVerified to true
    res.status(200).json({ success: true, message: "Email verified successfully (dummy response)." });
};

// --- Send Reset OTP ---
export const sendResetOtp = async (req, res) => {
    console.log("CONTROLLER: Send Reset OTP request received. Body:", req.body);
    const { email } = req.body;
    // Placeholder logic: In a real app, find user by email, generate OTP, save it, send email
    res.status(200).json({ success: true, message: "Password reset OTP sent (dummy response)." });
};

// --- Reset Password ---
export const resetPassword = async (req, res) => {
    console.log("CONTROLLER: Reset Password request received. Body:", req.body);
    const { email, otp, newPassword } = req.body;
    // Placeholder logic: In a real app, find user by email and OTP, hash new password, update user
    res.status(200).json({ success: true, message: "Password reset successfully (dummy response)." });
};

// --- Admin Login (Hardcoded Credentials for Demo) ---
export const adminLogin = async (req, res) => {
    console.log("CONTROLLER: Admin Login request received. Body:", req.body);
    const { email, password } = req.body;

    // Hardcoded admin credentials for demonstration purposes
    const ADMIN_USERNAME = 'admin@gmail.com';
    const ADMIN_PASSWORD = 'admin123'; 

    console.log(`CONTROLLER: Admin Login Attempt - Received Email: '${email}', Received Password: '${password}'`);
    console.log(`CONTROLLER: Expected Email: '${ADMIN_USERNAME}', Expected Password: '${ADMIN_PASSWORD}'`);

    if (!email || !password) {
        console.log("CONTROLLER: Admin Login validation failed: Missing fields.");
        return res.status(400).json({ success: false, message: 'Please enter all fields.' });
    }

    // Directly compare with hardcoded credentials
    if (email === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        console.log("CONTROLLER: Admin Login credentials MATCHED.");
        // A fixed, arbitrary ID for the hardcoded admin. This ID is used in the JWT.
        const adminId = "65c3b957388703a1d2f62365"; 
        const adminName = "Super Admin";

        const token = generateToken(adminId, 'admin'); // Generate token with 'admin' role

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days (was 1 day, changed to match typical JWT expiry)
            sameSite: isProduction ? 'None' : 'Lax',
            secure: isProduction,
            // domain: isProduction ? '.yourdomain.com' : undefined,
        });
        console.log("CONTROLLER: Admin Login successful. Cookie 'token' set.");

        res.status(200).json({
            success: true,
            message: 'Admin logged in successfully!',
            userData: {
                id: adminId,
                name: adminName,
                email: ADMIN_USERNAME,
                role: 'admin', // Explicitly set role to admin
            },
        });
    } else {
        console.log("CONTROLLER: Admin Login credentials MISMATCHED.");
        return res.status(400).json({ success: false, message: 'Invalid admin credentials.' });
    }
};