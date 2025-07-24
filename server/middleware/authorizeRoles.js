// server/middleware/authorizeRoles.js

/**
 * Middleware to authorize access based on user roles.
 * This middleware should be used AFTER authMiddleware, as it relies on req.user being populated.
 *
 * @param {...string} roles - A list of roles that are allowed to access the route.
 * @returns {function} Express middleware function.
 */
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        console.log(`AUTHORIZE_ROLES_MIDDLEWARE: Checking roles for user: ${req.user?.email} (Role: ${req.user?.role})`);
        console.log(`AUTHORIZE_ROLES_MIDDLEWARE: Allowed roles for this route: ${roles.join(', ')}`);

        // Check if req.user exists (meaning authMiddleware has run successfully)
        if (!req.user) {
            console.log("AUTHORIZE_ROLES_MIDDLEWARE: req.user is not defined. Sending 401.");
            return res.status(401).json({ success: false, message: "Not Authorized: User not authenticated." });
        }

        // Check if the user's role is included in the allowed roles for this route
        if (!roles.includes(req.user.role)) {
            console.log(`AUTHORIZE_ROLES_MIDDLEWARE: User role '${req.user.role}' not allowed. Sending 403.`);
            return res.status(403).json({ success: false, message: `Forbidden: User role '${req.user.role}' is not authorized to access this resource.` });
        }

        console.log("AUTHORIZE_ROLES_MIDDLEWARE: User role authorized. Proceeding.");
        next(); // User is authorized, proceed to the next middleware/controller
    };
};

export default authorizeRoles;
