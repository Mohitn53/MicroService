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
const getProducts = async (req, res) => {
  try {
    let {
      q,
      minPrice,
      maxPrice,
      skip = 0,
      limit = 20,
    } = req.query;

    skip = Number(skip);
    limit = Number(limit);

    const filter = {};

    /* ----------------------------- SEARCH ----------------------------- */
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { desc: { $regex: q, $options: "i" } },
      ];
    }

    /* ----------------------------- PRICE FILTER ----------------------------- */
    if (minPrice || maxPrice) {
      filter["price.amount"] = {};

      if (minPrice) {
        filter["price.amount"].$gte = Number(minPrice);
      }

      if (maxPrice) {
        filter["price.amount"].$lte = Number(maxPrice);
      }
    }

    /* ----------------------------- QUERY DB ----------------------------- */
    const products = await productModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await productModel.countDocuments(filter);

    return res.status(200).json({
      message: "Products fetched successfully",
      total,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("GET PRODUCTS ERROR 👉", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = { 
    createProduct,
    getProducts,
 };


