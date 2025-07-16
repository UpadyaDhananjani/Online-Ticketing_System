// server/server.js (or app.js) - Your main server file
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './config/mongodb.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import ticketAdminRoutes from './routes/ticketAdminRoutes.js';
import uploadRoutes from "./routes/uploadRoutes.js";

// Import authMiddleware here since you're using it directly in this file
import authMiddleware from './middleware/authMiddleware.js'; // <--- Ensure this import is present

// Initialize environment variables
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
app.use('/api/admin/tickets', ticketAdminRoutes);
app.use('/api/upload', uploadRoutes);

// Authentication check endpoint - now correctly protected by authMiddleware
app.get('/api/auth/is-auth', authMiddleware, (req, res) => {
    // If authMiddleware successfully passes, it means the user is authenticated.
    // We can send a simple success or even basic user info (though get-user-data is better for full data)
    res.json({ success: true, message: "User is authenticated.", userId: req.user._id });
});

// Static file serving for uploads
const uploadsDir = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsDir));

// --- Server initialization ---
app.listen(port, () => console.log(`Server started on PORT:${port}`));