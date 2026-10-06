"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.home = home;
const bcrypt_1 = __importDefault(require("bcrypt"));
const uuid_1 = require("uuid");
const db_1 = require("../services/db");
const jwt_1 = require("../services/jwt");
const index_1 = require("../schemas/index");
/**
 * Auth controller — registration + login.
 *
 * Endpoints (mounted under /api/auth):
 *   POST /register
 *   POST /login
 *   GET  /home   (protected)
 */
async function register(req, res) {
    const { error } = index_1.registrationSchema.validate(req.body);
    if (error) {
        return res.status(422).json({ error: error.details[0].message });
    }
    const { Name, Email, Password } = req.body;
    const id = (0, uuid_1.v4)();
    const hashedPassword = await bcrypt_1.default.hash(Password, 10);
    try {
        await db_1.db.exec('RegisterUser', { id, name: Name, email: Email, password: hashedPassword });
        return res.status(201).json({ message: 'User registered' });
    }
    catch (error) {
        console.error('[auth.register]', error);
        return res.status(500).json({ error: 'Failed to register user', detail: error.message });
    }
}
async function login(req, res) {
    const { error } = index_1.loginSchema.validate(req.body);
    if (error) {
        return res.status(422).json({ error: error.details[0].message });
    }
    const { Email, Password } = req.body;
    try {
        const result = await db_1.db.exec('getUserByEmail', { email: Email });
        const users = result.recordset;
        if (!users.length) {
            return res.status(404).json({ error: 'User not found' });
        }
        const user = users[0];
        const valid = await bcrypt_1.default.compare(Password, user.Password);
        if (!valid) {
            return res.status(404).json({ error: 'User not found' });
        }
        const token = (0, jwt_1.signToken)({
            Id: user.Id,
            Name: user.Name,
            Email: user.Email,
            Role: user.Role,
        });
        return res.status(200).json({
            message: 'User Logged in',
            token,
            role: user.Role,
            name: user.Name,
        });
    }
    catch (error) {
        console.error('[auth.login]', error);
        return res.status(500).json({ error: 'Failed to login', detail: error.message });
    }
}
function home(req, res) {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    return res.status(200).json({ message: `Welcome ${req.user.Name}` });
}
//# sourceMappingURL=auth.controller.js.map