"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTokenMiddleware = verifyTokenMiddleware;
const jwt_1 = require("../services/jwt");
function verifyTokenMiddleware(req, res, next) {
    const token = req.headers['token'];
    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    try {
        const decoded = (0, jwt_1.verifyToken)(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token', detail: error.message });
    }
}
//# sourceMappingURL=auth.js.map