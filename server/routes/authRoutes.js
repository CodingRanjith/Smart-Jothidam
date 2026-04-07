const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

/**
 * @route   POST /auth/register
 * @desc    Register new user and create profile
 * @access  Private
 */
router.post(
  '/register',
  authController.registerValidation,
  authController.register
);

/**
 * @route   POST /auth/login
 * @desc    Login with phone + password and issue JWT
 * @access  Public
 */
router.post('/login', authController.loginValidation, authController.login);

/**
 * @route   POST /auth/forgot-password
 * @desc    Request password reset for a phone number
 * @access  Public
 */
router.post(
  '/forgot-password',
  authController.forgotPasswordValidation,
  authController.forgotPassword
);

/**
 * @route   POST /auth/reset-password
 * @desc    Reset password using reset token
 * @access  Public
 */
router.post(
  '/reset-password',
  authController.resetPasswordValidation,
  authController.resetPassword
);

/**
 * @route   GET /auth/verify
 * @desc    Verify JWT and return current user profile
 * @access  Private
 */
router.get('/verify', authenticate, authController.verifyToken);

module.exports = router;
