"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signToken = signToken;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = require("../config/index");
/**
 * JWT helpers — single source of truth for sign + verify.
 */
function signToken(user) {
    return jsonwebtoken_1.default.sign({ Id: user.Id, Name: user.Name, Email: user.Email, Role: user.Role }, index_1.config.jwtSecret, { expiresIn: index_1.config.jwtTtl });
}
function verifyToken(token) {
    return jsonwebtoken_1.default.verify(token, index_1.config.jwtSecret);
}
//# sourceMappingURL=jwt.js.map