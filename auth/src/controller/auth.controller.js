const userModel = require('../models/user.model')
const registerController = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      fullname:{firstname,lastname},
      role,
      address,
    } = req.body;

    if (!username || !email || !password || !fullname) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      fullname,
      role,
      address,
    });

    res.status(201).json({
      message: "User registered successfully",
      userId: user._id,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
    registerController
}


