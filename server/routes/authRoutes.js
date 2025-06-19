import express from 'express'
import { register } from '../controllers/authController.js';
import e from 'express';

const authRouter = express.Router();

authRouter.post('/register',register);
authRouter.post('/login',register);
authRouter.post('/logout',register);

export default authRouter;