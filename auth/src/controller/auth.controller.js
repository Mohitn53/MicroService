const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken')
const registerController = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      fullname,   // ✅ destructure fullname as a whole
      role,
      address,
    } = req.body;

    // ✅ use correct model name
    const existingUser = await userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      username,
      email,
      password: hashedPassword,
      fullname, // ✅ now defined
      role,
      address,
    });
    const token = jwt.sign({
        id:user._id,
        role:user.role
    },process.env.JWT_SECRET)
    res.cookie("token",token,{
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly:true,
        secure:true
    })
    res.status(201).json({
      message: "User registered successfully",
      userId: user._id,
    });

  } catch (error) {
    console.error("REGISTER ERROR 👉", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  registerController,
};
