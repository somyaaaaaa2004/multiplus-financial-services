const express = require('express');
const router = express.Router();
const financialHealthController = require('../controllers/financialHealthController');
const authMiddleware = require('../middlewares/authMiddleware');

// All financial health routes require JWT authentication
router.get('/demo', authMiddleware, financialHealthController.getDemo);
router.post('/score', authMiddleware, financialHealthController.calculateScore);

module.exports = router;
