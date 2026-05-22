const { body, validationResult, param } = require("express-validator");

const idRule = [
  param("id").isInt({ min: 1 }).withMessage("ID must be a positive number"),
];
// Validation Rules
const createStudentRules = [
  body("name")
    .notEmpty()
    .trim()
    .withMessage("Name cannot be empty")
    .isString()
    .withMessage("Invalid name")
    .isLength({ min: 2 })
    .withMessage("Name must contain at least 2 characters")
    .isLength({ max: 100 })
    .withMessage("Name is too long"),

  body("email")
    .notEmpty()
    .trim()
    .withMessage("Email cannot be empty")
    .isEmail()
    .withMessage("Invalid email")
    // With email uniqueness, check through dtb
    .isLength({ max: 100 })
    .withMessage("email is too long"),

  body("student_code")
    .notEmpty()
    .trim()
    .withMessage("Student Code cannot be empty")
    // With student_code uniqueness, check through dtb
    .isLength({ max: 20 })
    .withMessage("Student code is too long")
    .isLength({ min: 6 })
    .withMessage("Student code is too short")
    .matches(/^[A-Z]{2,4}\d{3,6}$/)
    .withMessage("Student code must match format e.g. STU001"),

  body("major")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Major cannot be too long")
    .isString()
    .withMessage("Major must be text only"),

  body("phone")
    .optional()
    .trim()
    .matches(/^(09|08)\d{8}$/)
    .withMessage("Phone must be 10 digits starting with 09 or 08"),
];

const updateStudentRules = [
  body("name")
    .optional()
    .trim()
    .isAlpha()
    .withMessage("Invalid name")
    .isLength({ min: 2 })
    .withMessage("Name must contain at least 2 characters")
    .isLength({ max: 100 })
    .withMessage("Name is too long"),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Invalid email")
    // With email uniqueness, check through dtb
    .isLength({ max: 100 })
    .withMessage("email is too long"),

  body("student_code")
    .optional()
    .trim()
    // With student_code uniqueness, check through dtb
    .isLength({ max: 20 })
    .withMessage("Student code is too long")
    .isLength({ min: 6 })
    .withMessage("Student code is too short")
    .matches(/^[A-Z]{2,4}\d{3,6}$/)
    .withMessage("Student code must match format e.g. STU001"),

  body("major")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Major cannot be too long")
    .isString()
    .withMessage("Major must be text only"),

  body("phone")
    .optional()
    .trim()
    .matches(/^(09|08)\d{8}$/)
    .withMessage("Phone must be 10 digits starting with 09 or 08"),
];

// For get/delete
const idParamRule = [...idRule];

module.exports = { createStudentRules, updateStudentRules, idParamRule };
