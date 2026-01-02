const { body } = require("express-validator");

const createProductValidation = [
  body("title")
    .notEmpty()
    .withMessage("Title is required"),

  body("price.amount")
    .isNumeric()
    .withMessage("Price amount is required"),

  body("price.currency")
    .optional()
    .isIn(["USD", "INR"])
    .withMessage("Invalid currency"),
];

module.exports = { createProductValidation };
