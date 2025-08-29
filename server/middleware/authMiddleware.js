import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';

// Protect routes - Verifies JWT token and attaches user to request
export const protect = async (req, res, next) => {
    console.log("AUTH_MIDDLEWARE: Request received.");
    try {
        let token = req.cookies.token;

        // Check Authorization header if no cookie token
        const authHeader = req.headers.authorization;
        if (!token && authHeader?.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }

        if (!token) {
            console.log("AUTH_MIDDLEWARE: No token found. Sending 401.");
            return res.status(401).json({ success: false, message: "Not Authorized." });
        }

        if (req.cookies.token) {
            console.log("AUTH_MIDDLEWARE: Token found in cookies.");
        } else {
            console.log("AUTH_MIDDLEWARE: Token found in Authorization header.");
        }

        console.log("AUTH_MIDDLEWARE: Attempting to verify token...");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("AUTH_MIDDLEWARE: Token decoded successfully:", decoded);

        if (decoded.role === 'admin') {
            req.user = {
                _id: decoded.id,
                name: process.env.ADMIN_NAME || "Admin",
                email: process.env.ADMIN_EMAIL || "admin@gmail.com",
                role: 'admin',
                isAccountVerified: true,
            };
            console.log("AUTH_MIDDLEWARE: Admin token detected. Virtual user created.");
            return next();
        }

        req.user = await userModel.findById(decoded.id).select('_id email role isAccountVerified');
        if (!req.user) {
            console.log("AUTH_MIDDLEWARE: User not found in DB. Sending 401.");
            return res.status(401).json({ success: false, message: "User not found." });
        }

        console.log("AUTH_MIDDLEWARE: User authenticated:", req.user.email);
        next();

    } catch (error) {
        console.error("AUTH_MIDDLEWARE ERROR:", error.message);
        res.clearCookie('token', {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            secure: process.env.NODE_ENV === 'production',
            expires: new Date(0),
        });
        return res.status(401).json({ success: false, message: "Not Authorized." });
    }
};

// Admin middleware - Checks if user is an admin
export const admin = (req, res, next) => {
    if (req.user?.role === 'admin') {
        return next();
    }
    res.status(403).json({ success: false, message: 'Not authorized as an admin' });
};

export default protect;
