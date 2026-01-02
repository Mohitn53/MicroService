const request = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const app = require("../src/app");
const productModel = require("../src/models/product.model");

describe("GET /products/seller/me", () => {
  let sellerId;
  let sellerToken;

  beforeEach(async () => {
    sellerId = new mongoose.Types.ObjectId();

    sellerToken = jwt.sign(
      { id: sellerId, role: "seller" },
      process.env.JWT_SECRET
    );

    await productModel.insertMany([
      {
        title: "Seller Product 1",
        price: { amount: 1000, currency: "INR" },
        seller: sellerId,
      },
      {
        title: "Seller Product 2",
        price: { amount: 2000, currency: "INR" },
        seller: sellerId,
      },
      {
        title: "Other Seller Product",
        price: { amount: 3000, currency: "INR" },
        seller: new mongoose.Types.ObjectId(),
      },
    ]);
  });

  afterEach(async () => {
    await productModel.deleteMany({});
  });

  it("should return only logged-in seller products", async () => {
    const res = await request(app)
      .get("/products/seller/me")
      .set("Cookie", [`token=${sellerToken}`]);

    expect(res.statusCode).toBe(200);
    expect(res.body.products.length).toBe(2);
  });

  it("should fail if not authenticated", async () => {
    const res = await request(app).get("/products/seller/me");
    expect(res.statusCode).toBe(401);
  });
});
