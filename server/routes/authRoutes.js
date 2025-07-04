// backend/routes/authRoute.js
import express from 'express';
// Use only one import for the middleware
import authMiddleware from '../middleware/authMiddleware.js'; // Ensure this path is correct

import {
  register,
  login,
  logout,
  sendVerifyOtp,
  verifyEmail,
  getUserData, // Make sure getUserData is imported from your authController
  sendResetOtp,
  resetPassword
} from '../controllers/authController.js';

const authRouter = express.Router();

// --- Public routes (no authentication required) ---
authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout); // Logout typically doesn't need authMiddleware as it clears the token
authRouter.post('/send-reset-otp', sendResetOtp);
authRouter.post('/reset-password', resetPassword);

// --- Protected routes (require authentication using authMiddleware) ---

// This endpoint serves as the primary way for the frontend to check authentication status
// and retrieve user data. It MUST be protected by authMiddleware.
authRouter.get('/get-user-data', authMiddleware, getUserData); // <-- This is the key change

// Other routes that require a logged-in user to perform actions:
authRouter.post('/send-verify-otp', authMiddleware, sendVerifyOtp);
authRouter.post('/verify-account', authMiddleware, verifyEmail);

// Note: The '/is-auth' route and its corresponding 'isAuthenticated' controller
// are no longer needed, as their functionality is now covered by '/get-user-data'.
// If you still have them, please remove them to avoid confusion and redundancy.

export default authRouter;