const express = require('express');
const router = express.Router();
const { getUsers, blockUser, deleteUser, getDashboardStats } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, getUsers);
router.get('/dashboard-stats', protect, adminOnly, getDashboardStats);
router.put('/:id/block', protect, adminOnly, blockUser);
router.delete('/:id', protect, adminOnly, deleteUser);

module.exports = router;
