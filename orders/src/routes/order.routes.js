const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  updateOrderAddress,
  getSellerOrders
} = require('../controllers/order.controller');

const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/', authMiddleware, createOrder);
router.get('/me', authMiddleware, getMyOrders);
router.get('/:id', authMiddleware, getOrderById);
router.get('/seller', authMiddleware, getSellerOrders); 
router.patch('/:id/cancel', authMiddleware, cancelOrder);
router.patch('/:id/address', authMiddleware, updateOrderAddress);

module.exports = router;
