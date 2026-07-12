const express = require('express');
const { userAuthMiddleware } = require('../middlewares/userAuthMiddleware');
const { getProfile, getUsageStats } = require('../controllers/userProfileController');

const router = express.Router();

router.get('/profile', userAuthMiddleware, getProfile);
router.get('/usage', userAuthMiddleware, getUsageStats);

module.exports = router;
