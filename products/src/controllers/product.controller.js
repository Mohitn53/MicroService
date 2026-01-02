const productModel = require("../models/product.model");

const createProduct = async (req, res) => {
  try {
    const { title, desc, price } = req.body;
    const images = (req.files || []).map((file) => ({
      url: file.path || "",
      thumbnail: "",
      id: file.filename || "",
    }));

    const product = await productModel.create({
      title,
      desc,
      price,
      seller: req.user.id, // from JWT
      images,
    });

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("CREATE PRODUCT ERROR 👉", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = { createProduct };
