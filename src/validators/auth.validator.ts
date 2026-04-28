import { body } from 'express-validator';

export const registerValidation = [
    body('email')
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail()
        .notEmpty()
        .withMessage('Email is required'),

    body('username')
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be 3-50 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage(
            'Username can only contain letters, numbers, and underscore'
        )
        .notEmpty()
        .withMessage('Username is required'),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')
        .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
        .withMessage(
            'Password must contain at least one letter and one number'
        ),

    body('firstName')
        .optional()
        .isLength({ max: 100 })
        .withMessage('First name too long'),

    body('lastName')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Last name too long'),
];

export const loginValidation = [
    body('email')
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail()
        .notEmpty()
        .withMessage('Email is required'),

    body('password').notEmpty().withMessage('Password is required'),
];

export const refreshTokenValidation = [
    body('refreshToken')
        .notEmpty()
        .withMessage('Refresh token is required')
        .isJWT()
        .withMessage('Invalid refresh token format'),
];
