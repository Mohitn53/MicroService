const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const getAuthCookie = () => {
  const userId = new mongoose.Types.ObjectId().toHexString();

  const payload = {
    id: userId,
    role: "user"
  };

  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET || "testsecret"
  );

  // ✅ BACKWARD COMPATIBLE
  const cookie = [`token=${token}`];

  // attach userId for tests that need ownership
  cookie.userId = userId;

  return cookie;
};

module.exports = { getAuthCookie };
