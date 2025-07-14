// server/middleware/authMiddleware.js
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';

const authMiddleware = async (req, res, next) => {
    console.log("AUTH_MIDDLEWARE: Request received.");
    try {
        const token = req.cookies.token;

        if (!token) {
            console.log("AUTH_MIDDLEWARE: No token found in cookies. Sending 401.");
            return res.status(401).json({ success: false, message: "Not Authorized, no token." });
        }

        console.log("AUTH_MIDDLEWARE: req.cookies:", req.cookies); // Log all cookies
        console.log("AUTH_MIDDLEWARE: Token found in cookies.");

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("AUTH_MIDDLEWARE: Attempting to verify token...");
        console.log("AUTH_MIDDLEWARE: Token decoded successfully:", decoded);

        // --- IMPORTANT NEW LOGIC FOR ADMIN ROLE ---
        if (decoded.role === 'admin') {
            // If the token indicates an admin, don't query the database.
            // Create a dummy user object for req.user based on the token payload.
            // This object will be accessible in subsequent controllers (like getUserData).
            req.user = {
                _id: decoded.id,
                name: "Super Admin", // A logical name for your hardcoded admin
                email: "admin@gmail.com", // The hardcoded admin's email
                role: 'admin',
                isAccountVerified: true // Assume admin accounts are verified
                // Add any other properties your frontend or other parts of your app
                // expect to find on a user object that an admin would have.
            };
            console.log("AUTH_MIDDLEWARE: Admin token detected. Virtual user created for req.user.");
            next(); // Proceed with the request as an authenticated admin
        } else {
            // For regular users, find them in the database
            req.user = await userModel.findById(decoded.id);

            if (!req.user) {
                console.log("AUTH_MIDDLEWARE: Regular user associated with token not found in DB. Sending 401.");
                return res.status(401).json({ success: false, message: "User associated with token not found." });
            }
            console.log("AUTH_MIDDLEWARE: Regular user found in DB:", req.user.email);
            next(); // Proceed with the request as an authenticated regular user
        }

    } catch (error) {
        console.error("AUTH_MIDDLEWARE ERROR: Token verification failed:", error);
        // Clear invalid token cookie to prevent infinite loops or stale tokens
        res.clearCookie('token', {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // Adjust SameSite based on your environment
            secure: process.env.NODE_ENV === 'production', // 'Secure' only works over HTTPS
        });
        return res.status(401).json({ success: false, message: "Not Authorized, token failed or expired." });
    }
};

export default authMiddleware;