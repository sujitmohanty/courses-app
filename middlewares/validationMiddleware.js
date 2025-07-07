const { body, validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // In a real app, you'd render a page with these errors.
    // For simplicity, we'll send a 400 Bad Request response.
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const validateRegistration = [
  body("name", "Name is required").not().isEmpty().trim().escape(),
  body("email", "Please include a valid email").isEmail().normalizeEmail(),
  body("password", "Password must be 6 or more characters").isLength({
    min: 6,
  }),
  body("role", "A valid role must be selected").isIn(["student", "instructor"]),
  handleValidationErrors,
];

const validateCourseCreation = [
  body("title", "Title is required").not().isEmpty().trim().escape(),
  body("description", "Description is required")
    .not()
    .isEmpty()
    .trim()
    .escape(),
  handleValidationErrors,
];

module.exports = {
  validateRegistration,
  validateCourseCreation,
};
