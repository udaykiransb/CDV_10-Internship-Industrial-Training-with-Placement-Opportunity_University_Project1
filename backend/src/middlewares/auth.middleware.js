const { verifyToken } = require('../utils/jwt.util');

/**
 * Middleware to verify JWT token and attach user to request object
 */
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.',
        });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
        console.warn(`[AUTH_ERR] Invalid/Expired token from IP: ${req.ip} | Path: ${req.originalUrl}`);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token. Please log in again.',
        });
    }

    // Attach user information to the request
    req.user = decoded;
    
    // Diagnostic log for request analysis
    console.log(`[REQUEST] ${req.method} ${req.originalUrl} | User: ${req.user.id} | Role: ${req.user.role}`);
    
    next();
};

module.exports = authMiddleware;
