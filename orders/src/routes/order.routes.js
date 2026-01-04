const { createOrder } = require('../controllers/order.controller')
const authMiddleware = require('../middlewares/auth.middleware')
const  { createOrderValidation, updateAddressValidation } = require('../middlewares/validator.middleware')
const router = require('express').Router()

router.post('/',authMiddleware,createOrderValidation,createOrder)

module.exports = router