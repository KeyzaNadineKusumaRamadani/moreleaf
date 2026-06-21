const express = require('express');
const router = express.Router();
const { createOrder, uploadPaymentProof, getOrders, getOrderById, updateOrderStatus, getOrderStats } = require('../controllers/orderController');
const { generateInvoice } = require('../controllers/exportController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, upload.single('payment_proof'), createOrder);
router.post('/:id/payment-proof', protect, upload.single('payment_proof'), uploadPaymentProof);
router.get('/', protect, getOrders);
router.get('/stats', protect, adminOnly, getOrderStats);
router.get('/:id', protect, getOrderById);
router.get('/:id/invoice', protect, generateInvoice);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;