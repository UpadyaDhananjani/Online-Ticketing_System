import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import connectDB from "./config/mongodb.js"; 

// Route imports
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import ticketAdminRoutes from './routes/ticketAdminRoutes.js';
import uploadRoutes from "./routes/uploadRoutes.js";
import publicRoutes from './routes/publicRoutes.js';
import adminRouter from "./routes/adminRoutes.js";
import notificationRoutes from './routes/notificationRoutes.js'; // <-- NEW

// Import middleware
import { protect, admin } from './middleware/authMiddleware.js';

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
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
    credentials: true, // This must be true for cookies to be sent/received cross-origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Import ticket stats routes
import ticketStatsRouter from './routes/ticketStatsRoutes.js';

app.use('/api/admin', adminRouter);
app.use('/api/admin/tickets', ticketStatsRouter);

// --- Server initialization ---
app.listen(port, () => console.log(`Server started on PORT:${port}`));

// --- API Routes ---
app.get('/', (req, res) => res.send("API working"));
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/notifications', notificationRoutes); // <-- NEW

app.use('/api/admin/tickets', ticketAdminRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/public', publicRoutes);

// Authentication check endpoint - now correctly protected
app.get('/api/auth/is-auth', protect, (req, res) => {
    res.json({ success: true, message: "User is authenticated.", userId: req.user._id });
});

// Static file serving for uploads
const uploadsDir = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsDir));
