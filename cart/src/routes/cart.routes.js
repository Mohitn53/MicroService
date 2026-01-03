
const {addToCart, getCart, updateCartItem, removeCartItem, clearCart} = require('../controller/cart.controller')
const createAuthMiddleware = require('../middleware/auth.middleware')
const express= require('express')

const router = express.Router()

router.post('/items',createAuthMiddleware,addToCart)
router.patch('/items/:productId',createAuthMiddleware,updateCartItem)
router.delete('/items/:productId',createAuthMiddleware,removeCartItem)
router.get('/',createAuthMiddleware,getCart)
router.delete('/', createAuthMiddleware, clearCart);

module.exports = router