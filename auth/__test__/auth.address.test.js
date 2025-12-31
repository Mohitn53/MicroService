const request = require("supertest");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const userModel = require("../src/models/user.model");

describe("User Address APIs", () => {
  let token;
  let user;

  const addressData = {
    street: "MG Road",
    city: "Mumbai",
    zipcode: "400001",
    state: "Maharashtra",
    country: "India",
  };

  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash("Password123", 10);

    user = await userModel.create({
      username: "address_user",
      email: "address@gmail.com",
      password: hashedPassword,
      fullname: {
        firstname: "Address",
        lastname: "User",
      },
      role: "user",
    });

    token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET
    );
  });

  /* -------------------------------- GET -------------------------------- */

  it("should return user's address", async () => {
    await userModel.findByIdAndUpdate(user._id, { address: addressData });

    const res = await request(app)
      .get("/auth/user/me/address")
      .set("Cookie", [`token=${token}`]);

    expect(res.statusCode).toBe(200);
    expect(res.body.address.city).toBe("Mumbai");
  });

  it("should return null if address does not exist", async () => {
    const res = await request(app)
      .get("/auth/user/me/address")
      .set("Cookie", [`token=${token}`]);

    expect(res.statusCode).toBe(200);
    expect(res.body.address).toBeUndefined();
  });

  it("should fail if not authenticated (GET)", async () => {
    const res = await request(app).get("/auth/user/me/address");
    expect(res.statusCode).toBe(401);
  });

  /* -------------------------------- POST -------------------------------- */

  it("should add/update user's address", async () => {
    const res = await request(app)
      .post("/auth/user/me/address")
      .set("Cookie", [`token=${token}`])
      .send(addressData);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Address saved");
    expect(res.body.address.city).toBe("Mumbai");

    const userInDb = await userModel.findById(user._id);
    expect(userInDb.address.city).toBe("Mumbai");
  });

  it("should fail if not authenticated (POST)", async () => {
    const res = await request(app)
      .post("/auth/user/me/address")
      .send(addressData);

    expect(res.statusCode).toBe(401);
  });

  /* ------------------------------- DELETE ------------------------------- */

  it("should delete user's address", async () => {
    await userModel.findByIdAndUpdate(user._id, { address: addressData });

    const res = await request(app)
      .delete("/auth/user/me/address")
      .set("Cookie", [`token=${token}`]);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Address deleted");

    const userInDb = await userModel.findById(user._id);
    expect(userInDb.address).toBeUndefined();
  });

  it("should fail if not authenticated (DELETE)", async () => {
    const res = await request(app).delete("/auth/user/me/address");
    expect(res.statusCode).toBe(401);
  });
});
