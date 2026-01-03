const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const app = require("../src/app");
const Cart = require("../src/models/cart.model");

describe("POST /cart/items", () => {
  let token;
  let userId;
  let productId;

  beforeAll(() => {
    userId = new mongoose.Types.ObjectId();
    productId = new mongoose.Types.ObjectId();

    token = jwt.sign(
      { id: userId },
      process.env.JWT_SECRET || "testsecret"
    );
  });

  afterEach(async () => {
    await Cart.deleteMany();
  });

  it("should create cart and add item", async () => {
    const res = await request(app)
      .post("/cart/items")
      .set("Cookie", [`token=${token}`])
      .send({
        productId,
        quantity: 2
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Item added to cart");

    const cart = await Cart.findOne({ user: userId });
    expect(cart).not.toBeNull();
    expect(cart.items.length).toBe(1);
    expect(cart.items[0].quantity).toBe(2);
  });

  it("should increment quantity if product already exists", async () => {
    await Cart.create({
      user: userId,
      items: [{ productId, quantity: 1 }]
    });

    await request(app)
      .post("/cart/items")
      .set("Cookie", [`token=${token}`])
      .send({
        productId,
        quantity: 3
      });

    const cart = await Cart.findOne({ user: userId });
    expect(cart.items[0].quantity).toBe(4);
  });

  it("should fail if quantity <= 0", async () => {
    const res = await request(app)
      .post("/cart/items")
      .set("Cookie", [`token=${token}`])
      .send({
        productId,
        quantity: 0
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid quantity");
  });

  it("should fail if token is missing", async () => {
    const res = await request(app)
      .post("/cart/items")
      .send({
        productId,
        quantity: 2
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Unauthorized");
  });
});
