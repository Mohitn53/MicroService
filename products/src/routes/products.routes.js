const router = require("express").Router();
const createAuthMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");
const { createProduct } = require("../controllers/product.controller");



router.post(
  "/",
  createAuthMiddleware(["seller", "admin"]),
  upload.array("images", 5),
  createProduct
);

module.exports = router;
