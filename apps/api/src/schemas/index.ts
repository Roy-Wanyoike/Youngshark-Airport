import Joi from 'joi';

/**
 * Joi validation schemas — gate every request before it reaches the controller.
 */

export const registrationSchema = Joi.object({
  Name: Joi.string().min(2).max(64).required(),
  Email: Joi.string().email().required(),
  Password: Joi.string()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$'))
    .required()
    .messages({
      'string.pattern.base':
        'Password must be at least 8 characters and include upper, lower, digit, and special character.',
    }),
  ConfirmPassword: Joi.any().valid(Joi.ref('Password')).required(),
});

export const loginSchema = Joi.object({
  Email: Joi.string().email().required(),
  Password: Joi.string().required(),
});

export const addBookingSchema = Joi.object({
  Destination: Joi.string().min(2).max(64).required(),
  TravelDate: Joi.string()
    .isoDate()
    .required()
    .messages({ 'string.isoDate': 'TravelDate must be a valid ISO date.' }),
});

export const updateBookingSchema = addBookingSchema;
