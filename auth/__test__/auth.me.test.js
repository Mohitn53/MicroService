const request = require("supertest");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const userModel = require("../src/models/user.model");

describe("GET /auth/me", () => {
  let token;
  let user;

  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash("Password123", 10);

    user = await userModel.create({
      username: "me_user",
      email: "meuser@gmail.com",
      password: hashedPassword,
      fullname: {
        firstname: "Me",
        lastname: "User",
      },
      role: "user",
    });

    token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET
    );
  });

  it("should return logged-in user details", async () => {
    const res = await request(app)
      .get("/auth/me")
      .set("Cookie", [`token=${token}`]);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User fetched successfully");
    expect(res.body.user.email).toBe("meuser@gmail.com");
    expect(res.body.user.password).toBeUndefined(); // password must not leak
  });

  it("should fail if token is missing", async () => {
    const res = await request(app).get("/auth/me");

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Unauthorized");
  });

  it("should fail if token is invalid", async () => {
    const res = await request(app)
      .get("/auth/me")
      .set("Cookie", ["token=invalidtoken"]);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Unauthorized");
  });

  it("should return 404 if user does not exist", async () => {
    const fakeToken = jwt.sign(
      { id: "64f000000000000000000000", role: "user" },
      process.env.JWT_SECRET
    );

    const res = await request(app)
      .get("/auth/me")
      .set("Cookie", [`token=${fakeToken}`]);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("User not found");
  });
});
