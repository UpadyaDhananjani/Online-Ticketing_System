
import express from 'express';


import userAuth from '../middleware/authMiddleware.js';
import { register, login, logout, sendVerifyOtp, verifyEmail, isAuthenticated, sendResetOtp , resetPassword} from '../controllers/authController.js';
import { register, login, logout } from '../controllers/authController.js';


const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);

authRouter.post('/send-verify-otp', userAuth, sendVerifyOtp);
authRouter.post('/verify-account', userAuth, verifyEmail);
authRouter.post('/is-auth', isAuthenticated);
authRouter.post('/send-reset-otp', sendResetOtp);
authRouter.post('/reset-password', resetPassword);


export default authRouter;

import express from 'express'
import { register } from '../controllers/authController.js';
import e from 'express';

const authRouter = express.Router();

// authRouter.post('/register',register);
// authRouter.post('/login',login);
// authRouter.post('/logout',logout);

// export default authRouter;

