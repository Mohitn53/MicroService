const { createOrder } = require('../controllers/order.controller')
const authMiddleware = require('../middlewares/auth.middleware')

const router = require('express').Router()

router.post('/',authMiddleware,createOrder)

module.exports = router