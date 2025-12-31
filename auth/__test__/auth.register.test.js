const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user.model");

describe("POST /auth/register", () => {

  it("should register user successfully", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({
        username: "mohit123",
        email: "mohit@test.com",
        password: "password123",
        fullname: {
          firstname: "Mohit",
          lastname: "Nirmal",
        },
        role: "user",
        address: {
          street: "MG Road",
          city: "Mumbai",
          zipcode: "400001",
          state: "MH",
          country: "India",
        },
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("User registered successfully");
    expect(res.body.userId).toBeDefined();

    const user = await User.findOne({ email: "mohit@test.com" });
    expect(user).not.toBeNull();
    expect(user.fullname.firstname).toBe("Mohit");
  });

  it("should fail if required fields missing", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({
        email: "test@test.com",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("All fields required");
  });

  it("should not allow duplicate email or username", async () => {
    await User.create({
      username: "dupuser",
      email: "dup@test.com",
      password: "hashed",
      fullname: {
        firstname: "Test",
        lastname: "User",
      },
    });

    const res = await request(app)
      .post("/auth/register")
      .send({
        username: "dupuser",
        email: "dup@test.com",
        password: "password123",
        fullname: {
          firstname: "Another",
          lastname: "User",
        },
      });

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe("User already exists");
  });

});
