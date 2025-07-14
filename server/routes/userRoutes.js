import express from 'express'
import userAuth from '../middleware/userAuth.js';
import { getUserData, getUsersByUnit } from '../controllers/userController.js';
import { getUserData, getUsersByUnit } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.get('/data', userAuth, getUserData);
userRouter.get('/by-unit/:unit', userAuth, getUsersByUnit);
userRouter.get('/by-unit/:unit', userAuth, getUsersByUnit);

export default userRouter;