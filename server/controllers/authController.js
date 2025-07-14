// backend/controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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
            return res.json({ success: false, message: "User already exists with this email." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new userModel({ name, email, password: hashedPassword, unit }); // <-- Save unit
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'Lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to Ticketing System!',
            text: `Welcome to the Ticketing System website. Your account has been created with email ID: ${email}.\n\nPlease verify your email to access all features.`
        };
        await transporter.sendMail(mailOptions);

        return res.json({ success: true, message: 'Registration successful! Please check your email to verify your account.' });

    } catch (error) {
        console.error("Error during registration:", error);
        res.json({ success: false, message: "Registration failed: " + error.message });
    }
};

// Login user
export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ success: false, message: 'Email and password are required' });
    }

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'Lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({ success: true, message: 'Login successful' });

    } catch (error) {
        console.error("Error during login:", error);
        return res.json({ success: false, message: "Login failed: " + error.message });
    }
};

// Logout user
export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'Lax',
        });

        return res.json({ success: true, message: "Logged Out" });

    } catch (error) {
        console.error("Error during logout:", error);
        return res.json({ success: false, message: "Logout failed: " + error.message });
    }
};

// Send verification OTP
export const sendVerifyOtp = async (req, res) => {
    // With authMiddleware, you can use req.user._id instead of req.body.userId if desired.
    // For now, keeping req.body.userId as per your current frontend logic in EmailVerify.jsx
    const { userId } = req.body;

    if (!userId) {
        return res.json({ success: false, message: "User ID is required." });
    }

    try {
        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({ success: false, message: "User not found." });
        }

        if (user.isAccountVerified) {
            return res.json({ success: false, message: "Account already verified." });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 15 * 60 * 1000;
        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account Verification OTP',
            text: `Your OTP for account verification is: ${otp}. This OTP is valid for 15 minutes.`
        };
        await transporter.sendMail(mailOption);
        res.json({ success: true, message: 'Verification OTP sent to your email.' });

    } catch (error) {
        console.error("Error sending verification OTP:", error);
        res.json({ success: false, message: "Failed to send verification OTP: " + error.message });
    }
};

// Verify Email with OTP
export const verifyEmail = async (req, res) => {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
        return res.json({ success: false, message: 'User ID and OTP are required.' });
    }

    try {
        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({ success: false, message: 'User not found.' });
        }

        if (user.isAccountVerified) {
            return res.json({ success: false, message: 'Account already verified.' });
        }

        if (user.verifyOtp === '' || user.verifyOtp !== otp) {
            return res.json({ success: false, message: 'Invalid OTP.' });
        }

        if (user.verifyOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: 'OTP Expired. Please request a new one.' });
        }

        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;
        await user.save();

        return res.json({ success: true, message: 'Email verified successfully!' });

    } catch (error) {
        console.error("Error verifying email:", error);
        return res.json({ success: false, message: "Email verification failed: " + error.message });
    }
};

// Send password reset OTP
export const sendResetOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.json({ success: false, message: 'Email is required.' });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'User not found for this email.' });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password Reset OTP',
            text: `Your OTP for resetting your password is: ${otp}. This OTP is valid for 15 minutes.`
        };

        await transporter.sendMail(mailOption);
        return res.json({ success: true, message: 'Password reset OTP sent to your email.' });

    } catch (error) {
        console.error("Error sending reset OTP:", error);
        return res.json({ success: false, message: "Failed to send reset OTP: " + error.message });
    }
};

// Reset user password
export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.json({ success: false, message: 'Email, OTP, and new password are required.' });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'User not found.' });
        }

        if (user.resetOtp === "" || user.resetOtp !== otp) {
            return res.json({ success: false, message: 'Invalid OTP.' });
        }

        if (user.resetOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: 'OTP Expired. Please request a new one.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;

        await user.save();

        return res.json({ success: true, message: 'Password has been reset successfully.' });

    } catch (error) {
        console.error("Error resetting password:", error);
        return res.json({ success: false, message: "Password reset failed: " + error.message });
    }
};

// Removed isAuthenticated export as its functionality is now covered by getUserData
// export const isAuthenticated = async (req, res) => { /* ... */ };