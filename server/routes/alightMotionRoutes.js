const express = require('express');
const { requireApiKey } = require('../middlewares/apiKeyAuthMiddleware');
const { sendActivation, verifyActivation } = require('../controllers/alightMotionController');

const router = express.Router();

router.post('/send', requireApiKey('am:premium'), sendActivation);
router.post('/verify', requireApiKey('am:premium'), verifyActivation);

module.exports = router;
