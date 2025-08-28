// server/routes/authRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

import {
    register,
    login,
    logout,
    sendVerifyOtp,
    verifyEmail,
    getUserData,
    sendResetOtp,
    resetPassword,
    adminLogin
} from '../controllers/authController.js';

const authRouter = express.Router();

// --- Public routes (no authentication required) ---
authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/send-reset-otp', sendResetOtp);
authRouter.post('/reset-password', resetPassword);
authRouter.post('/admin-login', adminLogin);

// --- Protected routes (require authentication) ---
authRouter.get('/get-user-data', protect, getUserData);
authRouter.post('/send-verify-otp', protect, sendVerifyOtp);
authRouter.post('/verify-account', protect, verifyEmail);

export default authRouter;