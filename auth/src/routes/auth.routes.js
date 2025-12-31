const express= require('express')
const router = express.Router()
const {registerUserValidation,
        loginValidation,
        addUserAddressValidation} = require('../middlewares/validator.middleware')
const {registerController,loginController,meController,logoutController,
            getAddress,
        addAddress,
        deleteAddress,
} = require('../controller/auth.controller')
const authMiddleware = require('../middlewares/auth.middleware')

router.post('/register',registerUserValidation,registerController)
router.post('/login',loginValidation,loginController)
router.get('/me',authMiddleware,meController)
router.get('/logout',logoutController)

router.get("/user/me/address", authMiddleware, getAddress);
router.post("/user/me/address",addUserAddressValidation,authMiddleware, addAddress);
router.delete("/user/me/address", authMiddleware, deleteAddress);


module.exports = router