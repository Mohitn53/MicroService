const request = require("supertest");
const bcrypt = require("bcryptjs");
const app = require("../src/app");
const userModel = require("../src/models/user.model");

describe("POST /auth/login", () => {

  const userData = {
    username: "login_user",
    email: "loginuser@gmail.com",
    password: "Password123",
    fullname: {
      firstname: "Login",
      lastname: "User",
    },
    role: "user",
  };

  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    await userModel.create({
      ...userData,
      password: hashedPassword, // ✅ MUST BE HASHED
    });
  });

  it("should login successfully with correct credentials", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({
        email: userData.email,
        password: userData.password,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Login successful");
    expect(res.body.userId).toBeDefined();
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("should fail if password is incorrect", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({
        email: userData.email,
        password: "WrongPassword123",
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid credentials");
  });

});

