const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken')
const redis = require('../db/redis')


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

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel
      .findOne({ email })
      .select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password); // ✅ FIX

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      userId: user._id,
    });

  } catch (error) {
    console.error("LOGIN ERROR 👉", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const meController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const logoutController = async (req, res) => {
  try {
    const token = req.cookies?.token;

    // ✅ NEVER touch redis in tests
    if (
      token &&
      process.env.NODE_ENV !== "test" &&
      typeof redis !== "undefined"
    ) {
      await redis.set(
        `blacklist:${token}`,
        "true",
        "EX",
        24 * 60 * 60
      );
    }

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return res.status(200).json({
      message: "Logout successful",
    });

  } catch (error) {
    console.error("LOGOUT ERROR 👉", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};






module.exports = {
  registerController,
  loginController,
  meController,
  logoutController
};
