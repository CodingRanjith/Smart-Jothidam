const express = require('express');
const router = express.Router();

const partnerController = require('../controllers/partnerController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/', authenticate, partnerController.list);
router.post('/', authenticate, partnerController.create);

module.exports = router;
