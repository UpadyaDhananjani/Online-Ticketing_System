// server/server.js (or app.js) - Your main server file
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './config/mongodb.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import adminRoutes from './routes/ticketAdminRoutes.js';
import publicRoutes from './routes/publicRoutes.js'; // <--- NEW IMPORT

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
    origin: 'http://localhost:3000', // Your frontend URL
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Define routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/admin/tickets', adminRoutes);
app.use('/api/public', publicRoutes); // <--- NEW PUBLIC ROUTES

// Error handling middleware (if you have one)
// app.use(errorHandler);

app.listen(PORT, () => console.log(`Server started on PORT:${PORT}`));