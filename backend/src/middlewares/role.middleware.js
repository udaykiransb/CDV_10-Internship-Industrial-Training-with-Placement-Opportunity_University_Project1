/**
 * Middleware to restrict access based on user roles
 * @param {Array} allowedRoles - Array of roles permitted to access the route
 */
const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            console.warn('[AUTH_DEBUG] No req.user found in roleMiddleware');
            return res.status(403).json({
                success: false,
                message: 'Permission denied. User not authenticated.',
            });
        }
        
        const userRole = req.user.role ? req.user.role.toLowerCase() : '';
        const lowerAllowedRoles = allowedRoles.map(r => r.toLowerCase());

        if (!lowerAllowedRoles.includes(userRole)) {
            console.warn(`[AUTH_DEBUG] Role mismatch. User: ${req.user.id}, Token Role: ${userRole}, Allowed: ${lowerAllowedRoles}`);
            return res.status(403).json({
                success: false,
                message: `Permission denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.user.role}`,
            });
        }
        next();
    };
};

module.exports = roleMiddleware;
