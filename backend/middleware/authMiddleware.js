// Authentication Middleware - TuneCasa Pattern
// Reference: https://www.npmjs.com/package/jsonwebtoken
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/authConfig.js';

// Middleware to verify JWT token and protect routes
export const requireAuth = (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: "Authentication required. Please login."
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Attach user info to request
        req.user = {
            user_id: decoded.user_id,
            email: decoded.email
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expired. Please login again." });
        }
        return res.status(401).json({ message: "Invalid token. Please login." });
    }
};

// Optional auth - doesn't fail if no token, just sets req.user
export const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = {
                user_id: decoded.user_id,
                email: decoded.email
            };
        }
    } catch (error) {
        // Token invalid, but that's okay for optional auth
        req.user = null;
    }
    next();
};
