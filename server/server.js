import express from "express";
import cors from "cors";

//import 'dotenv/config';
import dotenv from 'dotenv';
dotenv.config();
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";

import authRouter from './routes/authRoutes.js'
import authMiddleware from "./middleware/authMiddleware.js";
import ticketRoutes from './routes/ticketRoutes.js';
import dotenv from 'dotenv';
import userRouter from "./routes/userRoutes.js";
dotenv.config();

//import authRouter from './routes/authRoutes.js'
import ticketRoutes from './routes/ticketRoutes.js';
import ticketAdminRoutes from './routes/ticketAdminRoutes.js';
import path from 'path';


const app = express();
const port = process.env.PORT || 4000
connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));



// API Endpoints
app.get('/', (req, res)=> res.send("API working "));
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)


// API Endpoints
app.get('/', (req, res)=> res.send("API working "));
//app.use('/api/auth', authRouter);
app.use('/api/tickets', ticketRoutes);
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/api/admin/tickets', ticketAdminRoutes);
app.use('/uploads', express.static('uploads')); // To serve uploaded files


app.listen(port, ()=> console.log(`Server started on PORT:${port}`));


