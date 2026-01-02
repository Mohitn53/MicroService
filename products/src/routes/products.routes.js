const router = require('express').Router()
const multer = require('multer')
const createAuthMiddleware = require('../middlewares/auth.middleware')
const {createProduct} = require('../controllers/product.controller')
const upload = multer()

router.post('/',createAuthMiddleware(['admin','seller']) ,upload.array('image',5),createProduct)

module.exports = router