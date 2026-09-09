const express = require('express');
const { adminAuthMiddleware } = require('../middlewares/adminAuthMiddleware');
const { listIncidents, createIncident, updateIncident, deleteIncident } = require('../controllers/incidentController');

const router = express.Router();

router.get('/incidents', listIncidents);
router.post('/incidents', adminAuthMiddleware, createIncident);
router.put('/incidents/:id', adminAuthMiddleware, updateIncident);
router.delete('/incidents/:id', adminAuthMiddleware, deleteIncident);

module.exports = router;
