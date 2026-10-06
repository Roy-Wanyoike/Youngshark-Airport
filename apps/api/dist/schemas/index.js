"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBookingSchema = exports.addBookingSchema = exports.loginSchema = exports.registrationSchema = void 0;
const joi_1 = __importDefault(require("joi"));
/**
 * Joi validation schemas — gate every request before it reaches the controller.
 */
exports.registrationSchema = joi_1.default.object({
    Name: joi_1.default.string().min(2).max(64).required(),
    Email: joi_1.default.string().email().required(),
    Password: joi_1.default.string()
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$'))
        .required()
        .messages({
        'string.pattern.base': 'Password must be at least 8 characters and include upper, lower, digit, and special character.',
    }),
    ConfirmPassword: joi_1.default.any().valid(joi_1.default.ref('Password')).required(),
});
exports.loginSchema = joi_1.default.object({
    Email: joi_1.default.string().email().required(),
    Password: joi_1.default.string().required(),
});
exports.addBookingSchema = joi_1.default.object({
    Destination: joi_1.default.string().min(2).max(64).required(),
    TravelDate: joi_1.default.string()
        .isoDate()
        .required()
        .messages({ 'string.isoDate': 'TravelDate must be a valid ISO date.' }),
});
exports.updateBookingSchema = exports.addBookingSchema;
//# sourceMappingURL=index.js.map