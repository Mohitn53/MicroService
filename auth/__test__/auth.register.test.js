const request = require("supertest");
const app = require("../src/app");
const userModel = require("../src/models/user.model");

const validUser = {
  username: "test_user_123",
  email: "testuser123@gmail.com",
  password: "Password123",
  fullname: {
    firstname: "Test",
    lastname: "User"
  },
  role: "user",
  address: {
    street: "MG Road",
    city: "Mumbai",
    zipcode: "400001",
    state: "Maharashtra",
    country: "India"
  }
};

describe("POST /auth/register", () => {

  it("should register user successfully", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send(validUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("User registered successfully");
    expect(res.body.userId).toBeDefined();
  });

  it("should fail validation if required fields missing", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({
        email: "onlyemail@gmail.com"
      });

    expect(res.statusCode).toBe(422);
    expect(res.body.message).toBe("Validation failed");
  });

  it("should not allow duplicate email or username", async () => {
    await userModel.create({
      ...validUser,
      password: "hashedpassword"
    });

    const res = await request(app)
      .post("/auth/register")
      .send(validUser);

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe("User already exists");
  });

});
