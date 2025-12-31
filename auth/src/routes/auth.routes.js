const express= require('express')
const router = express.Router()
const {registerUserValidation,loginValidation,} = require('../middlewares/validator.middleware')
const {registerController,loginController,meController,logoutController} = require('../controller/auth.controller')
const authMiddleware = require('../middlewares/auth.middleware')

router.post('/register',registerUserValidation,registerController)
router.post('/login',loginValidation,loginController)
router.get('/me',authMiddleware,meController)
router.get('/logout',logoutController)



module.exports = router