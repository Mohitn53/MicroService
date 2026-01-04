const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrderById
} = require('../controllers/order.controller');

const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/', authMiddleware, createOrder);
router.get('/me', authMiddleware, getMyOrders);
router.get('/:id', authMiddleware, getOrderById);

module.exports = router;
