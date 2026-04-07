const { body, validationResult } = require('express-validator');
const userService = require('../services/userService');
const connectDB = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const normalizePhone = (value) =>
  String(value ?? '')
    .trim()
    .replace(/[\s\-()]/g, '')
    .toLowerCase();

/**
 * @route   POST /auth/register
 * @desc    Register new user (phone + password) and create profile in MongoDB
 * @access  Public
 */
const register = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const { name, phone, password, dob, birthTime, birthPlace } = req.body;

    const { user, token } = await userService.registerUser({
      phone,
      password,
      name,
      dob: dob ? new Date(dob) : undefined,
      birthTime,
      birthPlace,
    });

    return successResponse(
      res,
      'User registered successfully',
      { user, token },
      201
    );
  } catch (error) {
    console.error('Registration error:', error);
    const mongoBlob = [
      String(error.message || ''),
      String(error.errmsg || ''),
      String(error.errorResponse?.errmsg || ''),
      String(error.cause?.message || ''),
      String(error.cause?.errmsg || ''),
    ].join(' ');
    const dupKey =
      error.code === 11000 ||
      error.cause?.code === 11000 ||
      /E11000|duplicate key error/i.test(mongoBlob);
    if (dupKey) {
      const uidField = connectDB.OBSOLETE_UID_FIELD || 'firebaseUid';
      const key = error.keyPattern || {};
      if (
        key[uidField] != null ||
        new RegExp(uidField, 'i').test(mongoBlob)
      ) {
        console.error(
          `E11000 on obsolete uid field (${uidField}): drop users index ${uidField}_1 in MongoDB or redeploy so startup cleanup runs.`
        );
        return errorResponse(
          res,
          'Registration is temporarily unavailable. Please try again later.',
          503,
          process.env.NODE_ENV === 'production' ? undefined : error.message
        );
      }
      return errorResponse(
        res,
        'This phone number is already registered',
        409,
        error.message
      );
    }
    return errorResponse(
      res,
      'Failed to register user',
      500,
      error.message
    );
  }
};

/**
 * @route   POST /auth/login
 * @desc    Login with phone + password and issue JWT
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const { phone, password } = req.body;
    const { token, user } = await userService.loginUser({ phone, password });

    return successResponse(res, 'Login successful', { token, user }, 200);
  } catch (error) {
    console.error('Login error:', error);
    const statusCode = error?.statusCode || 500;
    return errorResponse(res, error.message || 'Failed to login', statusCode);
  }
};

/**
 * @route   POST /auth/verify
 * @desc    Verify JWT and return current user profile
 * @access  Private
 */
const verifyToken = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await userService.getProfile(userId);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(
      res,
      'Token verified successfully',
      user
    );
  } catch (error) {
    console.error('Token verification error:', error);
    return errorResponse(
      res,
      'Failed to verify token',
      500,
      error.message
    );
  }
};

/**
 * @route   GET /profile
 * @desc    Get current user profile
 * @access  Private
 */
const getProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await userService.getProfile(userId);

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(
      res,
      'Profile retrieved successfully',
      user
    );
  } catch (error) {
    console.error('Get profile error:', error);
    return errorResponse(
      res,
      'Failed to get profile',
      500,
      error.message
    );
  }
};

/**
 * @route   PUT /profile
 * @desc    Update user profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const { userId } = req.user;
    const { name, dob, birthTime, birthPlace, phone } = req.body;

    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (dob !== undefined) updateData.dob = new Date(dob);
    if (birthTime !== undefined) updateData.birthTime = birthTime;
    if (birthPlace !== undefined) updateData.birthPlace = birthPlace;
    if (phone !== undefined) updateData.phone = phone;

    const user = await userService.updateUserProfile(userId, updateData);

    return successResponse(
      res,
      'Profile updated successfully',
      user
    );
  } catch (error) {
    console.error('Update profile error:', error);
    return errorResponse(
      res,
      'Failed to update profile',
      500,
      error.message
    );
  }
};

/**
 * @route   POST /auth/forgot-password
 * @desc    Request password reset (Module 1 checklist)
 * @access  Public
 */
const forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const { phone } = req.body;
    await userService.forgotPassword({ phone });

    // Always return a generic response to prevent account enumeration.
    return successResponse(res, 'reset_sent', null, 200);
  } catch (error) {
    console.error('Forgot password error:', error);
    const statusCode = error?.statusCode || 500;
    return errorResponse(res, error.message || 'Failed to request reset', statusCode);
  }
};

/**
 * @route   POST /auth/reset-password
 * @desc    Reset password using reset token (Module 1 checklist)
 * @access  Public
 */
const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const { token, newPassword } = req.body;
    await userService.resetPassword({ token, newPassword });

    return successResponse(res, 'password_updated', null, 200);
  } catch (error) {
    console.error('Reset password error:', error);
    const statusCode = error?.statusCode || 500;
    return errorResponse(res, error.message || 'Failed to reset password', statusCode);
  }
};

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('phone')
    .notEmpty()
    .withMessage('Phone is required')
    .customSanitizer(normalizePhone)
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Invalid phone number format'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('dob')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  body('birthTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Birth time must be in HH:mm format'),
  body('birthPlace')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Birth place cannot be empty'),
];

const loginValidation = [
  body('phone')
    .notEmpty()
    .withMessage('Phone is required')
    .customSanitizer(normalizePhone)
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Invalid phone number format'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
];

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('dob')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  body('birthTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Birth time must be in HH:mm format'),
  body('birthPlace')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Birth place cannot be empty'),
  body('phone')
    .optional()
    .customSanitizer((v) => {
      if (v === undefined || v === null || String(v).trim() === '') return undefined;
      return normalizePhone(v);
    })
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Invalid phone number format'),
];

const forgotPasswordValidation = [
  body('phone')
    .notEmpty()
    .withMessage('Phone is required')
    .customSanitizer(normalizePhone)
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Invalid phone number format'),
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Token is required'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long'),
];

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyToken,
  getProfile,
  updateProfile,
  registerValidation,
  loginValidation,
  updateProfileValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
};
