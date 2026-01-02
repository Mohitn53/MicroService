const request = require("supertest");
const mongoose = require("mongoose");

const app = require("../src/app");
const productModel = require("../src/models/product.model");

describe("GET /products/:id", () => {
  let product;

  beforeEach(async () => {
    product = await productModel.create({
      title: "iPhone 15",
      desc: "Latest Apple phone",
      price: { amount: 79999, currency: "INR" },
      seller: new mongoose.Types.ObjectId(),
    });
  });

  afterEach(async () => {
    await productModel.deleteMany({});
  });

  /* -------------------- SUCCESS -------------------- */
  it("should return product by id", async () => {
    const res = await request(app).get(`/products/${product._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.product.title).toBe("iPhone 15");
    expect(res.body.product.price.amount).toBe(79999);
  });

  /* -------------------- NOT FOUND -------------------- */
  it("should return 404 if product does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app).get(`/products/${fakeId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Product not found");
  });

  /* -------------------- INVALID ID -------------------- */
  it("should return 400 for invalid product id", async () => {
    const res = await request(app).get("/products/invalid-id");

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid product id");
  });
});
