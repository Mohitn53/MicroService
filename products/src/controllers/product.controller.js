const productModel = require("../models/product.model");
const uploadImageToImageKit = require("../services/imagekit.service");

const createProduct = async (req, res) => {
  try {
    const { title, description, price } = req.body;

    // Upload images to ImageKit
    let images = [];
    if (req.files && req.files.length > 0) {
      images = await Promise.all(
        req.files.map((file) =>
          uploadImageToImageKit(file.buffer, file.originalname)
        )
      );
    }

    const product = await productModel.create({
      title,
      description,
      price,
      seller: req.user.id,
      images,
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("CREATE PRODUCT ERROR 👉", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = { createProduct };
