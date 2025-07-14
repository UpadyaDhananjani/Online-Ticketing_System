// server/controllers/authController.js
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js'; // Assuming you have this configured

// Get User Data (requires authentication middleware)
export const getUserData = async (req, res) => {
    try {
        // userId is expected from the authentication middleware (req.user._id)
        const userId = req.user._id;

        const user = await userModel.findById(userId).select('-password -verifyOtp -resetOtp -verifyOtpExpireAt -resetOtpExpireAt'); // Exclude sensitive OTP fields and their expiry

        if (!user) {
            // This case should ideally not happen if authMiddleware found a user
            // but it's good for robustness. A 401 from middleware is more likely if no token.
            return res.status(404).json({
                success: false,
                message: "User not found (after authentication, but token valid for a non-existent user)"
            });
        }

        return res.json({
            success: true,
            userData: {
                id: user._id,
                name: user.name,
                email: user.email,
                unit: user.unit, // <-- Add unit here
                isAccountVerified: user.isAccountVerified
            }
        });
    } catch (error) {
        // Log the error for debugging purposes
        console.error("Error in getUserData (controller):", error);
        // If an error occurs here, it's a server issue, not an authentication failure
        return res.status(500).json({
            success: false,
            message: "Server error fetching user data: " + error.message
        });
    }
};

// Register user
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

        const user = new userModel({ name, email, password: hashedPassword, unit }); // <-- Save unit
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true, // Prevents client-side JS from accessing the cookie
            maxAge: 1000 * 60 * 60 * 24, // 1 day
            // sameSite: 'None' requires secure: true. For localhost (HTTP), use 'Lax'.
            sameSite: isProduction ? 'None' : 'Lax',
            secure: isProduction, // true for HTTPS in production, false for HTTP in dev
            // domain: isProduction ? '.yourdomain.com' : undefined, // Set if deploying to a specific domain
        });
        console.log("CONTROLLER: Registration successful. Cookie 'token' set.");
        // Debugging: Log the Set-Cookie header to confirm it's being sent
        console.log("CONTROLLER: Response Set-Cookie header after registration:", res.getHeaders()['set-cookie']);


        res.status(201).json({
            success: true,
            message: 'Registration successful!',
            userData: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role, // Include role in userData
            },
        });

    } catch (error) {
        console.error('CONTROLLER ERROR: Register error (catch block):', error);
        res.status(500).json({ success: false, message: 'Server error during registration.' });
    }
};

// --- Login User ---
const login = async (req, res) => {
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

        const token = generateToken(user._id, user.role); // Pass role to generateToken

        // Determine cookie settings based on environment
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24, // 1 day
            sameSite: isProduction ? 'None' : 'Lax',
            secure: isProduction,
            // domain: isProduction ? '.yourdomain.com' : undefined,
        });
        console.log("CONTROLLER: Login successful. Cookie 'token' set for user:", user.email);
        // Debugging: Log the Set-Cookie header to confirm it's being sent
        console.log("CONTROLLER: Response Set-Cookie header after login:", res.getHeaders()['set-cookie']);


        res.status(200).json({
            success: true,
            message: 'Logged in successfully!',
            userData: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role, // Include role in userData
            },
        });

    } catch (error) {
        console.error('CONTROLLER ERROR: Login error (catch block):', error);
        res.status(500).json({ success: false, message: 'Server error during login.' });
    }
};

// --- Logout User ---
const logout = async (req, res) => {
    console.log("CONTROLLER: Logout request received.");
    try {
        const isProduction = process.env.NODE_ENV === 'production';
        res.clearCookie('token', {
            httpOnly: true,
            sameSite: isProduction ? 'None' : 'Lax',
            secure: isProduction,
            // domain: isProduction ? '.yourdomain.com' : undefined,
        });
        console.log("CONTROLLER: Logout successful. Cookie 'token' cleared.");
        console.log("CONTROLLER: Response Set-Cookie header after logout:", res.getHeaders()['set-cookie']); // Debugging
        res.status(200).json({ success: true, message: 'Logged out successfully!' });
    } catch (error) {
        console.error('CONTROLLER ERROR: Logout error:', error);
        res.status(500).json({ success: false, message: 'Server error during logout.' });
    }
};

