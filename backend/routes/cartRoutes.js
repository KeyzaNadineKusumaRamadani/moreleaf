const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart, validateVoucher } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getCart);
router.post('/', protect, addToCart);
router.post('/voucher', protect, validateVoucher);
router.put('/:id', protect, updateCartItem);
router.delete('/:id', protect, removeFromCart);

module.exports = router;
