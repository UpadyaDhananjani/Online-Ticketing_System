// server/routes/authRoutes.js
import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';

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

// --- Protected routes (require authentication using authMiddleware) ---
authRouter.get('/get-user-data', authMiddleware, getUserData);
authRouter.post('/send-verify-otp', authMiddleware, sendVerifyOtp);
authRouter.post('/verify-account', authMiddleware, verifyEmail);

export default authRouter;