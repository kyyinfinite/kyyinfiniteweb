const express = require('express');
const { adminAuthMiddleware } = require('../middlewares/adminAuthMiddleware');
const {
  verifyLicense,
  listLicenseKeysAdmin,
  revokeLicenseKey,
  resetActivations,
} = require('../controllers/licenseController');

// Publik — dipanggil dari script premium yang sedang jalan di mesin user.
// Dipasang di server.js sebagai /api/v1/license
const publicRouter = express.Router();
publicRouter.post('/verify', verifyLicense);

// Admin — manajemen license key. Dipasang di server.js sebagai /api/admin/license-keys
const adminRouter = express.Router();
adminRouter.get('/', adminAuthMiddleware, listLicenseKeysAdmin);
adminRouter.patch('/:id/revoke', adminAuthMiddleware, revokeLicenseKey);
adminRouter.post('/:id/reset-activations', adminAuthMiddleware, resetActivations);

module.exports = { publicRouter, adminRouter };
