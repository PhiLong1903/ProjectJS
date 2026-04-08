const auth_middleware = require("../middlewares/auth.middleware");
exports.authorize = auth_middleware.authorize;
exports.authenticate = auth_middleware.authenticate;
// Canonical names requested by coding standard
exports.CheckLogin = auth_middleware.authenticate;
exports.CheckRole = auth_middleware.authorize;
// Backward-compatible aliases
exports.checkLogin = exports.CheckLogin;
exports.checkRole = exports.CheckRole;
