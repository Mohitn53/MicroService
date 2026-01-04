const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const getAuthCookie = () => {
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    role: "user"
  };

  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET || "testsecret"
  );

  // supertest expects array of cookies
  return [`token=${token}`];
};

module.exports = { getAuthCookie };
