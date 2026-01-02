const request = require("supertest");
const mongoose = require("mongoose");

const app = require("../src/app");
const productModel = require("../src/models/product.model");

describe("GET /products", () => {

  beforeEach(async () => {
    await productModel.insertMany([
      {
        title: "Nike Shoes",
        desc: "Running shoes",
        price: { amount: 2999, currency: "INR" },
        seller: new mongoose.Types.ObjectId(),
      },
      {
        title: "Adidas Shoes",
        desc: "Sports shoes",
        price: { amount: 3999, currency: "INR" },
        seller: new mongoose.Types.ObjectId(),
      },
      {
        title: "Puma T-Shirt",
        desc: "Cotton t-shirt",
        price: { amount: 999, currency: "INR" },
        seller: new mongoose.Types.ObjectId(),
      },
    ]);
  });

  afterEach(async () => {
    await productModel.deleteMany({});
  });

  /* ----------------------------- BASIC ----------------------------- */

  it("should fetch all products", async () => {
    const res = await request(app).get("/products");

    expect(res.statusCode).toBe(200);
    expect(res.body.products.length).toBe(3);
    expect(res.body.total).toBe(3);
  });

  it("should return empty list if no products exist", async () => {
    await productModel.deleteMany({});

    const res = await request(app).get("/products");

    expect(res.statusCode).toBe(200);
    expect(res.body.products.length).toBe(0);
    expect(res.body.total).toBe(0);
  });

  /* ----------------------------- SEARCH ----------------------------- */

  it("should search products by query", async () => {
    const res = await request(app).get("/products?q=shoes");

    expect(res.statusCode).toBe(200);
    expect(res.body.products.length).toBe(2);

    const titles = res.body.products.map(p => p.title);
    expect(titles).toEqual(
      expect.arrayContaining(["Nike Shoes", "Adidas Shoes"])
    );
  });

  /* ----------------------------- PRICE FILTER ----------------------------- */

  it("should filter products by price range", async () => {
    const res = await request(app)
      .get("/products")
      .query({ minPrice: 1000, maxPrice: 3000 });

    expect(res.statusCode).toBe(200);
    expect(res.body.products.length).toBe(1);
    expect(res.body.products[0].title).toBe("Nike Shoes");
  });

  /* ----------------------------- PAGINATION ----------------------------- */

  it("should paginate products using skip and limit", async () => {
    const res = await request(app)
      .get("/products")
      .query({ skip: 1, limit: 1 });

    expect(res.statusCode).toBe(200);
    expect(res.body.products.length).toBe(1);
    expect(res.body.count).toBe(1);
  });

});
