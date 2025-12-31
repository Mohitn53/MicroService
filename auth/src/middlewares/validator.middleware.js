const { body, validationResult } = require("express-validator");

const registerUserValidation = [

  // 🔹 username
  body("username")
    .trim()
    .notEmpty().withMessage("Username is required")
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3 and 20 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can contain only letters, numbers, and underscores"),

  // 🔹 email
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email format")
    .normalizeEmail(),

  // 🔹 password
  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/).withMessage("Password must contain at least one number"),

  // 🔹 fullname.firstname
  body("fullname.firstname")
    .trim()
    .notEmpty().withMessage("First name is required")
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters"),

  // 🔹 fullname.lastname
  body("fullname.lastname")
    .trim()
    .notEmpty().withMessage("Last name is required")
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters"),

  // 🔹 role (optional)
  body("role")
    .optional()
    .isIn(["user", "seller"])
    .withMessage("Role must be either user or seller"),

  // 🔹 address.street (optional)
  body("address.street")
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Street must be at least 3 characters"),

  // 🔹 address.city (optional)
  body("address.city")
    .optional()
    .trim()
    .isAlpha("en-IN", { ignore: " " })
    .withMessage("City must contain only letters"),

  // 🔹 address.zipcode (optional)
  body("address.zipcode")
    .optional()
    .isPostalCode("IN")
    .withMessage("Invalid Indian zipcode"),

  // 🔹 address.state (optional)
  body("address.state")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("State must be valid"),

  // 🔹 address.country (optional)
  body("address.country")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Country must be valid"),

  // 🚨 FINAL VALIDATION HANDLER
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    next();
  }
];

module.exports = { 
    registerUserValidation,
}
