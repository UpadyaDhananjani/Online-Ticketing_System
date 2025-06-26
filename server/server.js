import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";

import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import authMiddleware from "./middleware/authMiddleware.js";

// ✅ Load .env once
dotenv.config();

// ✅ Connect to MongoDB
connectDB();

const app = express();
const port = process.env.PORT || 4000;

// ✅ Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// ✅ API Endpoints
app.get('/', (req, res) => res.send("API working"));

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/tickets', ticketRoutes);

// ✅ Start server
app.listen(port, () => console.log(`Server started on PORT: ${port}`));
