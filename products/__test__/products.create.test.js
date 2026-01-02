const request = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const app = require("../src/app");
const productModel = require("../src/models/product.model");

describe("POST /products", () => {
  let sellerToken;
  let userToken;

  beforeEach(() => {
    sellerToken = jwt.sign(
      { id: new mongoose.Types.ObjectId(), role: "seller" },
      process.env.JWT_SECRET
    );

    userToken = jwt.sign(
      { id: new mongoose.Types.ObjectId(), role: "user" },
      process.env.JWT_SECRET
    );
  });

  afterEach(async () => {
    await productModel.deleteMany({});
  });

  it("should create product successfully for seller", async () => {
    const res = await request(app)
      .post("/products")
      .set("Cookie", [`token=${sellerToken}`])
      .send({
        title: "Nike Shoes",
        desc: "Running shoes",
        price: { amount: 2999, currency: "INR" },
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Product created successfully");
    expect(res.body.product.title).toBe("Nike Shoes");
  });

  it("should fail if token is missing", async () => {
    const res = await request(app).post("/products").send({
      title: "Shoes",
      price: { amount: 1000 },
    });

    expect(res.statusCode).toBe(401);
  });

  it("should fail if user role is not seller/admin", async () => {
    const res = await request(app)
      .post("/products")
      .set("Cookie", [`token=${userToken}`])
      .send({
        title: "Shoes",
        price: { amount: 1000 },
      });

    expect(res.statusCode).toBe(403);
  });

  it("should fail if title is missing", async () => {
    const res = await request(app)
      .post("/products")
      .set("Cookie", [`token=${sellerToken}`])
      .send({
        price: { amount: 1000 },
      });

    expect(res.statusCode).toBe(422);
  });

  it("should fail if price amount is missing", async () => {
    const res = await request(app)
      .post("/products")
      .set("Cookie", [`token=${sellerToken}`])
      .send({
        title: "Shoes",
        price: {},
      });

    expect(res.statusCode).toBe(422);
  });
});
