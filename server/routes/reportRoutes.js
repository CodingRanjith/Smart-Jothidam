const express = require('express');

const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const reportController = require('../controllers/reportController');

/**
 * @route   GET /api/report/pdf
 * @desc    Premium PDF export for a stored josiyam result
 * @access  Private
 */
router.get('/pdf', authenticate, reportController.pdf);

module.exports = router;
