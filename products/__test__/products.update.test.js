const request = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const app = require("../src/app");
const productModel = require("../src/models/product.model");

describe("PATCH /products/:id", () => {
  let sellerId;
  let sellerToken;
  let otherSellerToken;
  let product;

  beforeEach(async () => {
    sellerId = new mongoose.Types.ObjectId();

    sellerToken = jwt.sign(
      { id: sellerId, role: "seller" },
      process.env.JWT_SECRET
    );

    otherSellerToken = jwt.sign(
      { id: new mongoose.Types.ObjectId(), role: "seller" },
      process.env.JWT_SECRET
    );

    product = await productModel.create({
      title: "Old Title",
      desc: "Old desc",
      price: { amount: 1000, currency: "INR" },
      seller: sellerId,
    });
  });

  afterEach(async () => {
    await productModel.deleteMany({});
  });

  /* -------------------- SUCCESS -------------------- */
  it("should update product if seller owns it", async () => {
    const res = await request(app)
      .patch(`/products/${product._id}`)
      .set("Cookie", [`token=${sellerToken}`])
      .send({
        title: "New Title",
        price: { amount: 1500 },
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Product updated successfully");
    expect(res.body.product.title).toBe("New Title");

    const updated = await productModel.findById(product._id);
    expect(updated.price.amount).toBe(1500);
  });

  /* -------------------- UNAUTHORIZED -------------------- */
  it("should fail if token is missing", async () => {
    const res = await request(app)
      .patch(`/products/${product._id}`)
      .send({ title: "New" });

    expect(res.statusCode).toBe(401);
  });

  /* -------------------- FORBIDDEN (NOT OWNER) -------------------- */
  it("should fail if seller does not own product", async () => {
    const res = await request(app)
      .patch(`/products/${product._id}`)
      .set("Cookie", [`token=${otherSellerToken}`])
      .send({ title: "Hacked" });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("Forbidden");
  });

  /* -------------------- INVALID ID -------------------- */
  it("should return 400 for invalid product id", async () => {
    const res = await request(app)
      .patch("/products/invalid-id")
      .set("Cookie", [`token=${sellerToken}`])
      .send({ title: "Test" });

    expect(res.statusCode).toBe(400);
  });

  /* -------------------- NOT FOUND -------------------- */
  it("should return 404 if product does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .patch(`/products/${fakeId}`)
      .set("Cookie", [`token=${sellerToken}`])
      .send({ title: "Test" });

    expect(res.statusCode).toBe(404);
  });
});
