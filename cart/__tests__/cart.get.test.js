const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const app = require("../src/app");
const Cart = require("../src/models/cart.model");

describe("GET /cart", () => {
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

  it("should return empty cart if none exists", async () => {
    const res = await request(app)
      .get("/cart")
      .set("Cookie", [`token=${token}`]);

    expect(res.statusCode).toBe(200);
    expect(res.body.items).toEqual([]);
  });

  it("should return cart items if cart exists", async () => {
    await Cart.create({
      user: userId,
      items: [{ productId, quantity: 2 }]
    });

    const res = await request(app)
      .get("/cart")
      .set("Cookie", [`token=${token}`]);

    expect(res.statusCode).toBe(200);
    expect(res.body.items.length).toBe(1);
    expect(res.body.items[0].quantity).toBe(2);
  });

  it("should fail if token is missing", async () => {
    const res = await request(app).get("/cart");

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Unauthorized");
  });
});
