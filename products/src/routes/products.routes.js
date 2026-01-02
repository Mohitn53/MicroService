const router = require("express").Router();
const multer = require("multer");

const createAuthMiddleware = require("../middlewares/auth.middleware");
const { createProduct, getProducts } = require("../controllers/product.controller");
const { createProductValidation } = require("../validators/product.validator");
const validateRequest = require("../middlewares/validate.middleware");

const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/",
  createAuthMiddleware(["seller", "admin"]),
  upload.array("images", 5),
  createProductValidation,
  validateRequest,
  createProduct
);


router.get('/',getProducts)

module.exports = router;
