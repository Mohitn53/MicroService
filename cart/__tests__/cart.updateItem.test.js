const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const app = require("../src/app");
const Cart = require("../src/models/cart.model");

describe("PATCH /cart/items/:productId", () => {
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

  it("should update quantity of existing item", async () => {
    await Cart.create({
      user: userId,
      items: [{ productId, quantity: 2 }]
    });

    const res = await request(app)
      .patch(`/cart/items/${productId}`)
      .set("Cookie", [`token=${token}`])
      .send({ quantity: 5 });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Cart updated");

    const cart = await Cart.findOne({ user: userId });
    expect(cart.items[0].quantity).toBe(5);
  });

  it("should remove item if quantity <= 0", async () => {
    await Cart.create({
      user: userId,
      items: [{ productId, quantity: 2 }]
    });

    const res = await request(app)
      .patch(`/cart/items/${productId}`)
      .set("Cookie", [`token=${token}`])
      .send({ quantity: 0 });

    expect(res.statusCode).toBe(200);

    const cart = await Cart.findOne({ user: userId });
    expect(cart.items.length).toBe(0);
  });

  it("should fail if cart does not exist", async () => {
    const res = await request(app)
      .patch(`/cart/items/${productId}`)
      .set("Cookie", [`token=${token}`])
      .send({ quantity: 3 });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Cart not found");
  });

  it("should fail if token is missing", async () => {
    const res = await request(app)
      .patch(`/cart/items/${productId}`)
      .send({ quantity: 3 });

    expect(res.statusCode).toBe(401);
  });
});
