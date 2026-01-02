const router = require("express").Router();
const multer = require("multer");

const createAuthMiddleware = require("../middlewares/auth.middleware");
const { createProduct, getProducts , getProductById, updateProduct, deleteProduct, getSellerProducts } = require("../controllers/product.controller");
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
router.get("/:id", getProductById);

router.patch('/:id', createAuthMiddleware(["seller", "admin"]),updateProduct)
router.delete('/:id', createAuthMiddleware(["seller", "admin"]),deleteProduct)
router.get(
  "/seller/me",
  createAuthMiddleware(["seller", "admin"]),
  getSellerProducts
);


module.exports = router;
