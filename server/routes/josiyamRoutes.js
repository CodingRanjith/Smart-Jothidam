const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/authMiddleware');
const josiyamController = require('../controllers/josiyamController');

/**
 * @route   POST /api/josiyam/single
 * @desc    Single-person 20-category josiyam (chart + categories + summary)
 * @access  Private
 */
router.post('/single', authenticate, josiyamController.single);

/**
 * @route   POST /api/josiyam/couple
 * @desc    Couple compatibility (25 categories + charts + summary)
 * @access  Private
 */
router.post('/couple', authenticate, josiyamController.couple);

/**
 * @route   GET /api/josiyam/result/:resultId
 * @desc    Load a previously saved josiyam result (ownership enforced)
 * @access  Private
 */
router.get('/result/:resultId', authenticate, josiyamController.getStoredResult);

module.exports = router;
