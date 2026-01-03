const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const app = require("../src/app");
const Cart = require("../src/models/cart.model");

describe("DELETE /cart", () => {
  let token;
  let userId;

  beforeAll(() => {
    userId = new mongoose.Types.ObjectId();

    token = jwt.sign(
      { id: userId },
      process.env.JWT_SECRET || "testsecret"
    );
  });

  afterEach(async () => {
    await Cart.deleteMany();
  });

  it("should clear cart if cart exists", async () => {
    await Cart.create({
      user: userId,
      items: [
        { productId: new mongoose.Types.ObjectId(), quantity: 2 }
      ]
    });

    const res = await request(app)
      .delete("/cart")
      .set("Cookie", [`token=${token}`]);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Cart cleared");

    const cart = await Cart.findOne({ user: userId });
    expect(cart).toBeNull();
  });

  it("should return success even if cart does not exist", async () => {
    const res = await request(app)
      .delete("/cart")
      .set("Cookie", [`token=${token}`]);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Cart cleared");
  });

  it("should fail if token is missing", async () => {
    const res = await request(app).delete("/cart");

    expect(res.statusCode).toBe(401);
  });
});
