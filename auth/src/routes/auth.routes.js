const express= require('express')
const router = express.Router()
const {registerUserValidation} = require('../middlewares/validator.middleware')
const {registerController} = require('../controller/auth.controller')

router.post('/register',registerUserValidation,registerController)



module.exports = router