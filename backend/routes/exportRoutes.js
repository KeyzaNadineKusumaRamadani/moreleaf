const express = require('express');
const router = express.Router();
const { exportOrdersExcel, exportProductsExcel } = require('../controllers/exportController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/orders', protect, adminOnly, exportOrdersExcel);
router.get('/products', protect, adminOnly, exportProductsExcel);

module.exports = router;
