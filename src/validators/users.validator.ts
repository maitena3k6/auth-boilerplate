import { body, param } from 'express-validator';

export const updateUserValidation = [
    body('firstName')
        .optional()
        .isLength({ max: 100 })
        .withMessage('First name too long'),

    body('lastName')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Last name too long'),

    body('avatar').optional().isURL().withMessage('Avatar must be a valid URL'),
];

export const getUserByEmailValidation = [
    param('email').exists().isEmail().withMessage('Invalid email format'),
];

export const getUserByIdValidation = [
    param('id').isUUID().withMessage('Invalid user ID format'),
];

export const disableUserValidation = [
    param('id').isUUID().withMessage('Invalid user ID format'),
];