// --- Get User Data (Protected Route) ---
const getUserData = async (req, res) => {
    console.log("CONTROLLER: Get user data request received.");
    // req.user is populated by authMiddleware if authentication is successful
    console.log("CONTROLLER: req.user status:", req.user ? "User object exists (" + req.user.email + ")" : "User object is NULL/undefined");
    if (req.user) {
        // Only send necessary user data
        return res.status(200).json({
            success: true,
            userData: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                isAccountVerified: req.user.isAccountVerified,
                role: req.user.role,
            },
        });
    } else {
        // This block should ideally not be hit if authMiddleware is correctly sending 401.
        // It serves as a fallback or if this route is accessed without middleware.
        console.log("CONTROLLER: Get user data failed: User not authenticated (req.user is null/undefined). Sending 401.");
        return res.status(401).json({ success: false, message: "User not authenticated." });
    }
};

// --- Send Verify OTP (Protected) ---
const sendVerifyOtp = async (req, res) => {
    console.log("CONTROLLER: Send Verify OTP request received.");
    if (!req.user) {
        console.log("CONTROLLER: Send Verify OTP failed: User not authenticated.");
        return res.status(401).json({ success: false, message: "User not authenticated." });
    }
    // Implement your OTP sending logic here.
    res.status(200).json({ success: true, message: "Verification OTP sent (dummy response)." });
};

// --- Verify Email (Protected) ---
const verifyEmail = async (req, res) => {
    console.log("CONTROLLER: Verify Email request received. Body:", req.body);
    if (!req.user) {
        console.log("CONTROLLER: Verify Email failed: User not authenticated.");
        return res.status(401).json({ success: false, message: "User not authenticated." });
    }
    const { otp } = req.body;
    // Implement your OTP verification logic here.
    res.status(200).json({ success: true, message: "Email verified successfully (dummy response)." });
};

// --- Send Reset OTP ---
const sendResetOtp = async (req, res) => {
    console.log("CONTROLLER: Send Reset OTP request received. Body:", req.body);
    const { email } = req.body;
    res.status(200).json({ success: true, message: "Password reset OTP sent (dummy response)." });
};

// --- Reset Password ---
const resetPassword = async (req, res) => {
    console.log("CONTROLLER: Reset Password request received. Body:", req.body);
    const { email, otp, newPassword } = req.body;
    res.status(200).json({ success: true, message: "Password reset successfully (dummy response)." });
};

// --- Admin Login (UPDATED FOR FIXED CREDENTIALS & MORE LOGGING) ---
const adminLogin = async (req, res) => {
    console.log("CONTROLLER: Admin Login request received. Body:", req.body);
    const { email, password } = req.body;

    // Hardcoded admin credentials
    const ADMIN_USERNAME = 'admin@gmail.com';
    const ADMIN_PASSWORD = 'admin123'; // In a real app, this would be a hashed password

    // --- NEW LOGGING ---
    console.log(`CONTROLLER: Admin Login Attempt - Received Email: '${email}', Received Password: '${password}'`);
    console.log(`CONTROLLER: Expected Email: '${ADMIN_USERNAME}', Expected Password: '${ADMIN_PASSWORD}'`);
    // --- END NEW LOGGING ---

    if (!email || !password) {
        console.log("CONTROLLER: Admin Login validation failed: Missing fields.");
        return res.status(400).json({ success: false, message: 'Please enter all fields.' });
    }

    // Directly compare with hardcoded credentials
    if (email === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        console.log("CONTROLLER: Admin Login credentials MATCHED.");
        // Since we're not fetching from DB, create a dummy user ID for the token
        const adminId = "65c3b957388703a1d2f62365"; // A fixed, arbitrary ID for the hardcoded admin
        const adminName = "Super Admin";

        const token = generateToken(adminId, 'admin'); // Generate token with 'admin' role

        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24, // 1 day
            sameSite: isProduction ? 'None' : 'Lax',
            secure: isProduction,
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

export {
    register,
    login,
    logout,
    sendVerifyOtp,
    verifyEmail,
    getUserData,
    sendResetOtp,
    resetPassword,
    adminLogin,
};