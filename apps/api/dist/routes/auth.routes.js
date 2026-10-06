"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const authRouter = (0, express_1.Router)();
authRouter.post('/register', auth_controller_1.register);
authRouter.post('/login', auth_controller_1.login);
authRouter.get('/home', auth_1.verifyTokenMiddleware, auth_controller_1.home);
exports.default = authRouter;
//# sourceMappingURL=auth.routes.js.map