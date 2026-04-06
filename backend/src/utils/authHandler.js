const auth_middleware_1 = require("../middlewares/auth.middleware");
Object.defineProperty(exports, "authorize", { enumerable: true, get: function () { return auth_middleware_1.authorize; } });
Object.defineProperty(exports, "authenticate", { enumerable: true, get: function () { return auth_middleware_1.authenticate; } });
// Canonical names requested by coding standard
exports.CheckLogin = auth_middleware_1.authenticate;
exports.CheckRole = auth_middleware_1.authorize;
// Backward-compatible aliases
exports.checkLogin = exports.CheckLogin;
exports.checkRole = exports.CheckRole;
