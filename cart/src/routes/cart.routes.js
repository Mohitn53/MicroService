
const {addToCart} = require('../controller/cart.controller')
const createAuthMiddleware = require('../middleware/auth.middleware')
const express= require('express')

const router = express.Router()

router.post('/items',createAuthMiddleware,addToCart)


module.exports = router