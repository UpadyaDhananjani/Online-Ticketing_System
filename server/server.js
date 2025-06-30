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

// Initialize environment variables
dotenv.config();

// Database connection
connectDB();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// API Routes
app.get('/', (req, res) => res.send("API working"));
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/tickets', ticketRoutes);
app.use('/api/admin/tickets', ticketAdminRoutes);
app.use('/api/upload', uploadRoutes);

// Authentication check endpoint
app.get('/api/auth/is-auth', (req, res) => {
  res.json({ authenticated: true });
});

// Static file serving
const uploadsDir = path.join(process.cwd(), 'uploads');
//app.use('/uploads', express.static(uploadsDir));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Server initialization
app.listen(port, () => console.log(`Server started on PORT:${port}`));
