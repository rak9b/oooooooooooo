const { hasPermission } = require("../utils/rolePermissions");

// Permission-based authorization middleware
// Usage: authorize('DOWNLINE:VIEW') or authorize('BANKING:APPROVE')
const authorize = (permission) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
                errorCode: "UNAUTHORIZED"
            });
        }

        if (!hasPermission(req.user.role, permission)) {
            return res.status(403).json({
                success: false,
                message: "Permission denied",
                errorCode: "PERMISSION_DENIED"
            });
        }

        next();
    };
};

// Role-based middleware (allow specific roles)
const allowRoles = (...roles) => {
    const flatRoles = roles.flat();
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }
        if (!flatRoles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: "Access denied for your role" });
        }
        next();
    };
};

// Scope enforcement — users can only access their own downline data
const enforceScope = (req, res, next) => {
    if (req.user.role === 'OWNER') {
        req.scopeFilter = {}; // Owner sees everything
    } else {
        req.scopeFilter = { parentId: req.user.id };
    }
    next();
};

module.exports = { authorize, allowRoles, enforceScope };
