const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../src/app");

describe("GET /auth/logout", () => {

  it("should logout successfully and clear token cookie", async () => {
    // create a fake token
    const token = jwt.sign(
      { id: "64f000000000000000000000", role: "user" },
      process.env.JWT_SECRET
    );

    const res = await request(app)
      .get("/auth/logout")
      .set("Cookie", [`token=${token}`]);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Logout successful");

    // check cookie cleared
    const cookies = res.headers["set-cookie"];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toMatch(/token=;/);
  });

  it("should logout even if token is missing", async () => {
    const res = await request(app).get("/auth/logout");

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Logout successful");
  });

});
