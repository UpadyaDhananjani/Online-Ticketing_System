// server/server.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import connectDB from "./config/mongodb.js"; // Assuming this connects to your DB

// Route imports
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import ticketAdminRoutes from './routes/ticketAdminRoutes.js';
import uploadRoutes from "./routes/uploadRoutes.js";

// Import authMiddleware here since you're using it directly in this file
import authMiddleware from './middleware/authMiddleware.js'; // <--- Ensure this import is present

// Initialize environment variables
dotenv.config();

// Database connection
connectDB();

const app = express();
const port = process.env.PORT || 4000;

// --- Middleware ---

// 1. Body Parser Middleware (for JSON)
app.use(express.json());

// 2. Cookie Parser Middleware - Essential for req.cookies
app.use(cookieParser());

// 3. CORS Configuration (Crucial for cross-origin requests with cookies)
app.use(cors({
    // Only need to specify the frontend origin.
    // If you add a Vite proxy, the browser treats requests as same-origin,
    // but CORS is still needed for the initial page load and for general API calls
    // that aren't proxied or for direct backend tests.
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true // This must be true for cookies to be sent/received cross-origin
}));

// --- API Routes ---
app.get('/', (req, res) => res.send("API working"));
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
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