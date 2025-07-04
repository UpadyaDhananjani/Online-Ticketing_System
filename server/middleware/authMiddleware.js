// backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const authMiddleware = async (req, res, next) => {
    let token;

    // 1. Try to get token from cookies
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    // 2. If not in cookies, check Authorization header (Bearer token)
    if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "No authentication token provided. Please log in."
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user in database, exclude password for security
        const user = await userModel.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User associated with token not found."
            });
        }

        // Attach user to request object
        req.user = user;
        next();

    } catch (err) {
        // Handle specific JWT errors
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Authentication token has expired. Please log in again."
            });
        }
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token. Please log in again."
            });
        }
        // Generic error for other issues
        console.error("Auth middleware error:", err);
        return res.status(500).json({
            success: false,
            message: "Authentication failed. Please try again later."
        });
    }
};

export default authMiddleware;