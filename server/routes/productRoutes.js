const express = require('express');
const Product = require('../models/Product');
const { adminAuthMiddleware } = require('../middlewares/adminAuthMiddleware');
const { createProduct, updateProduct, listProductsAdmin } = require('../controllers/adminController');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).lean();
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list products', error: error.message });
  }
});

router.get('/admin/all', adminAuthMiddleware, listProductsAdmin);
router.post('/', adminAuthMiddleware, createProduct);
router.put('/:id', adminAuthMiddleware, updateProduct);

module.exports = router;
