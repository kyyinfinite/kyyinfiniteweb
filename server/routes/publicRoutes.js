const express = require('express');
const { getContributor } = require('../controllers/publicController');

const router = express.Router();

router.get('/contributors/:uid', getContributor);

module.exports = router;
