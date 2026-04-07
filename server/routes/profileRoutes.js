const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

/**
 * @route   GET /profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/', authenticate, authController.getProfile);

/**
 * @route   PUT /profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/',
  authenticate,
  authController.updateProfileValidation,
  authController.updateProfile
);

module.exports = router;

